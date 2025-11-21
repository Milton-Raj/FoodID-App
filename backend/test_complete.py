import requests
import json
import os
from io import BytesIO
from PIL import Image

# Test the analyze endpoint with a real test image

BASE_URL = "http://localhost:8000"

def create_test_image():
    """Create a simple test image"""
    # Create a simple colored image
    img = Image.new('RGB', (800, 600), color=(255, 100, 100))
    
    # Save to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes

def test_analyze_with_image():
    """Test analyze endpoint with actual image"""
    print("=" * 60)
    print("Testing /scan/analyze with real image...")
    print("=" * 60 + "\n")
    
    # Create test image
    img_bytes = create_test_image()
    
    # Send to API
    files = {'file': ('test_food.jpg', img_bytes, 'image/jpeg')}
    
    try:
        response = requests.post(f"{BASE_URL}/scan/analyze", files=files, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ SUCCESS! Food Analysis Result:")
            print(f"  Food Name: {data.get('name')}")
            print(f"  Confidence: {data.get('confidence')}%")
            print(f"  Calories: {data.get('calories')}")
            print(f"  Health Score: {data.get('healthScore')}/100")
            print(f"  Protein: {data.get('macros', {}).get('protein')}")
            print(f"  Carbs: {data.get('macros', {}).get('carbs')}")
            print(f"  Fat: {data.get('macros', {}).get('fat')}")
            print(f"  Ingredients: {', '.join(data.get('ingredients', []))}")
            return True
        else:
            print(f"\n❌ FAILED with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (>30s)")
        print("This might indicate Clarifai API is slow or not responding")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_database_connection():
    """Test Supabase database connection"""
    print("\n" + "=" * 60)
    print("Testing Supabase Database Connection...")
    print("=" * 60 + "\n")
    
    try:
        response = requests.get(f"{BASE_URL}/scan/recent?user_id=1&limit=5")
        
        if response.status_code == 200:
            scans = response.json()
            print(f"✅ Database connection successful!")
            print(f"Found {len(scans)} scans in database")
            
            if scans:
                print("\nMost recent scan:")
                latest = scans[0]
                print(f"  Food: {latest.get('food_name')}")
                print(f"  Confidence: {latest.get('confidence')}%")
                print(f"  Date: {latest.get('created_at')}")
            else:
                print("\n⚠️  Database is empty (no scans yet)")
                print("This is normal if you haven't run the SQL schema yet")
            
            return True
        else:
            print(f"❌ Database connection failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    print("\n🧪 FoodID Complete API Testing\n")
    
    # Test analyze endpoint
    analyze_success = test_analyze_with_image()
    
    # Test database
    db_success = test_database_connection()
    
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)
    print(f"Analyze Endpoint: {'✅ PASS' if analyze_success else '❌ FAIL'}")
    print(f"Database Connection: {'✅ PASS' if db_success else '❌ FAIL'}")
    print("=" * 60 + "\n")
