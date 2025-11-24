from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    title: str
    message: str
    target_audience: str = "all"
    priority: str = "normal"
    send_now: bool = True
    scheduled_for: Optional[datetime] = None

class ScheduledNotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    status: Optional[str] = None

@router.post("/send")
async def send_notification(notif: NotificationCreate):
    """Send or schedule a notification"""
    try:
        supabase = get_supabase_client()
        
        if notif.send_now:
            # Send immediately to all users or specific audience
            # For now, we'll create notification records for all users
            users_response = supabase.table('users').select('id').execute()
            
            notifications_to_create = []
            for user in users_response.data:
                notifications_to_create.append({
                    'user_id': user['id'],
                    'title': notif.title,
                    'message': notif.message,
                    'notification_type': notif.priority,
                    'read': False
                })
            
            if notifications_to_create:
                supabase.table('notifications').insert(notifications_to_create).execute()
            
            return {
                "message": "Notification sent successfully",
                "recipients": len(notifications_to_create)
            }
        else:
            # Schedule for later
            if not notif.scheduled_for:
                raise HTTPException(status_code=400, detail="scheduled_for is required when send_now is False")
            
            scheduled_data = {
                'title': notif.title,
                'message': notif.message,
                'target_audience': notif.target_audience,
                'priority': notif.priority,
                'scheduled_for': notif.scheduled_for.isoformat(),
                'status': 'pending'
            }
            
            response = supabase.table('scheduled_notifications').insert(scheduled_data).execute()
            
            return {
                "message": "Notification scheduled successfully",
                "scheduled_notification": response.data[0] if response.data else None
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled")
async def get_scheduled_notifications():
    """Get all scheduled notifications"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('scheduled_notifications').select('*').order('scheduled_for', desc=False).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/scheduled/{notification_id}")
async def update_scheduled_notification(notification_id: int, update: ScheduledNotificationUpdate):
    """Update a scheduled notification"""
    try:
        supabase = get_supabase_client()
        
        update_data = {k: v.isoformat() if isinstance(v, datetime) else v 
                      for k, v in update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table('scheduled_notifications').update(update_data).eq('id', notification_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled notification not found")
        
        return {
            "message": "Scheduled notification updated successfully",
            "notification": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/scheduled/{notification_id}")
async def delete_scheduled_notification(notification_id: int):
    """Delete a scheduled notification"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('scheduled_notifications').delete().eq('id', notification_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled notification not found")
        
        return {"message": "Scheduled notification deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_notification_history(limit: int = 100):
    """Get notification history"""
    try:
        supabase = get_supabase_client()
        
        # Get sent scheduled notifications
        response = supabase.table('scheduled_notifications')\
            .select('*')\
            .eq('status', 'sent')\
            .order('sent_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
