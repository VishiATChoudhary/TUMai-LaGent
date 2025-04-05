from typing import Annotated, Any, Dict, List, Tuple, TypeVar, Union
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field
from mistralai.models.chat_completion import ChatMessage
from mistralai.client import MistralClient
from mistralai.exceptions import MistralAPIError
import structlog
from enum import Enum
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize logging
logger = structlog.get_logger()

# Initialize Mistral client with API key from environment
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")
    
mistral_client = MistralClient(api_key=MISTRAL_API_KEY)

# Storage Classes (Placeholders)
class BlobStorage:
    def store_message(self, message: str) -> str:
        # Placeholder for storing raw messages
        return "message_id"

class StructuredMessagesDataset:
    def store_structured_message(self, message: Dict) -> str:
        # Placeholder for storing categorized messages
        return "structured_message_id"

class FinancialDatabase:
    def store_financial_record(self, record: Dict) -> str:
        # Placeholder for storing financial records
        return "financial_record_id"

# Message Categories
class Category(str, Enum):
    MAINTENANCE = "maintenance"
    COMPLAINTS = "complaints"
    EMERGENCY = "emergency"
    GENERAL = "general"
    TAXATION = "taxation"
    ASSET = "asset"

# State Classes
class AgentState(BaseModel):
    messages: List[Dict] = Field(default_factory=list)
    current_category: Category | None = None
    metadata: Dict = Field(default_factory=dict)

# Agent Prompt Templates
CATEGORIZER_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content="""You are a message categorizer for a landlord management system.
    Analyze the input and categorize it into one of: maintenance, complaints, emergency, general, taxation, asset.
    Also assign a priority level (1-5) where 5 is highest priority.
    Return response in JSON format: {"category": "...", "priority": N, "is_malicious": bool, "malicious_reason": "..."}
    Detect any potentially malicious content."""),
    HumanMessage(content="{input}")
])

ROUTER_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content="""You are a message router for a landlord management system.
    Based on the category and content, determine which expert agent should handle this request:
    - Asset Expert: for property and asset related queries
    - Maintenance: for repairs and maintenance
    - Taxation: for financial and tax related matters
    Return response in JSON format: {"target_agent": "asset_expert|maintenance|taxation"}"""),
    HumanMessage(content="Category: {category}\nContent: {content}")
])

ASSET_EXPERT_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content="""You are an asset management expert for a landlord system.
    Provide detailed information about properties, valuations, and asset-related queries.
    Return response in JSON format: {
        "analysis": "detailed property analysis",
        "recommendations": ["list", "of", "recommendations"],
        "estimated_value": "if applicable",
        "confidence": 0-1
    }"""),
    HumanMessage(content="{message}")
])

MAINTENANCE_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content="""You are a maintenance expert for a landlord system.
    Analyze maintenance requests, suggest actions, and recommend vendors if needed.
    Return response in JSON format: {
        "issue_analysis": "detailed analysis",
        "suggested_actions": ["list", "of", "actions"],
        "urgency": 1-5,
        "estimated_cost": "range in USD",
        "recommended_vendors": ["if", "applicable"]
    }"""),
    HumanMessage(content="{message}")
])

TAXATION_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content="""You are a taxation expert for a landlord system.
    Generate tax reports and financial summaries based on provided data.
    Return response in JSON format: {
        "summary": "financial summary",
        "tax_implications": ["list", "of", "implications"],
        "recommendations": ["list", "of", "recommendations"],
        "estimated_liability": "if applicable"
    }"""),
    HumanMessage(content="Message: {message}\nFinancial Data: {financial_data}")
])

# Agent Implementations
class AccumulatorAgent:
    def __init__(self):
        self.storage = BlobStorage()
    
    async def run(self, state: AgentState) -> AgentState:
        try:
            message = state.messages[-1]
            message_id = self.storage.store_message(message)
            state.metadata["message_id"] = message_id
            return state
        except Exception as e:
            logger.error("accumulator_error", error=str(e))
            raise

