from supabase_client import SupabaseClient
from dotenv import load_dotenv
import os

def test_supabase_connection():
    # Load environment variables
    load_dotenv()
    
    # Initialize Supabase client
    client = SupabaseClient()
    
    # Test connection by trying to get search results
    try:
        results = client.get_search_results()
        print("Successfully connected to Supabase!")
        print("Current search results:", results)
    except Exception as e:
        print("Error connecting to Supabase:", str(e))

if __name__ == "__main__":
    test_supabase_connection() 