from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

# Pydantic Models
class ReferralRequest(BaseModel):
    user_id: int
    phone_numbers: List[str]

class ReferralResponse(BaseModel):
    id: int
    referrer_id: int
    referred_phone: str
    status: str
    created_at: datetime

class ReferralStats(BaseModel):
    total_referrals: int
    pending: int
    accepted: int
    registered: int

# Mock referrals database
mock_referrals = []
referral_id_counter = 1

@router.post("/referrals/send")
async def send_referrals(referral: ReferralRequest):
    """Send referrals to multiple phone numbers"""
    global referral_id_counter
    
    created_referrals = []
    
    for phone in referral.phone_numbers:
        # Check if already referred by this user
        existing = next(
            (r for r in mock_referrals 
             if r["referrer_id"] == referral.user_id and r["referred_phone"] == phone),
            None
        )
        
        if existing:
            continue  # Skip duplicates
        
        new_referral = {
            "id": referral_id_counter,
            "referrer_id": referral.user_id,
            "referred_phone": phone,
            "referred_user_id": None,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        
        mock_referrals.append(new_referral)
        created_referrals.append(new_referral)
        referral_id_counter += 1
    
    return {
        "success": True,
        "message": f"Referrals sent to {len(created_referrals)} contacts",
        "referrals": created_referrals
    }

@router.get("/referrals/{user_id}")
async def get_referrals(user_id: int):
    """Get user's referral history"""
    user_referrals = [r for r in mock_referrals if r["referrer_id"] == user_id]
    
    # Sort by created_at descending
    user_referrals.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_referrals

@router.get("/referrals/{user_id}/stats")
async def get_referral_stats(user_id: int):
    """Get referral statistics for a user"""
    user_referrals = [r for r in mock_referrals if r["referrer_id"] == user_id]
    
    stats = {
        "total_referrals": len(user_referrals),
        "pending": sum(1 for r in user_referrals if r["status"] == "pending"),
        "accepted": sum(1 for r in user_referrals if r["status"] == "accepted"),
        "registered": sum(1 for r in user_referrals if r["status"] == "registered")
    }
    
    return stats
