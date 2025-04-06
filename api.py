from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from main import main

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/refresh")
async def refresh_messages():
    try:
        # Run the main function asynchronously
        await main()
        return {"status": "success", "message": "Messages refreshed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)} 