import os
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
from datetime import datetime

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ieetnyykalsijqncljlj.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXRueXlrYWxzaWpxbmNsamxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM5NDksImV4cCI6MjA3OTIxOTk0OX0.tGwiddcjebgeAqKrihFw_sQqxD9lLhxCsf9Zl1MFHRU')

# Singleton pattern for Supabase client (improves performance)
_supabase_client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client (singleton pattern for performance)"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

# ============================================
# USER PROFILE FUNCTIONS
# ============================================

def create_user(phone_number: str, name: str = None, email: str = None) -> Optional[Dict]:
    """Create a new user or get existing user by phone number"""
    try:
        supabase = get_supabase_client()
        
        # Check if user already exists
        existing = supabase.table('users').select('*').eq('phone_number', phone_number).execute()
        if existing.data:
            return existing.data[0]
        
        # Create new user
        data = {
            'phone_number': phone_number,
            'name': name,
            'email': email,
            'coins': 0
        }
        result = supabase.table('users').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def get_user_by_phone(phone_number: str) -> Optional[Dict]:
    """Get user by phone number"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('users').select('*').eq('phone_number', phone_number).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('users').select('*').eq('id', user_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

def update_user_profile(user_id: int, name: str = None, email: str = None, profile_image: str = None) -> Optional[Dict]:
    """Update user profile information"""
    try:
        supabase = get_supabase_client()
        data = {}
        if name is not None:
            data['name'] = name
        if email is not None:
            data['email'] = email
        if profile_image is not None:
            data['profile_image'] = profile_image
        
        if not data:
            return None
            
        result = supabase.table('users').update(data).eq('id', user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return None

def update_user_coins(user_id: int, amount: int) -> Optional[Dict]:
    """Update user coin balance (increment/decrement)"""
    try:
        supabase = get_supabase_client()
        # Get current coins
        user = get_user_by_id(user_id)
        if not user:
            return None
        
        new_balance = user['coins'] + amount
        result = supabase.table('users').update({'coins': new_balance}).eq('id', user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error updating user coins: {e}")
        return None

# ============================================
# SCAN FUNCTIONS
# ============================================

def create_scan(user_id: int, food_name: str, confidence: int, image_path: str, nutrition_json: str):
    """Create a new scan record in Supabase"""
    try:
        supabase = get_supabase_client()
        data = {
            'user_id': user_id,
            'food_name': food_name,
            'confidence': confidence,
            'image_path': image_path,
            'nutrition_json': nutrition_json
        }
        result = supabase.table('scans').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating scan: {e}")
        return None

def get_recent_scans(user_id: int, limit: int = 10):
    """Get recent scans for a user"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('scans')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching scans: {e}")
        return []

def get_scan_by_id(scan_id: str):
    """Get a specific scan by ID"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('scans')\
            .select('*')\
            .eq('id', scan_id)\
            .single()\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching scan: {e}")
        return None

# ============================================
# NOTIFICATION FUNCTIONS
# ============================================

def create_notification(user_id: int, title: str, message: str, notification_type: str = 'system', extra_data: Dict = None) -> Optional[Dict]:
    """Create a new notification"""
    try:
        supabase = get_supabase_client()
        data = {
            'user_id': user_id,
            'title': title,
            'message': message,
            'notification_type': notification_type,
            'extra_data': extra_data,
            'read': False
        }
        result = supabase.table('notifications').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

def get_user_notifications(user_id: int, limit: int = 50) -> List[Dict]:
    """Get all notifications for a user"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('notifications')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []

def mark_notification_read(notification_id: int) -> bool:
    """Mark a notification as read"""
    try:
        supabase = get_supabase_client()
        supabase.table('notifications').update({'read': True}).eq('id', notification_id).execute()
        return True
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return False

# ============================================
# REFERRAL FUNCTIONS
# ============================================

def create_referral(referrer_id: int, referred_phone: str) -> Optional[Dict]:
    """Create a new referral"""
    try:
        supabase = get_supabase_client()
        data = {
            'referrer_id': referrer_id,
            'referred_phone': referred_phone,
            'status': 'pending'
        }
        result = supabase.table('referrals').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating referral: {e}")
        return None

def get_user_referrals(user_id: int) -> List[Dict]:
    """Get all referrals made by a user"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('referrals')\
            .select('*')\
            .eq('referrer_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching referrals: {e}")
        return []

# ============================================
# COIN TRANSACTION FUNCTIONS
# ============================================

def create_coin_transaction(user_id: int, amount: int, transaction_type: str, description: str = None) -> Optional[Dict]:
    """Create a coin transaction and update user balance"""
    try:
        supabase = get_supabase_client()
        
        # Create transaction record
        transaction_data = {
            'user_id': user_id,
            'amount': amount,
            'transaction_type': transaction_type,
            'description': description
        }
        transaction_result = supabase.table('coin_transactions').insert(transaction_data).execute()
        
        # Update user balance
        update_user_coins(user_id, amount)
        
        return transaction_result.data[0] if transaction_result.data else None
    except Exception as e:
        print(f"Error creating coin transaction: {e}")
        return None

def get_user_coin_history(user_id: int, limit: int = 50) -> List[Dict]:
    """Get coin transaction history for a user"""
    try:
        supabase = get_supabase_client()
        result = supabase.table('coin_transactions')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Error fetching coin history: {e}")
        return []
