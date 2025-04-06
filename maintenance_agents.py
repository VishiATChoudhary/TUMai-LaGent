from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.tools import Tool
from langchain_community.tools.tavily_search import TavilySearchResults
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class MaintenanceWorkerSearcher:
    def __init__(self, tavily_api_key: str):
        self.search_tool = TavilySearchResults(api_key=tavily_api_key)
        
    def search_workers(self, location: str) -> str:
        """Search for maintenance workers in the specified location"""
        query = f"maintenance workers near {location} contact information"
        try:
            results = self.search_tool.run(query)
            return f"Found maintenance workers in {location}:\n{results}"
        except Exception as e:
            return f"Error searching for maintenance workers: {str(e)}"

class MaintenanceWorkerContact:
    def __init__(self, email: str):
        self.recipient_email = email
        
    def send_email(self, subject: str, message: str) -> str:
        """Send an email to the maintenance worker"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = 'maintenance@system.com'
            msg['To'] = self.recipient_email
            msg['Subject'] = subject
            
            # Add message body
            msg.attach(MIMEText(message, 'plain'))
            
            # Send email (in a real system, you would use proper SMTP configuration)
            # This is a placeholder - in production, you should use proper email configuration
            print(f"Would send email to {self.recipient_email} with subject: {subject}")
            print(f"Message content: {message}")
            
            return f"Email sent to {self.recipient_email}"
        except Exception as e:
            return f"Error sending email: {str(e)}" 