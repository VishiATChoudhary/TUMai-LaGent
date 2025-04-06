import boto3
import json

class BedrockMistral:
    def __init__(self, model_id="anthropic.claude-3-sonnet-20240229-v1:0", region_name="us-west-2"):
        self.bedrock = boto3.client(
            service_name="bedrock-runtime",
            region_name=region_name
        )
        self.model_id = model_id

    def invoke_model(self, prompt, max_tokens=200, temperature=1, top_k=250, top_p=0.999, stop_sequences=None):
        if stop_sequences is None:
            stop_sequences = []
            
        # Format the request body according to Claude's requirements
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_k": top_k,
            "top_p": top_p,
            "stop_sequences": stop_sequences,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        })

        response = self.bedrock.invoke_model(
            body=body,
            modelId=self.model_id,
            accept="application/json",
            contentType="application/json"
        )

        response_body = json.loads(response.get("body").read())
        return response_body.get("content")[0].get("text")

# Example usage
if __name__ == "__main__":
    model = BedrockMistral()
    response = model.invoke_model("What is the capital of France?")
    print(response)
