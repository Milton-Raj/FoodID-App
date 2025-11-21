from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import shutil
from datetime import datetime
from services.supabase_client import get_user_by_id, update_user_profile

router = APIRouter()

# Pydantic Models
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    phone_number: str
    name: Optional[str]
    email: Optional[str]
    profile_image: Optional[str]
    coins: int
    created_at: str
    updated_at: str

@router.get("/profile/{user_id}")
async def get_profile(user_id: int):
    """Get user profile from Supabase"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/profile/{user_id}")
async def update_profile(user_id: int, profile: ProfileUpdate):
    """Update user profile (phone_number is not editable)"""
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update profile in Supabase
    updated_user = update_user_profile(
        user_id=user_id,
        name=profile.name,
        email=profile.email
    )
    
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    
    return updated_user

@router.post("/profile/upload-image")
async def upload_profile_image(user_id: int, file: UploadFile = File(...)):
    """Upload profile image"""
    # Verify user exists
    user = get_user_by_id(user_id)
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
    
    # Update user profile in Supabase
    updated_user = update_user_profile(user_id=user_id, profile_image=file_path)
    
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update profile image")
    
    return {
        "success": True,
        "profile_image": file_path,
        "message": "Profile image uploaded successfully"
    }
