from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import random
import json
from database import get_db
from models import Scan

router = APIRouter()

# Mock Data for AI Prediction
MOCK_FOODS = [
    {
        "name": "Grilled Chicken Salad",
        "confidence": 98,
        "calories": 350,
        "macros": {"protein": "32g", "carbs": "12g", "fat": "18g"},
        "healthScore": 92,
        "ingredients": ["Chicken Breast", "Lettuce", "Cherry Tomatoes", "Olive Oil"]
    },
    {
        "name": "Margherita Pizza",
        "confidence": 95,
        "calories": 800,
        "macros": {"protein": "25g", "carbs": "90g", "fat": "35g"},
        "healthScore": 45,
        "ingredients": ["Pizza Dough", "Tomato Sauce", "Mozzarella Cheese", "Basil"]
    },
    {
        "name": "Avocado Toast",
        "confidence": 99,
        "calories": 420,
        "macros": {"protein": "12g", "carbs": "45g", "fat": "22g"},
        "healthScore": 85,
        "ingredients": ["Sourdough Bread", "Avocado", "Red Pepper Flakes", "Lemon Juice"]
    }
]

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Save file locally
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Simulate AI processing time? No need for MVP speed.
    # Pick a random result
    result = random.choice(MOCK_FOODS)
    
    # Save to DB (Mock user ID 1 for now since we don't have auth middleware on this yet)
    # In real app, get user from token
    db_scan = Scan(
        user_id=1, 
        food_name=result["name"], 
        confidence=result["confidence"],
        image_path=file_location,
        nutrition_json=json.dumps(result)
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    # Add image URL to result for frontend display if needed
    # result["imageUrl"] = f"http://localhost:8000/static/{file.filename}"
    
    return result
