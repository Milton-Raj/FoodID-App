from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import json
import os
from database import get_db
from services.ai_recognition import recognize_food, get_nutritional_data
from services.supabase_client import create_scan, get_recent_scans

router = APIRouter()

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...)):
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
    
    # Save to Supabase (Mock user ID 1 for now)
    create_scan(
        user_id=1,
        food_name=result["name"],
        confidence=result["confidence"],
        image_path=file_location,
        nutrition_json=json.dumps(result)
    )
    
    return result

@router.get("/recent")
async def get_recent(user_id: int = 1, limit: int = 10):
    """Get recent scans for a user"""
    scans = get_recent_scans(user_id, limit)
    
    # Parse nutrition_json for each scan
    for scan in scans:
        if scan.get('nutrition_json'):
            scan['nutrition_data'] = json.loads(scan['nutrition_json']) if isinstance(scan['nutrition_json'], str) else scan['nutrition_json']
    
    return scans
