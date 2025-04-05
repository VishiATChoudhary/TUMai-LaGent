import asyncio
from typing import Dict, List
import structlog
from agents import create_landlord_graph, AgentState
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize logging
logger = structlog.get_logger()

async def process_message(message: str) -> Dict:
    """
    Process a single message through the landlord management system.
    
    Args:
        message: The input message to process
        
    Returns:
        Dict containing the processing results and appropriate response
    """
    try:
        print("\n=== Starting Message Processing ===")
        print(f"Input message: {message}")
        
        print("\n1. Creating graph...")  # Debug log
        graph = create_landlord_graph()
        print("✓ Graph created successfully")
        
        print("\n2. Initializing state...")  # Debug log
        initial_state = AgentState(
            messages=[{"content": message}],
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )
        print(f"✓ Initial state created with metadata: {initial_state.metadata}")
        
        print("\n3. Starting graph execution...")  # Debug log
        print("Configuring async stream")
        
        events = graph.astream({
            "messages": initial_state.messages,
            "metadata": initial_state.metadata,
            "current_category": initial_state.current_category
        })
        
        print("\n4. Processing events stream...")
        final_state = None
        event_count = 0
        
        # Process events from async generator
        async for event in events:
            event_count += 1
            final_state = event
            print(f"\nEvent #{event_count}:")
            print(f"- Type: {type(event)}")
            if hasattr(event, 'messages'):
                print(f"- Messages count: {len(event.messages)}")
            if hasattr(event, 'metadata'):
                print(f"- Metadata: {event.metadata}")
            if hasattr(event, 'current_category'):
                print(f"- Category: {event.current_category}")
        
        print(f"\n✓ Processed {event_count} total events")
        
        if final_state is None:
            raise Exception("No final state produced by graph")
        
        print("\n5. Graph execution completed")
        print("Final state summary:")
        print(f"- Has messages: {hasattr(final_state, 'messages')}")
        print(f"- Has metadata: {hasattr(final_state, 'metadata')}")
        print(f"- Has category: {hasattr(final_state, 'current_category')}")
        
        print("\n6. Generating response...")  # Debug log
        response = generate_response(final_state)
        print(f"✓ Generated response: {response[:100]}...")  # Show first 100 chars
        
        result = {
            "status": "success",
            "category": final_state.current_category if hasattr(final_state, "current_category") else None,
            "metadata": final_state.metadata if hasattr(final_state, "metadata") else {},
            "response": response,
            "actions": generate_actions(final_state) if hasattr(final_state, "actions") else []
        }
        
        print("\n7. Final result prepared")
        print(f"✓ Status: {result['status']}")
        print(f"✓ Category: {result['category']}")
        print(f"✓ Actions count: {len(result['actions'])}")
        print("\n=== Message Processing Complete ===\n")
        
        return result
        
    except Exception as e:
        logger.error("message_processing_error", error=str(e))
        print("\n!!! Error in message processing !!!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("Stack trace:")
        import traceback
        print(traceback.format_exc())
        print("\n=== Message Processing Failed ===\n")
        return {
            "status": "error",
            "category": None,
            "response": "I apologize, but I encountered an error processing your request. Please try again later."
        }

def generate_response(state: AgentState) -> str:
    """Generate a human-readable response based on the agent results."""
    try:
        if state.metadata.get("is_malicious"):
            return "I apologize, but I cannot process potentially harmful content."
            
        category = state.current_category
        if "asset_analysis" in state.metadata:
            analysis = state.metadata["asset_analysis"]
            return f"Property Analysis: {analysis['analysis']}\nRecommendations: {', '.join(analysis['recommendations'])}"
            
        elif "maintenance_analysis" in state.metadata:
            analysis = state.metadata["maintenance_analysis"]
            return f"Issue Analysis: {analysis['issue_analysis']}\nSuggested Actions: {', '.join(analysis['suggested_actions'])}\nEstimated Cost: {analysis['estimated_cost']}"
            
        elif "taxation_analysis" in state.metadata:
            analysis = state.metadata["taxation_analysis"]
            return f"Financial Summary: {analysis['summary']}\nTax Implications: {', '.join(analysis['tax_implications'])}"
            
        return "I've processed your request but couldn't generate a specific response."
        
    except Exception as e:
        logger.error("response_generation_error", error=str(e))
        return "I apologize, but I couldn't generate a proper response."

def generate_actions(state: AgentState) -> List[Dict]:
    """Generate a list of suggested follow-up actions."""
    actions = []
    
    try:
        if "maintenance_analysis" in state.metadata:
            analysis = state.metadata["maintenance_analysis"]
            if analysis.get("urgency", 0) >= 4:
                actions.append({
                    "type": "emergency_contact",
                    "description": "Contact emergency maintenance",
                    "vendors": analysis.get("recommended_vendors", [])
                })
            
        if "taxation_analysis" in state.metadata:
            analysis = state.metadata["taxation_analysis"]
            if analysis.get("recommendations"):
                actions.append({
                    "type": "schedule_consultation",
                    "description": "Schedule tax consultation",
                    "recommendations": analysis["recommendations"]
                })
                
        if state.metadata.get("priority", 0) >= 4:
            actions.append({
                "type": "high_priority",
                "description": "Mark as high priority for follow-up"
            })
            
    except Exception as e:
        logger.error("action_generation_error", error=str(e))
        
    return actions

async def main():
    # Test with a single message first
    test_message = "The roof is leaking in apartment 3B and water is coming through the ceiling"
    
    print(f"\n{'='*50}")
    print(f"Processing message: {test_message}")
    result = await process_message(test_message)
    print(f"\nStatus: {result.get('status')}")
    print(f"Category: {result.get('category')}")
    print(f"Response: {result.get('response')}")
    if result.get('actions'):
        print("\nSuggested Actions:")
        for action in result['actions']:
            print(f"- {action['description']}")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    asyncio.run(main()) 