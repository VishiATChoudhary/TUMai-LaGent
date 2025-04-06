from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from agents import EmailDrafter, create_agent_system
import os

app = FastAPI()

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly allow OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Initialize the agent system
try:
    agent_system = create_agent_system(
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        tavily_api_key=os.getenv("TAVILY_API_KEY")
    )
except Exception as e:
    print(f"Error initializing agent system: {str(e)}")
    raise

class EmailDraftRequest(BaseModel):
    worker_info: Dict[str, Any]
    issue_details: Dict[str, Any]

@app.post("/draft-email")
async def draft_email(request: EmailDraftRequest):
    try:
        # Create a message with the request details
        message = f"""
        Worker Information:
        - Name: {request.worker_info.get('name', 'N/A')}
        - Type: {request.worker_info.get('type', 'N/A')}
        - Rating: {request.worker_info.get('rating', 'N/A')}
        
        Issue Details:
        - Description: {request.issue_details.get('description', 'N/A')}
        - Urgency: {request.issue_details.get('urgency', 'N/A')}
        - Location: {request.issue_details.get('location', 'N/A')}
        - Tenant Name: {request.issue_details.get('tenant_name', 'N/A')}
        """
        
        # Process the message through the email drafter
        result = agent_system.email_drafter.process(
            messages=[{"role": "user", "content": message}],
            metadata={
                "selected_worker": request.worker_info,
                "issue_details": request.issue_details
            }
        )
        
        # Extract the email draft from the result
        email_draft = result["metadata"].get("email_draft", "")
        
        return {"email_draft": email_draft}
        
    except Exception as e:
        print(f"Error in draft_email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


