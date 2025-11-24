from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from services.supabase_client import (
    get_user_by_id,
    create_referral,
    get_user_referrals,
    redeem_referral
)

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
    created_at: str

class ReferralStats(BaseModel):
    total_referrals: int
    pending: int
    accepted: int
    registered: int

@router.post("/referrals/send")
async def send_referrals(referral: ReferralRequest):
    """Send referrals to multiple phone numbers in Supabase"""
    # Verify user exists
    user = get_user_by_id(referral.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    created_referrals = []
    
    for phone in referral.phone_numbers:
        # Create referral in Supabase
        new_referral = create_referral(referral.user_id, phone)
        if new_referral:
            created_referrals.append(new_referral)
    
    return {
        "success": True,
        "message": f"Referrals sent to {len(created_referrals)} contacts",
        "referrals": created_referrals
    }

@router.get("/referrals/{user_id}")
async def get_referrals(user_id: int):
    """Get user's referral history from Supabase"""
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get referrals from Supabase
    referrals = get_user_referrals(user_id)
    return referrals

@router.get("/referrals/{user_id}/stats")
async def get_referral_stats(user_id: int):
    """Get referral statistics for a user from Supabase"""
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get referrals from Supabase
    referrals = get_user_referrals(user_id)
    
    stats = {
        "total_referrals": len(referrals),
        "pending": sum(1 for r in referrals if r.get("status") == "pending"),
        "accepted": sum(1 for r in referrals if r.get("status") == "accepted"),
        "registered": sum(1 for r in referrals if r.get("status") == "registered")
    }
    
    return stats

# -------------------------------------------------
# Referral Redeem Endpoint
# -------------------------------------------------

@router.post("/referrals/redeem")
async def redeem_referral_endpoint(referral_id: int, new_user_id: int):
    """Redeem a referral and award bonus coins to both parties.
    Returns the updated referral record.
    """
    # Verify referral exists and user exists are handled in service
    result = redeem_referral(referral_id, new_user_id)
    if not result:
        raise HTTPException(status_code=400, detail="Referral redemption failed")
    return {
        "success": True,
        "referral": result
    }
