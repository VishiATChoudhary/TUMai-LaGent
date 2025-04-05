import os
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

def test_mistral_api():
    # Get API key from environment variable
    api_key = os.getenv("MISTRAL_API_KEY")
    
    if not api_key:
        raise ValueError("MISTRAL_API_KEY environment variable is not set")
    
    try:
        # Initialize the client
        client = MistralClient(api_key=api_key)
        
        # Create a simple test message
        messages = [
            ChatMessage(role="user", content="What is 2+2?")
        ]
        
        # Make a test request
        chat_response = client.chat(
            model="mistral-tiny",
            messages=messages
        )
        
        # Print the response
        print("API Test Response:")
        print(chat_response.choices[0].message.content)
        return True
        
    except Exception as e:
        print(f"Error testing Mistral API: {str(e)}")
        return False

if __name__ == "__main__":
    test_mistral_api()
