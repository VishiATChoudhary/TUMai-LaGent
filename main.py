import asyncio
import os
from dotenv import load_dotenv
from agents import create_agent_system
from supabase_client import SupabaseClient

async def main():
    # Load environment variables
    load_dotenv()
    
    # Get API keys from environment variables
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    SUPABASE_URL = os.getenv("PROJECT_URL_SUPABASE")
    SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLIC_KEY")  # Use public key for service role
    
    # Create the agent system with all API keys
    agent_system = create_agent_system(
        mistral_api_key=MISTRAL_API_KEY,
        tavily_api_key=TAVILY_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    
    # Initialize Supabase client
    supabase_client = SupabaseClient()
    
    # Get the latest message from the messages table
    latest_message = supabase_client.supabase.table("messages").select("content").order("created_at", desc=True).limit(1).execute()
    
    # Extract the content from the response
    test_messages = []
    if latest_message.data:
        test_messages = [latest_message.data[0]["content"]]
    
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