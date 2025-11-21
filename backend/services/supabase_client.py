import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ieetnyykalsijqncljlj.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXRueXlrYWxzaWpxbmNsamxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM5NDksImV4cCI6MjA3OTIxOTk0OX0.tGwiddcjebgeAqKrihFw_sQqxD9lLhxCsf9Zl1MFHRU')

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_scan(user_id: int, food_name: str, confidence: int, image_path: str, nutrition_json: str):
    """Create a new scan record in Supabase"""
    try:
        data = {
            'user_id': user_id,
            'food_name': food_name,
            'confidence': confidence,
            'image_path': image_path,
            'nutrition_json': nutrition_json
        }
        result = supabase.table('scans').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating scan: {e}")
        return None

def get_recent_scans(user_id: int, limit: int = 10):
    """Get recent scans for a user"""
    try:
        result = supabase.table('scans')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching scans: {e}")
        return []

def get_scan_by_id(scan_id: str):
    """Get a specific scan by ID"""
    try:
        result = supabase.table('scans')\
            .select('*')\
            .eq('id', scan_id)\
            .single()\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching scan: {e}")
        return None