class CategorizerAgent:
    def __init__(self):
        self.prompt = CATEGORIZER_PROMPT
        self.structured_storage = StructuredMessagesDataset()
    
    async def run(self, state: AgentState) -> Dict:
        try:
            message = state.messages[-1]
            formatted_messages = self.prompt.format_messages(input=message["content"])
            messages = [
                ChatMessage(role="system" if m.type == "system" else "user", content=m.content)
                for m in formatted_messages
            ]
            
            try:
                response = mistral_client.chat(
                    model="mistral-tiny",
                    messages=messages
                )
                
                result = self._parse_response(response.choices[0].message.content)
                
            except MistralAPIError as e:
                logger.error("mistral_api_error", error=str(e))
                # Default categorization for water-related issues
                result = {
                    "category": Category.MAINTENANCE,
                    "priority": 4 if "leak" in message["content"].lower() else 3,
                    "is_malicious": False,
                    "malicious_reason": ""
                }
            
            # Update state
            return {
                "messages": state.messages,
                "current_category": result["category"],
                "metadata": {
                    **state.metadata,
                    "priority": result["priority"],
                    "is_malicious": result["is_malicious"],
                    "malicious_reason": result.get("malicious_reason", "")
                }
            }
            
        except Exception as e:
            logger.error("categorizer_error", error=str(e))
            return {
                "messages": state.messages,
                "current_category": Category.MAINTENANCE,
                "metadata": {
                    **state.metadata,
                    "priority": 3,
                    "is_malicious": False
                }
            }
    
    def _parse_response(self, content: str) -> Dict:
        try:
            import json
            result = json.loads(content)
            return {
                "category": Category(result["category"].lower()),
                "priority": int(result["priority"]),
                "is_malicious": bool(result.get("is_malicious", False)),
                "malicious_reason": result.get("malicious_reason", "")
            }
        except Exception as e:
            logger.error("parse_response_error", error=str(e))
            return {
                "category": Category.GENERAL,
                "priority": 1,
                "is_malicious": False,
                "malicious_reason": ""
            }

class RouterAgent:
    def __init__(self):
        self.prompt = ROUTER_PROMPT
    
    async def run(self, state: AgentState) -> Dict:
        try:
            message = state.messages[-1]
            formatted_messages = self.prompt.format_messages(
                category=state.current_category,
                content=message["content"]
            )
            messages = [
                ChatMessage(role="system" if m.type == "system" else "user", content=m.content)
                for m in formatted_messages
            ]
            
            try:
                response = mistral_client.chat(
                    model="mistral-tiny",
                    messages=messages
                )
                
                result = self._parse_response(response.choices[0].message.content)
                return {"next": result["target_agent"]}
                
            except MistralAPIError as e:
                logger.error("mistral_api_error", error=str(e))
                # Default to maintenance for water-related issues, asset_expert otherwise
                default_agent = "maintenance_expert" if "water" in message["content"].lower() else "asset_expert"
                return {"next": default_agent}
                
        except Exception as e:
            logger.error("router_error", error=str(e))
            return {"next": "maintenance_expert"}  # Safe default for most property issues
    
    def _parse_response(self, content: str) -> Dict:
        try:
            import json
            result = json.loads(content)
            return result
        except Exception as e:
            logger.error("parse_response_error", error=str(e))
            return {"target_agent": "maintenance_expert"}

class AssetExpertAgent:
    def __init__(self):
        self.prompt = ASSET_EXPERT_PROMPT
    
    async def run(self, state: AgentState) -> Dict:
        try:
            message = state.messages[-1]
            formatted_messages = self.prompt.format_messages(message=message["content"])
            messages = [
                ChatMessage(role="system" if m.type == "system" else "user", content=m.content)
                for m in formatted_messages
            ]
            
            try:
                response = mistral_client.chat(
                    model="mistral-tiny",
                    messages=messages
                )
                result = self._parse_response(response.choices[0].message.content)
            except MistralAPIError as e:
                logger.error("mistral_api_error", error=str(e))
                result = {
                    "analysis": "Unable to analyze asset information due to API error",
                    "recommendations": ["Contact support for assistance"],
                    "confidence": 0
                }
            
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": {
                    **state.metadata,
                    "asset_analysis": result
                }
            }
            
        except Exception as e:
            logger.error("asset_expert_error", error=str(e))
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": state.metadata
            }
    
    def _parse_response(self, content: str) -> Dict:
        try:
            import json
            return json.loads(content)
        except Exception as e:
            logger.error("parse_response_error", error=str(e))
            return {
                "analysis": "Error analyzing asset information",
                "recommendations": [],
                "confidence": 0
            }

