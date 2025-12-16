from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import json
import os
from PIL import Image
import io
from backend.database import get_db
from backend.services.ai_recognition import recognize_food, get_nutritional_data
from backend.services.supabase_client import create_scan, get_recent_scans

router = APIRouter()

def compress_image(file_content: bytes, max_size_kb: int = 500) -> bytes:
    """Compress image to reduce file size and improve performance"""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Resize if too large (max 1024px on longest side)
        max_dimension = 1024
        if max(image.size) > max_dimension:
            ratio = max_dimension / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Compress with quality adjustment
        output = io.BytesIO()
        quality = 85
        image.save(output, format='JPEG', quality=quality, optimize=True)
        
        # If still too large, reduce quality
        while output.tell() > max_size_kb * 1024 and quality > 50:
            output = io.BytesIO()
            quality -= 10
            image.save(output, format='JPEG', quality=quality, optimize=True)
        
        return output.getvalue()
    except Exception as e:
        print(f"Image compression error: {e}")
        return file_content

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...), user_id: int = 1):
    # Read and compress image
    file_content = await file.read()
    compressed_content = compress_image(file_content)
    
    # Save compressed file locally
    # Save compressed file locally
    if os.getenv("VERCEL"):
        upload_dir = "/tmp/uploads"
    else:
        upload_dir = "uploads"
    
    file_location = f"{upload_dir}/{file.filename}"
    os.makedirs(upload_dir, exist_ok=True)
    with open(file_location, "wb") as file_object:
        file_object.write(compressed_content)
    
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
    
    # Save to Supabase
    create_scan(
        user_id=user_id,
        food_name=result["name"],
        confidence=result["confidence"],
        image_path=file_location,
        nutrition_json=json.dumps(result)
    )
    
    # Award coins for the scan
    from backend.routers.coins import award_coins
    coin_result = award_coins(
        user_id=user_id,
        amount=1,
        transaction_type="scan",
        description=f"Scanned {food_name}"
    )
    
    # Add coin information to result
    result["coins_earned"] = 1
    result["total_coins"] = coin_result["new_balance"]
    
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
