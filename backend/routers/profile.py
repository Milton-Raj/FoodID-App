from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import shutil
from datetime import datetime

router = APIRouter()

# Pydantic Models
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class ProfileResponse(BaseModel):
    id: int
    phone_number: str
    name: Optional[str]
    email: Optional[str]
    profile_image: Optional[str]
    coins: int
    created_at: datetime
    updated_at: datetime

# Mock database for now - will integrate with real DB
mock_users = {
    1: {
        "id": 1,
        "phone_number": "+1234567890",
        "name": "Demo User",
        "email": "demo@foodid.com",
        "profile_image": None,
        "coins": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
}

@router.get("/profile/{user_id}")
async def get_profile(user_id: int):
    """Get user profile"""
    user = mock_users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/profile/{user_id}")
async def update_profile(user_id: int, profile: ProfileUpdate):
    """Update user profile (phone_number is not editable)"""
    user = mock_users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only editable fields
    if profile.name is not None:
        user["name"] = profile.name
    if profile.email is not None:
        user["email"] = profile.email
    
    user["updated_at"] = datetime.utcnow()
    
    return user

@router.post("/profile/upload-image")
async def upload_profile_image(user_id: int, file: UploadFile = File(...)):
    """Upload profile image"""
    user = mock_users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create profile_images directory if it doesn't exist
    os.makedirs("uploads/profile_images", exist_ok=True)
    
    # Save file with unique name
    file_extension = file.filename.split(".")[-1]
    file_name = f"user_{user_id}_{int(datetime.utcnow().timestamp())}.{file_extension}"
    file_path = f"uploads/profile_images/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile
    user["profile_image"] = file_path
    user["updated_at"] = datetime.utcnow()
    
    return {
        "success": True,
        "profile_image": file_path,
        "message": "Profile image uploaded successfully"
    }
