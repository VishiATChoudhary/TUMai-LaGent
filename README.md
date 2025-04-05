# TUM.ai ESSEC Backend

This is a FastAPI backend that integrates LangChain and NVIDIA NeMo for natural language processing tasks.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the variables in `.env` with your specific values:
  - `NEMO_MODEL_PATH`: Path to your NeMo model
  - `LANGCHAIN_API_KEY`: Your LangChain API key
  - `MODEL_PROVIDER`: The LLM provider you want to use

## Running the Application

Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

- `main.py`: FastAPI application entry point
- `nemo_wrapper.py`: Custom wrapper for NVIDIA NeMo models
- `langchain_integration.py`: LangChain integration module
- `requirements.txt`: Project dependencies
- `.env`: Environment variables configuration

## License

This project is licensed under the terms of the LICENSE file in the root of this repository. 