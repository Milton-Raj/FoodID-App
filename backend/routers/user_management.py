from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/users", tags=["User Management"])

# Pydantic Models
class UserCreate(BaseModel):
    phone_number: str
    name: Optional[str] = None
    email: Optional[str] = None
    coins: int = 0

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    coins: Optional[int] = None

# ============================================
# USER MANAGEMENT ENDPOINTS
# ============================================

@router.post("/create")
async def create_user(user: UserCreate):
    """Create a new user"""
    try:
        supabase = get_supabase_client()
        
        # Check if user already exists
        existing = supabase.table('users').select('*').eq('phone_number', user.phone_number).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User with this phone number already exists")
        
        user_data = {
            'phone_number': user.phone_number,
            'name': user.name,
            'email': user.email,
            'coins': user.coins,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('users').insert(user_data).execute()
        
        return {
            "message": "User created successfully",
            "user": response.data[0] if response.data else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate):
    """Update user details"""
    try:
        supabase = get_supabase_client()
        
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table('users').update(update_data).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "message": "User updated successfully",
            "user": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
