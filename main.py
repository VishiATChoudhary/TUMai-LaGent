import asyncio
from agents import create_agent_system

async def main():
    # Replace with your Mistral API key
    MISTRAL_API_KEY = "mgNvjI0hi3WcPdMvPMVgy8LKQFQhVtBx"
    
    # Create the agent system
    agent_system = create_agent_system(MISTRAL_API_KEY)
    
    # Test messages for different scenarios
    test_messages = [
        "Can you check if the heating system in apartment 3B is working properly? It's been making strange noises.",
        "What's the current value of the property at 123 Main Street?",
        "I need help generating a tax report for Q2 2023 for all my rental properties."
    ]
    
    # Process each test message
    for message in test_messages:
        print(f"\nProcessing message: {message}")
        print("-" * 50)
        
        # Process the message through the agent system
        result = await agent_system.process_message(message)
        
        # Print the final response
        if len(result["messages"]) > 1:
            print("Final response:", result["messages"][-1].content)
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main()) 