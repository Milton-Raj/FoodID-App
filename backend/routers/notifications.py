from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import json

router = APIRouter()

# Pydantic Models
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    extra_data: Optional[str] # Changed from metadata to extra_data and type to str
    read: bool
    created_at: datetime

# Mock notifications database
mock_notifications = [
    {
        "id": 1,
        "user_id": 1,
        "title": "Welcome to FoodID! 🎉",
        "message": "Start scanning your meals to track nutrition and earn coins with every scan!",
        "notification_type": "system",
        "extra_data": json.dumps({"welcome_bonus": 10}),
        "read": False,
        "created_at": datetime.utcnow() - timedelta(hours=2)
    },
    {
        "id": 2,
        "user_id": 1,
        "title": "First Scan Complete! 🏆",
        "message": "Congratulations on your first food scan. You earned 1 coin!",
        "notification_type": "achievement",
        "extra_data": json.dumps({"coins_earned": 1, "food_name": "Apple"}),
        "read": True,
        "created_at": datetime.utcnow() - timedelta(days=1)
    },
    {
        "id": 3,
        "user_id": 1,
        "title": "Referral Bonus Available 👥",
        "message": "Invite friends to earn bonus coins. Share FoodID today!",
        "notification_type": "referral",
        "extra_data": json.dumps({"bonus_per_referral": 5}),
        "read": False,
        "created_at": datetime.utcnow() - timedelta(days=2)
    }
]

@router.get("/notifications/{user_id}")
async def get_notifications(user_id: int, limit: int = 50):
    """Get all notifications for a user"""
    user_notifications = [n for n in mock_notifications if n["user_id"] == user_id]
    
    # Sort by created_at descending
    user_notifications.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_notifications[:limit]

@router.get("/notifications/detail/{notification_id}")
async def get_notification_detail(notification_id: int):
    """Get specific notification details"""
    for notification in mock_notifications:
        if notification["id"] == notification_id:
            return notification
    
    raise HTTPException(status_code=404, detail="Notification not found")

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    """Mark notification as read"""
    for notification in mock_notifications:
        if notification["id"] == notification_id:
            notification["read"] = True
            return {
                "success": True,
                "message": "Notification marked as read"
            }
    
    raise HTTPException(status_code=404, detail="Notification not found")

@router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: int):
    """Get count of unread notifications"""
    user_notifications = [n for n in mock_notifications if n["user_id"] == user_id]
    unread_count = sum(1 for n in user_notifications if not n["read"])
    
    return {
        "user_id": user_id,
        "unread_count": unread_count
    }