class MaintenanceAgent:
    def __init__(self):
        self.prompt = MAINTENANCE_PROMPT
    
    async def run(self, state: AgentState) -> Dict:
        try:
            message = state.messages[-1]
            formatted_messages = self.prompt.format_messages(message=message["content"])
            messages = [
                ChatMessage(role="system" if m.type == "system" else "user", content=m.content)
                for m in formatted_messages
            ]
            
            try:
                response = mistral_client.chat(
                    model="mistral-tiny",
                    messages=messages
                )
                result = self._parse_response(response.choices[0].message.content)
            except MistralAPIError as e:
                logger.error("mistral_api_error", error=str(e))
                # Default response for water-related issues
                result = {
                    "issue_analysis": "Water damage detected - requires immediate attention",
                    "suggested_actions": ["Schedule emergency inspection", "Contact plumber"],
                    "urgency": 4,
                    "estimated_cost": "$500-$2000",
                    "recommended_vendors": ["Emergency Maintenance Services"]
                }
            
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": {
                    **state.metadata,
                    "maintenance_analysis": result
                }
            }
            
        except Exception as e:
            logger.error("maintenance_error", error=str(e))
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": state.metadata
            }
    
    def _parse_response(self, content: str) -> Dict:
        try:
            import json
            return json.loads(content)
        except Exception as e:
            logger.error("parse_response_error", error=str(e))
            return {
                "issue_analysis": "Error analyzing maintenance request",
                "suggested_actions": [],
                "urgency": 1,
                "estimated_cost": "Unknown",
                "recommended_vendors": []
            }

class TaxationReportAgent:
    def __init__(self):
        self.prompt = TAXATION_PROMPT
        self.financial_db = FinancialDatabase()
    
    async def run(self, state: AgentState) -> Dict:
        try:
            message = state.messages[-1]
            financial_data = self._get_financial_data()
            
            formatted_messages = self.prompt.format_messages(
                message=message["content"],
                financial_data=financial_data
            )
            messages = [
                ChatMessage(role="system" if m.type == "system" else "user", content=m.content)
                for m in formatted_messages
            ]
            
            try:
                response = mistral_client.chat(
                    model="mistral-tiny",
                    messages=messages
                )
                result = self._parse_response(response.choices[0].message.content)
            except MistralAPIError as e:
                logger.error("mistral_api_error", error=str(e))
                result = {
                    "summary": "Unable to generate tax report due to API error",
                    "tax_implications": ["Contact tax advisor for assistance"],
                    "recommendations": ["Schedule consultation"],
                    "estimated_liability": "Unknown"
                }
            
            # Store report in financial database
            report_id = self.financial_db.store_financial_record({
                "report": result,
                "timestamp": state.metadata.get("timestamp"),
                "message_id": state.metadata.get("message_id")
            })
            
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": {
                    **state.metadata,
                    "taxation_analysis": result,
                    "report_id": report_id
                }
            }
            
        except Exception as e:
            logger.error("taxation_error", error=str(e))
            return {
                "messages": state.messages,
                "current_category": state.current_category,
                "metadata": state.metadata
            }
    
    def _get_financial_data(self) -> str:
        # Placeholder - would actually query financial database
        return "Sample financial data for demonstration"
    
    def _parse_response(self, content: str) -> Dict:
        try:
            import json
            return json.loads(content)
        except Exception as e:
            logger.error("parse_response_error", error=str(e))
            return {
                "summary": "Error generating tax report",
                "tax_implications": [],
                "recommendations": [],
                "estimated_liability": "Unknown"
            }

# Graph Construction
def create_landlord_graph() -> StateGraph:
    """Create the processing graph for the landlord management system."""
    
    # Initialize agents
    accumulator = AccumulatorAgent()
    categorizer = CategorizerAgent()
    router = RouterAgent()
    asset_expert = AssetExpertAgent()
    maintenance_expert = MaintenanceAgent()
    taxation_expert = TaxationReportAgent()
    
    # Create workflow
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("accumulator", accumulator.run)
    workflow.add_node("categorizer", categorizer.run)
    workflow.add_node("router", router.run)
    workflow.add_node("asset_expert", asset_expert.run)
    workflow.add_node("maintenance_expert", maintenance_expert.run)
    workflow.add_node("taxation_expert", taxation_expert.run)
    
    # Define edges
    workflow.add_edge("accumulator", "categorizer")
    workflow.add_edge("categorizer", "router")
    
    # Add conditional edges from router to experts
    def route_to_expert(state: AgentState) -> str:
        if state.metadata.get("is_malicious", False):
            return END
        category = state.current_category
        if category == Category.ASSET:
            return "asset_expert"
        elif category == Category.MAINTENANCE:
            return "maintenance_expert"
        elif category == Category.TAXATION:
            return "taxation_expert"
        return END
    
    workflow.add_conditional_edges(
        "router",
        route_to_expert,
        {
            "asset_expert": END,
            "maintenance_expert": END,
            "taxation_expert": END
        }
    )
    
    # Set entry point
    workflow.set_entry_point("accumulator")
    
    # Compile the graph
    return workflow.compile() 