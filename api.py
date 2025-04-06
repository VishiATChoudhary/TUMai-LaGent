from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import SupabaseClient
from dotenv import load_dotenv
from agents import create_agent_system
import os
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Initialize Supabase client and agent system
try:
    supabase_client = SupabaseClient()
    agent_system = create_agent_system(
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        tavily_api_key=os.getenv("TAVILY_API_KEY"),
        supabase_url=os.getenv("PROJECT_URL_SUPABASE"),
        supabase_key=os.getenv("VITE_SUPABASE_PUBLIC_KEY")
    )
except Exception as e:
    print(f"Error initializing services: {str(e)}")
    raise

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/refresh")
async def refresh_messages():
    try:
        # Get the latest messages from the messages table
        messages = supabase_client.supabase.table("messages").select("*").order("created_at", desc=True).execute()
        
        # Process each message through the agent system
        processed_messages = []
        for message in messages.data:
            result = await agent_system.process_message(message["content"])
            processed_messages.append({
                "original": message,
                "processed": result
            })
        
        return {
            "status": "success",
            "messages": processed_messages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 