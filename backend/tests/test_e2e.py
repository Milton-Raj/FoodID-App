from fastapi.testclient import TestClient
import os
import sys

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)

def test_analyze_and_history_flow():
    # 1. Upload image for analysis
    image_path = os.path.join(os.path.dirname(__file__), '../uploads/test_food.jpg')
    
    # Create a dummy file if it doesn't exist
    if not os.path.exists(image_path):
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, 'wb') as f:
            f.write(b'fake image content')

    with open(image_path, 'rb') as f:
        response = client.post(
            "/api/scan/analyze",
            files={"file": ("test_food.jpg", f, "image/jpeg")}
        )
    
    assert response.status_code == 200
    data = response.json()
    print(f"Analyze Response: {data}")
    
    assert "name" in data
    assert "confidence" in data
    assert "macros" in data
    
    food_name = data["name"]
    
    # 2. Check recent scans to verify it was saved
    response = client.get("/api/scan/recent?user_id=1&limit=5")
    assert response.status_code == 200
    history = response.json()
    print(f"History Response: {history}")
    
    assert len(history) > 0
    # Check if the most recent scan matches our analysis
    # Note: Since we might have concurrent tests or previous data, we just check if it's in the list
    found = False
    for item in history:
        if item["food_name"] == food_name:
            found = True
            break
    
    assert found, f"Analyzed food '{food_name}' not found in history"

if __name__ == "__main__":
    test_analyze_and_history_flow()
    print("E2E Test Passed!")
