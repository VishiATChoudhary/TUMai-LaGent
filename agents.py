from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.chains import SequentialChain, LLMChain
from langchain.chains.base import Chain
from langchain_core.runnables import RunnablePassthrough
from langchain.tools import Tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_experimental.utilities import PythonREPL
from pathlib import Path
from maintenance_agents import MaintenanceWorkerSearcher, MaintenanceWorkerContact


def read_prompt(prompt_file: str) -> str:
    prompt_path = Path(__file__).parent / "prompts" / prompt_file
    return prompt_path.read_text().strip()

class BaseAgent:
    def __init__(self, llm):
        self.llm = llm
        self.tools = []

    def add_tool(self, tool: Tool):
        self.tools.append(tool)

    def _use_tools(self, input_text: str) -> str:
        if not self.tools:
            return input_text
            
        # Use tools sequentially
        current_input = input_text
        tool_results = []
        
        for tool in self.tools:
            try:
                tool_result = tool.run(current_input)
                if tool_result:
                    # Print raw Tavily search results
                    if isinstance(tool, TavilySearchResults):
                        print("\nRaw Tavily Search Results:")
                        print(tool_result)
                        print("\n")
                    tool_results.append(f"Information from {tool.name}:\n{tool_result}")
            except Exception as e:
                print(f"Error using tool {tool.name}: {str(e)}")
                tool_results.append(f"Error using {tool.name}: {str(e)}")
        
        if tool_results:
            return f"{current_input}\n\nAdditional information:\n" + "\n\n".join(tool_results)
        return current_input

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement process method")

class Accumulator(BaseAgent):
    def __init__(self):
        self.blob_storage = []  # Simulated blob storage
        super().__init__(None)

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        # Store message in blob storage
        self.blob_storage.append(messages[-1])
        return {"messages": messages, "metadata": metadata or {}}

class Categorizer(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("categorizer.txt")),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        metadata = metadata or {}
        result = self.chain.invoke({"input": messages[-1].content})
        metadata["category"] = result["text"].strip().lower()
        return {"messages": messages, "metadata": metadata}

class Router:
    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> str:
        category = metadata.get("category", "").lower()
        if "maintenance" in category:
            return "maintenance"
        elif "asset" in category:
            return "asset_expert"
        elif "tax" in category:
            return "taxation"
        return "general"

class AssetExpert(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("asset_expert.txt")),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        # Use tools before processing with LLM
        enhanced_input = self._use_tools(messages[-1].content)
        result = self.chain.invoke({"input": enhanced_input})
        messages = list(messages)
        messages.append(AIMessage(content=result["text"]))
        return {"messages": messages, "metadata": metadata or {}}

class Maintenance(BaseAgent):
    def __init__(self, llm, tavily_api_key: str = None, contact_email: str = "vishisht.0902@gmail.com"):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("maintenance.txt")),
                ("human", "{input}")
            ])
        )
        
        # Initialize sub-agents
        if tavily_api_key:
            self.worker_searcher = MaintenanceWorkerSearcher(tavily_api_key)
        else:
            self.worker_searcher = None
            
        self.worker_contact = MaintenanceWorkerContact(contact_email)

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        # Use tools before processing with LLM
        enhanced_input = self._use_tools(messages[-1].content)
        
        # Process with LLM to determine if we need to search for workers or contact them
        result = self.chain.invoke({"input": enhanced_input})
        llm_response = result["text"]
        
        # Check if the response indicates a need to search for workers
        if "search" in llm_response.lower() and self.worker_searcher:
            # Extract location from the response (this is a simple implementation)
            location = "current location"  # In a real system, you would extract this from the message
            search_result = self.worker_searcher.search_workers(location)
            llm_response += f"\n\n{search_result}"
            
        # Check if the response indicates a need to contact workers
        if "contact" in llm_response.lower():
            email_result = self.worker_contact.send_email(
                subject="Maintenance Request",
                message=f"Maintenance request details:\n{llm_response}"
            )
            llm_response += f"\n\n{email_result}"
        
        messages = list(messages)
        messages.append(AIMessage(content=llm_response))
        return {"messages": messages, "metadata": metadata or {}}

class TaxationReportGenerator(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("taxation.txt")),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        # Use tools before processing with LLM
        enhanced_input = self._use_tools(messages[-1].content)
        result = self.chain.invoke({"input": enhanced_input})
        messages = list(messages)
        messages.append(AIMessage(content=result["text"]))
        return {"messages": messages, "metadata": metadata or {}}

class AgentSystem:
    def __init__(self, mistral_api_key: str, tavily_api_key: str = None):
        self.llm = ChatMistralAI(mistral_api_key=mistral_api_key)
        
        # Initialize tools
        self.tools = []
        if tavily_api_key:
            self.tools.append(TavilySearchResults(api_key=tavily_api_key))
        
        # Initialize agents
        self.accumulator = Accumulator()
        self.categorizer = Categorizer(self.llm)
        self.router = Router()
        self.asset_expert = AssetExpert(self.llm)
        self.maintenance = Maintenance(self.llm, tavily_api_key, "vishisht.0902@gmail.com")
        self.taxation = TaxationReportGenerator(self.llm)

        # Add tools to relevant agents
        for tool in self.tools:
            self.asset_expert.add_tool(tool)
            self.maintenance.add_tool(tool)
            self.taxation.add_tool(tool)

    async def process_message(self, message: str) -> Dict[str, Any]:
        # Initialize state
        state = {
            "messages": [HumanMessage(content=message)],
            "metadata": {}
        }

        try:
            # Step 1: Accumulator
            state = self.accumulator.process(state["messages"], state["metadata"])

            # Step 2: Categorizer
            state = self.categorizer.process(state["messages"], state["metadata"])

            # Step 3: Router
            route = self.router.process(state["messages"], state["metadata"])

            # Step 4: Route to specific agent
            if route == "asset_expert":
                state = self.asset_expert.process(state["messages"], state["metadata"])
            elif route == "maintenance":
                state = self.maintenance.process(state["messages"], state["metadata"])
            elif route == "taxation":
                state = self.taxation.process(state["messages"], state["metadata"])

            return state
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            return {
                "messages": state["messages"],
                "metadata": state["metadata"],
                "error": str(e)
            }

def create_agent_system(mistral_api_key: str, tavily_api_key: str = None) -> AgentSystem:
    return AgentSystem(mistral_api_key, tavily_api_key) 