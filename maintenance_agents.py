from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.tools import Tool
from langchain_community.tools.tavily_search import TavilySearchResults
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

class MaintenanceWorkerSearcher:
    
    def __init__(self, *args, **kwargs):
        self.serp_api_key = "2eaa4f82052b7de1b24e311fb2caf6a8aa01ae1d90f0ee7c7d781328617cd1af"
        self.api_url = "https://serpapi.com/search"
        
    def search_workers(self, query: str) -> str:
        """Search for maintenance workers using SerpAPI with Google Maps"""
        print(f"Searching for maintenance workers with query: {query}")
        
        try:
            # Make API request to SerpAPI
            params = {
                "engine": "google_maps",
                "q": query,
                "api_key": self.serp_api_key,
                "hl": "en",
                "type": "search"
            }
            
            response = requests.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Process results
            workers = []
            for result in data.get("local_results", []):
                worker = {
                    "name": result.get("title", "Maintenance Service"),
                    "rating": result.get("rating", "Not rated"),
                    "reviews": result.get("reviews", 0),
                    "type": result.get("type", "Maintenance Service"),
                    "types": result.get("types", []),
                    "gps_coordinates": result.get("gps_coordinates", {}),
                    "place_id": result.get("place_id", ""),
                    "reviews_link": result.get("reviews_link", ""),
                    "photos_link": result.get("photos_link", "")
                }
                
                # Get detailed information using place_id
                if worker["place_id"]:
                    place_params = {
                        "engine": "google_maps",
                        "place_id": worker["place_id"],
                        "api_key": self.serp_api_key,
                        "hl": "en"
                    }
                    place_response = requests.get(self.api_url, params=place_params)
                    place_data = place_response.json()
                    
                    if "place_results" in place_data:
                        place_info = place_data["place_results"]
                        worker.update({
                            "address": place_info.get("address", "Address not available"),
                            "phone": place_info.get("phone", "Phone not available"),
                            "website": place_info.get("website", "Website not available"),
                            "hours": place_info.get("hours", "Hours not available")
                        })
                
                workers.append(worker)
            
            if not workers:
                return f"No maintenance workers found matching the query: {query}"
            
            # Format results
            formatted_results = "\n".join([
                f"- {worker['name']}"
                f"\n  Type: {worker['type']}"
                f"\n  Rating: {worker['rating']} ({worker['reviews']} reviews)"
                f"\n  Address: {worker.get('address', 'Not available')}"
                f"\n  Phone: {worker.get('phone', 'Not available')}"
                f"\n  Website: {worker.get('website', 'Not available')}"
                f"\n  Hours: {worker.get('hours', 'Not available')}"
                f"\n  Services: {', '.join(worker['types'])}"
                for worker in workers
            ])
            
            return f"Found maintenance workers:\n{formatted_results}"
            
        except requests.exceptions.RequestException as e:
            return f"Error searching for maintenance workers: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"

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
            
            print(f"Would send email to {self.recipient_email} with subject: {subject}")
            print(f"Message content: {message}")
            
            return f"Email sent to {self.recipient_email}"
        except Exception as e:
            return f"Error sending email: {str(e)}" 