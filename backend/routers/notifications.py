from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from services.supabase_client import (
    get_user_notifications,
    get_user_by_id,
    mark_notification_read as mark_read_in_db,
    create_notification
)

router = APIRouter()

# Pydantic Models
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    extra_data: Optional[dict]
    read: bool
    created_at: str

@router.get("/notifications/{user_id}")
async def get_notifications(user_id: int, limit: int = 50):
    """Get all notifications for a user from Supabase"""
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get notifications from Supabase
    notifications = get_user_notifications(user_id, limit)
    return notifications

@router.get("/notifications/detail/{notification_id}")
async def get_notification_detail(notification_id: int):
    """Get specific notification details from Supabase"""
    from services.supabase_client import get_supabase_client
    
    try:
        supabase = get_supabase_client()
        result = supabase.table('notifications').select('*').eq('id', notification_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return result.data
    except Exception as e:
        print(f"Error fetching notification: {e}")
        raise HTTPException(status_code=404, detail="Notification not found")

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    """Mark notification as read in Supabase"""
    success = mark_read_in_db(notification_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {
        "success": True,
        "message": "Notification marked as read"
    }

@router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: int):
    """Get count of unread notifications from Supabase"""
    from services.supabase_client import get_supabase_client
    
    try:
        supabase = get_supabase_client()
        result = supabase.table('notifications')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .eq('read', False)\
            .execute()
        
        return {
            "user_id": user_id,
            "unread_count": result.count or 0
        }
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return {
            "user_id": user_id,
            "unread_count": 0
        }

# -------------------------------------------------
# Create Notification Endpoint
# -------------------------------------------------

@router.post("/create")
async def create_notification_endpoint(user_id: int, title: str, message: str, notification_type: str = "system", extra_data: dict = None):
    """Create a new notification for a user."""
    notif = create_notification(user_id, title, message, notification_type, extra_data)
    if not notif:
        raise HTTPException(status_code=500, detail="Failed to create notification")
    return {
        "success": True,
        "notification": notif
    }
