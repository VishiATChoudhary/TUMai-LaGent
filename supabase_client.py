from supabase import create_client, Client
import os
from typing import Dict, Any, List

class SupabaseClient:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("PROJECT_URL_SUPABASE"),
            os.getenv("VITE_SUPABASE_ANON_KEY")
        )

    def store_search_results(self, search_query: str, results: List[Dict[str, Any]]) -> None:
        """Store search results in the Supabase database"""
        try:
            for result in results:
                data = {
                    "search_query": search_query,
                    "name": result.get("name", ""),
                    "rating": result.get("rating", ""),
                    "reviews": result.get("reviews", 0),
                    "type": result.get("type", ""),
                    "address": result.get("address", ""),
                    "phone": result.get("phone", ""),
                    "website": result.get("website", ""),
                    "hours": result.get("hours", ""),
                    "services": result.get("types", []),
                    "gps_coordinates": result.get("gps_coordinates", {}),
                    "place_id": result.get("place_id", ""),
                    "reviews_link": result.get("reviews_link", ""),
                    "photos_link": result.get("photos_link", "")
                }
                self.supabase.table("maintenance_search_results").insert(data).execute()
        except Exception as e:
            print(f"Error storing search results: {str(e)}")

    def get_search_results(self, search_query: str = None) -> List[Dict[str, Any]]:
        """Retrieve search results from the Supabase database"""
        try:
            query = self.supabase.table("maintenance_search_results").select("*")
            if search_query:
                query = query.eq("search_query", search_query)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error retrieving search results: {str(e)}")
            return [] 