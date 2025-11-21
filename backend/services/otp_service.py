import random
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from services.supabase_client import get_supabase_client

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP code"""
    return ''.join(random.choices(string.digits, k=length))

def create_otp(phone_number: str) -> Dict[str, Any]:
    """
    Create and store OTP for phone number
    Returns OTP code (for mock SMS)
    """
    try:
        supabase = get_supabase_client()
        
        # Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # Store in database
        data = {
            'phone_number': phone_number,
            'otp_code': otp_code,
            'expires_at': expires_at.isoformat(),
            'verified': False
        }
        
        result = supabase.table('otp_verifications').insert(data).execute()
        
        # Mock SMS - print to console
        print(f"\n{'='*50}")
        print(f"📱 MOCK SMS TO: {phone_number}")
        print(f"🔐 YOUR OTP CODE: {otp_code}")
        print(f"⏰ Expires in 5 minutes")
        print(f"{'='*50}\n")
        
        return {
            'success': True,
            'otp_code': otp_code,  # Return for testing (remove in production)
            'expires_at': expires_at.isoformat(),
            'message': f'OTP sent to {phone_number}'
        }
        
    except Exception as e:
        print(f"Error creating OTP: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def verify_otp(phone_number: str, otp_code: str) -> Dict[str, Any]:
    """Verify OTP code for phone number"""
    try:
        supabase = get_supabase_client()
        
        # Find valid OTP
        result = supabase.table('otp_verifications')\
            .select('*')\
            .eq('phone_number', phone_number)\
            .eq('otp_code', otp_code)\
            .eq('verified', False)\
            .gt('expires_at', datetime.utcnow().isoformat())\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if not result.data:
            return {
                'success': False,
                'error': 'Invalid or expired OTP'
            }
        
        otp_record = result.data[0]
        
        # Mark as verified
        supabase.table('otp_verifications')\
            .update({'verified': True})\
            .eq('id', otp_record['id'])\
            .execute()
        
        # Get or create user
        user = get_or_create_user(phone_number)
        
        return {
            'success': True,
            'user': user,
            'message': 'OTP verified successfully'
        }
        
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_or_create_user(phone_number: str) -> Dict[str, Any]:
    """Get existing user or create new one"""
    try:
        supabase = get_supabase_client()
        
        # Check if user exists
        result = supabase.table('users')\
            .select('*')\
            .eq('phone_number', phone_number)\
            .execute()
        
        if result.data:
            # Update last login
            user = result.data[0]
            supabase.table('users')\
                .update({'last_login': datetime.utcnow().isoformat()})\
                .eq('id', user['id'])\
                .execute()
            return user
        
        # Create new user
        new_user = {
            'phone_number': phone_number,
            'is_active': True
        }
        
        result = supabase.table('users').insert(new_user).execute()
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"Error getting/creating user: {e}")
        return None
