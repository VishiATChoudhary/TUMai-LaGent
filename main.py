import asyncio
import os
from dotenv import load_dotenv
from agents import create_agent_system

async def main():
    # Load environment variables
    load_dotenv()
    
    # Get API keys from environment variables
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    
    # Create the agent system with both API keys
    agent_system = create_agent_system(
        mistral_api_key=MISTRAL_API_KEY,
        tavily_api_key=TAVILY_API_KEY
    )
    
    # Test messages for different scenarios
    test_messages = [
        "My sink is clogged and all the water is overflowing? It's been making strange noises, Düsseldorf, Germany",
#        "What's the current value of the property at 123 Main Street?",
#        "I need help generating a tax report for Q2 2023 for all my rental properties."
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