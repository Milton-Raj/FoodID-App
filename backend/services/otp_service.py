import random
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from backend.services.supabase_client import get_supabase_client

# In-memory storage for testing (when Supabase tables don't exist)
_otp_storage = {}
_user_storage = {}

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
        
        # Try to store in database
        try:
            data = {
                'phone_number': phone_number,
                'otp_code': otp_code,
                'expires_at': expires_at.isoformat(),
                'verified': False
            }
            
            result = supabase.table('otp_verifications').insert(data).execute()
        except Exception as db_error:
            # Fallback to in-memory storage if table doesn't exist
            print(f"⚠️  Supabase table not found, using in-memory storage")
            _otp_storage[phone_number] = {
                'otp_code': otp_code,
                'expires_at': expires_at,
                'verified': False
            }
        
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
        
        # Try database first
        try:
            result = supabase.table('otp_verifications')\
                .select('*')\
                .eq('phone_number', phone_number)\
                .eq('otp_code', otp_code)\
                .eq('verified', False)\
                .gt('expires_at', datetime.utcnow().isoformat())\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
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
        except Exception as db_error:
            # Fallback to in-memory storage
            print(f"⚠️  Using in-memory OTP verification")
            if phone_number in _otp_storage:
                stored = _otp_storage[phone_number]
                if (stored['otp_code'] == otp_code and 
                    stored['expires_at'] > datetime.utcnow() and 
                    not stored['verified']):
                    
                    stored['verified'] = True
                    
                    # Create mock user
                    user = {
                        'id': phone_number,
                        'phone_number': phone_number,
                        'created_at': datetime.utcnow().isoformat()
                    }
                    _user_storage[phone_number] = user
                    
                    return {
                        'success': True,
                        'user': user,
                        'message': 'OTP verified successfully'
                    }
        
        return {
            'success': False,
            'error': 'Invalid or expired OTP'
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
