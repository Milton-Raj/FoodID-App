import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from backend.services.supabase_client import get_supabase_client

def test_supabase_connection():
    print("Testing Supabase connection...")
    try:
        client = get_supabase_client()
        # Try to select from scans table, limit 1
        response = client.table('scans').select("*").limit(1).execute()
        print("Connection successful!")
        print(f"Data: {response.data}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_supabase_connection()
