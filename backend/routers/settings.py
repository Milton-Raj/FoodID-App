from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/settings", tags=["App Settings"])

# Pydantic Models
class SettingUpdate(BaseModel):
    setting_value: str

class BulkSettingsUpdate(BaseModel):
    settings: Dict[str, str]

# ============================================
# APP SETTINGS ENDPOINTS
# ============================================

@router.get("")
async def get_all_settings():
    """Get all app settings"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('app_settings').select('*').order('category').execute()
        
        # Group by category
        settings_by_category = {}
        for setting in response.data:
            category = setting.get('category', 'general')
            if category not in settings_by_category:
                settings_by_category[category] = []
            settings_by_category[category].append(setting)
        
        return settings_by_category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category/{category}")
async def get_settings_by_category(category: str):
    """Get settings by category"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('app_settings')\
            .select('*')\
            .eq('category', category)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{setting_key}")
async def get_setting(setting_key: str):
    """Get single setting by key"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('app_settings')\
            .select('*')\
            .eq('setting_key', setting_key)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{setting_key}")
async def update_setting(setting_key: str, update: SettingUpdate):
    """Update single setting"""
    try:
        supabase = get_supabase_client()
        
        update_data = {
            'setting_value': update.setting_value,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('app_settings')\
            .update(update_data)\
            .eq('setting_key', setting_key)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return {
            "message": "Setting updated successfully",
            "setting": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/bulk/update")
async def bulk_update_settings(update: BulkSettingsUpdate):
    """Update multiple settings at once"""
    try:
        supabase = get_supabase_client()
        updated_settings = []
        
        for setting_key, setting_value in update.settings.items():
            update_data = {
                'setting_value': setting_value,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = supabase.table('app_settings')\
                .update(update_data)\
                .eq('setting_key', setting_key)\
                .execute()
            
            if response.data:
                updated_settings.append(response.data[0])
        
        return {
            "message": f"Updated {len(updated_settings)} settings",
            "settings": updated_settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
