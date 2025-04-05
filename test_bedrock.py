from langchain_aws import ChatBedrock

llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0, "max_tokens": None},
)

response = llm.invoke("Where is daddy?")
print(response.content)