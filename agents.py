from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.chains import SequentialChain, LLMChain
from langchain.chains.base import Chain
from langchain_core.runnables import RunnablePassthrough

class BaseAgent:
    def __init__(self, llm):
        self.llm = llm

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
                ("system", "Categorize this message into one of: maintenance, asset, taxation, general"),
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
                ("system", "You are an expert in property assets. Answer the query professionally."),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        result = self.chain.invoke({"input": messages[-1].content})
        messages = list(messages)
        messages.append(AIMessage(content=result["text"]))
        return {"messages": messages, "metadata": metadata or {}}

class Maintenance(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", "You are a maintenance expert. Provide solution options for the issue."),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        result = self.chain.invoke({"input": messages[-1].content})
        messages = list(messages)
        messages.append(AIMessage(content=result["text"]))
        return {"messages": messages, "metadata": metadata or {}}

class TaxationReportGenerator(BaseAgent):
    def __init__(self, llm):
        super().__init__(llm)
        self.chain = LLMChain(
            llm=llm,
            prompt=ChatPromptTemplate.from_messages([
                ("system", "You are a taxation expert. Generate a summary report."),
                ("human", "{input}")
            ])
        )

    def process(self, messages: List[BaseMessage], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        result = self.chain.invoke({"input": messages[-1].content})
        messages = list(messages)
        messages.append(AIMessage(content=result["text"]))
        return {"messages": messages, "metadata": metadata or {}}

class AgentSystem:
    def __init__(self, mistral_api_key: str):
        self.llm = ChatMistralAI(mistral_api_key=mistral_api_key)
        
        # Initialize agents
        self.accumulator = Accumulator()
        self.categorizer = Categorizer(self.llm)
        self.router = Router()
        self.asset_expert = AssetExpert(self.llm)
        self.maintenance = Maintenance(self.llm)
        self.taxation = TaxationReportGenerator(self.llm)

    async def process_message(self, message: str) -> Dict[str, Any]:
        # Initialize state
        state = {
            "messages": [HumanMessage(content=message)],
            "metadata": {}
        }

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

def create_agent_system(mistral_api_key: str) -> AgentSystem:
    return AgentSystem(mistral_api_key) 