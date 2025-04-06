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
from supabase import create_client, Client
import os


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

class CategorizerResultSaver:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    def save_result(self, message_content: str, flag: str, urgency: str):
        """Save categorizer result to Supabase"""
        try:
            # Convert message content to string if it's a list
            if isinstance(message_content, list):
                message_content = "\n".join([msg.content for msg in message_content])
                
            result = self.supabase.table('categorizer_results').insert({
                'message_content': message_content,
                'flag': flag,
                'urgency': urgency
            }).execute()
            print(f"Successfully saved result to Supabase: {result}")
            return result
        except Exception as e:
            print(f"Error saving categorizer result: {str(e)}")
            return None

class Categorizer(BaseAgent):
    def __init__(self, llm, supabase_url: str = None, supabase_key: str = None):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("categorizer.txt")),
                ("human", "{input}")
            ])
        )
        if supabase_url and supabase_key:
            print("Categorizer initialized with Supabase")
            self.result_saver = CategorizerResultSaver(supabase_url, supabase_key)
        else:
            self.result_saver = None

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        metadata = metadata or {}
        print("Messages:", messages)
        result = self.chain.invoke({"input": messages})
        print('categorizer result:', result)
        response = result["text"].strip().lower()
        print('categorizer response:', response)
        # Extract flag and urgency from the response
        # The response should be in the format: "flag: [flag], urgency: [urgency]"
        flag = "miscellaneous"  # default
        urgency = "low"  # default
        
        if "maintenance" in response:
            flag = "maintenance"
        elif "tax" in response:
            flag = "tax"
        elif "noise" in response:
            flag = "noise-complaint"
            
        if "high" in response:
            urgency = "high"
        elif "intermediate" in response:
            urgency = "intermediate"

            
        metadata["category"] = flag  # Keep for backward compatibility
        metadata["urgency"] = urgency
        
        # Save result to Supabase if result_saver is configured
        if self.result_saver:
            self.result_saver.save_result(
                message_content=messages,
                flag=flag,
                urgency=urgency
            )
            
        return {"messages": messages, "metadata": metadata}

class Router:
    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> str:
        category = metadata.get("category", "").lower()
        main_prompt = messages[-1].content if messages else ""
        
        # Use both category and main prompt for routing
        if "maintenance" in category or "maintenance" in main_prompt.lower():
            return "maintenance"
        elif "asset" in category or "asset" in main_prompt.lower():
            return "asset_expert"
        elif "tax" in category or "tax" in main_prompt.lower():
            return "taxation"
        elif "email" in category or "email" in main_prompt.lower():
            return "email_drafter"
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

    def _extract_location(self, message: str) -> str:
        """Extract location from message content"""
        # This is a simple implementation - in a real system, you would use NLP to extract the location
        # For now, we'll look for common location indicators
        location_indicators = ["at", "in", "near", "around"]
        words = message.lower().split()
        for i, word in enumerate(words):
            if word in location_indicators and i + 1 < len(words):
                return words[i + 1]
        return "current location"  # Fallback if no location found

    def _generate_search_query(self, message: str, location: str) -> str:
        """Generate a specific search query for maintenance workers using LLM"""
        search_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful assistant that formulates specific search queries for finding maintenance workers.
            Based on the user's request and location, create a detailed search query that will help find the most relevant maintenance workers.
            Include specific skills, services, or specializations mentioned in the request.
            Format: Return ONLY the search query string, nothing else."""),
            ("human", f"User request: {message}\nLocation: {location}")
        ])
        
        chain = LLMChain(llm=self.llm, prompt=search_prompt)
        result = chain.invoke({"input": message})
        return result["text"].strip()

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        # Use tools before processing with LLM
        enhanced_input = self._use_tools(messages[-1].content)
        
        # Process with LLM to determine if we need to search for workers or contact them
        result = self.chain.invoke({"input": enhanced_input})
        llm_response = result["text"]
        print("LLM response:", llm_response)
        
        # Check if the response indicates a need to search for workers
        if "search for maintenance workers" in llm_response.lower() and self.worker_searcher:
            # Extract location from the message
            location = self._extract_location(messages[-1].content)
            # Generate a specific search query
            search_query = self._generate_search_query(messages[-1].content, location)
            print(f"Generated search query: {search_query}")
            search_result = self.worker_searcher.search_workers(search_query)
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

class EmailDrafter(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", read_prompt("email_drafter.txt")),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        metadata = metadata or {}
        
        # Extract maintenance worker info and issue details from metadata
        worker_info = metadata.get("selected_worker", {})
        issue_details = metadata.get("issue_details", {})
        
        # Prepare input for the LLM
        input_data = {
            "worker_name": worker_info.get("name", ""),
            "worker_type": worker_info.get("type", ""),
            "worker_rating": worker_info.get("rating", ""),
            "issue_description": issue_details.get("description", ""),
            "issue_urgency": issue_details.get("urgency", ""),
            "property_location": issue_details.get("location", ""),
            "tenant_name": issue_details.get("tenant_name", "")
        }
        
        # Generate email draft
        result = self.chain.invoke({"input": input_data})
        email_draft = result["text"]
        
        # Update metadata with the email draft
        metadata["email_draft"] = email_draft
        
        return {"messages": messages, "metadata": metadata}

class AgentSystem:
    def __init__(self, mistral_api_key: str, tavily_api_key: str = None, supabase_url: str = None, supabase_key: str = None):
        self.llm = ChatMistralAI(mistral_api_key=mistral_api_key)
        
        # Initialize tools
        self.tools = []
        if tavily_api_key:
            self.tools.append(TavilySearchResults(api_key=tavily_api_key))
        
        # Initialize agents
        self.accumulator = Accumulator()
        self.categorizer = Categorizer(self.llm, supabase_url, supabase_key)
        self.router = Router()
        self.asset_expert = AssetExpert(self.llm)
        self.maintenance = Maintenance(self.llm, tavily_api_key, "vishisht.0902@gmail.com")
        self.taxation = TaxationReportGenerator(self.llm)
        self.email_drafter = EmailDrafter(self.llm)

        # Add tools to relevant agents
        for tool in self.tools:
            self.asset_expert.add_tool(tool)
            self.maintenance.add_tool(tool)
            self.taxation.add_tool(tool)
            self.email_drafter.add_tool(tool)

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
            print("Categorizer:", state["metadata"])
            state = self.categorizer.process(state["messages"], state["metadata"])

            # Step 3: Router (now has access to both category and main prompt)
            route = self.router.process(state["messages"], state["metadata"])
            print("Route:", route)

            # Step 4: Route to specific agent
            if route == "asset_expert":
                state = self.asset_expert.process(state["messages"], state["metadata"])
            elif route == "maintenance":
                state = self.maintenance.process(state["messages"], state["metadata"])
            elif route == "taxation":
                state = self.taxation.process(state["messages"], state["metadata"])
            elif route == "email_drafter":
                state = self.email_drafter.process(state["messages"], state["metadata"])

            return state
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            return {
                "messages": state["messages"],
                "metadata": state["metadata"],
                "error": str(e)
            }

def create_agent_system(mistral_api_key: str, tavily_api_key: str = None, supabase_url: str = None, supabase_key: str = None) -> AgentSystem:
    return AgentSystem(mistral_api_key, tavily_api_key, supabase_url, supabase_key) 