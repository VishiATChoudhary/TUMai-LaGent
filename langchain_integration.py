from typing import Optional, Dict, Any
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os

class LangChainIntegration:
    def __init__(self, model: Optional[BaseLanguageModel] = None):
        """
        Initialize LangChain integration with optional model.
        """
        self.model = model
        self.chain = None
        
    def setup_chain(self, prompt_template: str):
        """
        Set up the LangChain processing chain with a custom prompt template
        """
        if self.model is None:
            raise ValueError("No model provided for LangChain integration")
            
        prompt = PromptTemplate.from_template(prompt_template)
        self.chain = (
            {"input": RunnablePassthrough()}
            | prompt
            | self.model
            | StrOutputParser()
        )
    
    def process_text(self, text: str, **kwargs) -> Dict[str, Any]:
        """
        Process input text using the LangChain chain
        """
        if self.chain is None:
            raise ValueError("Chain not set up. Call setup_chain first.")
            
        try:
            result = self.chain.invoke(text, **kwargs)
            return {
                "input_text": text,
                "output_text": result,
                "status": "success"
            }
        except Exception as e:
            return {
                "input_text": text,
                "error": str(e),
                "status": "error"
            } 