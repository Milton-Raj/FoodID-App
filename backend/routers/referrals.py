from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/referrals", tags=["Referral Management"])

class ReferralCreate(BaseModel):
    code: str
    user_id: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True

class ReferralUpdate(BaseModel):
    user_id: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

@router.get("/")
async def list_referrals():
    try:
        resp = get_supabase_client().table('referral_codes').select('*').order('created_at', desc=True).execute()
        return resp.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_referral(ref: ReferralCreate):
    try:
        data = {
            "code": ref.code,
            "user_id": ref.user_id,
            "expires_at": ref.expires_at.isoformat() if ref.expires_at else None,
            "is_active": ref.is_active,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        resp = get_supabase_client().table('referral_codes').insert(data).execute()
        return {"message": "Referral created", "referral": resp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ref_id}")
async def update_referral(ref_id: int, ref: ReferralUpdate):
    try:
        update_data = {k: v for k, v in ref.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        resp = get_supabase_client().table('referral_codes').update(update_data).eq('id', ref_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Referral not found")
        return {"message": "Referral updated", "referral": resp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ref_id}")
async def delete_referral(ref_id: int):
    try:
        resp = get_supabase_client().table('referral_codes').delete().eq('id', ref_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Referral not found")
        return {"message": "Referral deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{ref_id}/toggle")
async def toggle_referral(ref_id: int):
    try:
        # get current status
        cur = get_supabase_client().table('referral_codes').select('is_active').eq('id', ref_id).execute()
        if not cur.data:
            raise HTTPException(status_code=404, detail="Referral not found")
        new_status = not cur.data[0]['is_active']
        resp = get_supabase_client().table('referral_codes').update({"is_active": new_status, "updated_at": datetime.utcnow().isoformat()}).eq('id', ref_id).execute()
        return {"message": f"Referral {'activated' if new_status else 'deactivated'}", "is_active": new_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
