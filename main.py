from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="TUM.ai ESSEC Backend",
    description="Backend API with FastAPI, LangChain, and NeMo integration",
    version="1.0.0"
)

class Query(BaseModel):
    text: str
    model: Optional[str] = "nemo"

@app.get("/")
async def root():
    return {"message": "Welcome to TUM.ai ESSEC Backend API"}

@app.post("/query")
async def process_query(query: Query):
    try:
        # TODO: Implement NeMo wrapper and LangChain integration
        return {"response": f"Processed query: {query.text} with model: {query.model}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 