import requests
import json
import os

# Test the FoodID backend API

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✅ Health check passed\n")

def test_analyze_food():
    """Test food analysis with a sample image"""
    print("Testing /scan/analyze endpoint...")
    
    # Create a simple test image file
    test_image_path = "test_food.jpg"
    
    # Check if we have any existing images in uploads
    uploads_dir = "../uploads"
    if os.path.exists(uploads_dir) and os.listdir(uploads_dir):
        existing_images = [f for f in os.listdir(uploads_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
        if existing_images:
            test_image_path = os.path.join(uploads_dir, existing_images[0])
            print(f"Using existing image: {test_image_path}")
    
    if not os.path.exists(test_image_path):
        print(f"⚠️  No test image found at {test_image_path}")
        print("Skipping analyze test - need actual image file")
        return None
    
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test.jpg', f, 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/scan/analyze", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Food Name: {data.get('name')}")
        print(f"Confidence: {data.get('confidence')}%")
        print(f"Calories: {data.get('calories')}")
        print(f"Health Score: {data.get('healthScore')}")
        print("✅ Analyze test passed\n")
        return data
    else:
        print(f"❌ Analyze test failed: {response.text}\n")
        return None

def test_recent_scans():
    """Test recent scans endpoint"""
    print("Testing /scan/recent endpoint...")
    response = requests.get(f"{BASE_URL}/scan/recent?user_id=1&limit=10")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        scans = response.json()
        print(f"Found {len(scans)} recent scans")
        if scans:
            print(f"Latest scan: {scans[0].get('food_name')}")
        print("✅ Recent scans test passed\n")
        return scans
    else:
        print(f"❌ Recent scans test failed: {response.text}\n")
        return []

def test_performance():
    """Test API performance"""
    print("Testing API performance...")
    import time
    
    # Test health endpoint speed
    start = time.time()
    requests.get(f"{BASE_URL}/health")
    health_time = time.time() - start
    print(f"Health endpoint: {health_time*1000:.2f}ms")
    
    # Test recent scans speed
    start = time.time()
    requests.get(f"{BASE_URL}/scan/recent?user_id=1&limit=10")
    recent_time = time.time() - start
    print(f"Recent scans endpoint: {recent_time*1000:.2f}ms")
    
    if health_time < 0.1 and recent_time < 0.5:
        print("✅ Performance test passed\n")
    else:
        print("⚠️  Performance could be improved\n")

if __name__ == "__main__":
    print("=" * 50)
    print("FoodID Backend API Tests")
    print("=" * 50 + "\n")
    
    try:
        test_health()
        test_analyze_food()
        test_recent_scans()
        test_performance()
        
        print("=" * 50)
        print("All tests completed!")
        print("=" * 50)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
