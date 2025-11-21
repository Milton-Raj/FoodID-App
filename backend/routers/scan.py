from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import random
import json
import os
from database import get_db
from models import Scan
from services.ai_recognition import recognize_food, get_nutritional_data

router = APIRouter()

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Save file locally
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Use AI to recognize food
    recognition_result = recognize_food(file_location)
    food_name = recognition_result['name']
    confidence = recognition_result['confidence']
    
    # Get nutritional data
    nutrition_data = get_nutritional_data(food_name)
    
    # Combine results
    result = {
        "name": food_name,
        "confidence": confidence,
        "calories": nutrition_data['calories'],
        "macros": {
            "protein": nutrition_data['protein'],
            "carbs": nutrition_data['carbs'],
            "fat": nutrition_data['fat']
        },
        "healthScore": nutrition_data['healthScore'],
        "ingredients": nutrition_data['ingredients']
    }
    
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
    
    return result
