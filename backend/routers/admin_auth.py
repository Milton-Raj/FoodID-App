from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import bcrypt
import secrets
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/auth", tags=["Admin Authentication"])

# Pydantic Models
class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class LoginResponse(BaseModel):
    message: str
    session_token: str
    admin_user: dict
    permissions: dict

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# Helper Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(32)

def log_security_event(event_type: str, username: str, ip_address: str, severity: str = 'low', details: dict = None):
    """Log security event"""
    try:
        supabase = get_supabase_client()
        event_data = {
            'event_type': event_type,
            'username': username,
            'ip_address': ip_address,
            'severity': severity,
            'details': details or {},
            'created_at': datetime.utcnow().isoformat()
        }
        supabase.table('security_events').insert(event_data).execute()
    except Exception as e:
        print(f"Failed to log security event: {e}")

def log_login_attempt(username: str, status: str, ip_address: str, failure_reason: str = None):
    """Log login attempt"""
    try:
        supabase = get_supabase_client()
        log_data = {
            'username': username,
            'login_status': status,
            'failure_reason': failure_reason,
            'ip_address': ip_address,
            'created_at': datetime.utcnow().isoformat()
        }
        supabase.table('login_history').insert(log_data).execute()
    except Exception as e:
        print(f"Failed to log login attempt: {e}")

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@router.post("/login")
async def login(request: LoginRequest, x_forwarded_for: Optional[str] = Header(None)):
    """Admin login endpoint"""
    try:
        supabase = get_supabase_client()
        ip_address = x_forwarded_for or "unknown"
        
        # Get admin user by username
        user_response = supabase.table('admin_users')\
            .select('*, admin_roles(role_name, permissions)')\
            .eq('username', request.username)\
            .execute()
        
        if not user_response.data:
            log_login_attempt(request.username, 'failed', ip_address, 'Invalid username')
            log_security_event('login_failed', request.username, ip_address, 'medium', {'reason': 'Invalid username'})
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        user = user_response.data[0]
        
        # Check if account is locked
        if user.get('account_locked'):
            locked_until = user.get('locked_until')
            if locked_until and datetime.fromisoformat(locked_until.replace('Z', '')) > datetime.utcnow():
                log_login_attempt(request.username, 'blocked', ip_address, 'Account locked')
                raise HTTPException(status_code=403, detail="Account is locked. Please try again later.")
            else:
                # Unlock account if lockout period has passed
                supabase.table('admin_users').update({
                    'account_locked': False,
                    'failed_login_attempts': 0,
                    'locked_until': None
                }).eq('id', user['id']).execute()
        
        # Check if account is active
        if not user.get('is_active'):
            log_login_attempt(request.username, 'failed', ip_address, 'Account inactive')
            raise HTTPException(status_code=403, detail="Account is inactive")
        
        # Verify password
        if not verify_password(request.password, user.get('password_hash', '')):
            # Increment failed login attempts
            failed_attempts = user.get('failed_login_attempts', 0) + 1
            update_data = {'failed_login_attempts': failed_attempts}
            
            # Lock account if max attempts reached
            max_attempts = 5  # TODO: Get from settings
            if failed_attempts >= max_attempts:
                lockout_minutes = 30  # TODO: Get from settings
                locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
                update_data['account_locked'] = True
                update_data['locked_until'] = locked_until.isoformat()
                log_security_event('account_locked', request.username, ip_address, 'high', {
                    'reason': 'Max login attempts exceeded',
                    'attempts': failed_attempts
                })
            
            supabase.table('admin_users').update(update_data).eq('id', user['id']).execute()
            log_login_attempt(request.username, 'failed', ip_address, 'Invalid password')
            log_security_event('login_failed', request.username, ip_address, 'medium', {'reason': 'Invalid password'})
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Reset failed login attempts on successful login
        supabase.table('admin_users').update({
            'failed_login_attempts': 0,
            'last_login': datetime.utcnow().isoformat()
        }).eq('id', user['id']).execute()
        
        # Create session
        session_token = generate_session_token()
        session_timeout = 60 if not request.remember_me else 43200  # 1 hour or 30 days
        expires_at = datetime.utcnow() + timedelta(minutes=session_timeout)
        
        session_data = {
            'admin_user_id': user['id'],
            'session_token': session_token,
            'ip_address': ip_address,
            'expires_at': expires_at.isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat()
        }
        
        supabase.table('admin_sessions').insert(session_data).execute()
        
        # Log successful login
        log_login_attempt(request.username, 'success', ip_address)
        log_security_event('login_success', request.username, ip_address, 'low', {'remember_me': request.remember_me})
        
        # Return user data and permissions
        return {
            "message": "Login successful",
            "session_token": session_token,
            "admin_user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "name": user['name'],
                "role": user.get('admin_roles', {}).get('role_name'),
                "must_change_password": user.get('must_change_password', False)
            },
            "permissions": user.get('admin_roles', {}).get('permissions', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout(authorization: str = Header(None)):
    """Admin logout endpoint"""
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="No session token provided")
        
        session_token = authorization.replace('Bearer ', '')
        supabase = get_supabase_client()
        
        # Delete session
        supabase.table('admin_sessions').delete().eq('session_token', session_token).execute()
        
        return {"message": "Logout successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    """Get current authenticated admin user"""
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        session_token = authorization.replace('Bearer ', '')
        supabase = get_supabase_client()
        
        # Get session
        session_response = supabase.table('admin_sessions')\
            .select('*')\
            .eq('session_token', session_token)\
            .execute()
        
        if not session_response.data:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session = session_response.data[0]
        
        # Check if session expired
        expires_at = datetime.fromisoformat(session['expires_at'].replace('Z', ''))
        if expires_at < datetime.utcnow():
            supabase.table('admin_sessions').delete().eq('session_token', session_token).execute()
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Update last activity
        supabase.table('admin_sessions').update({
            'last_activity': datetime.utcnow().isoformat()
        }).eq('session_token', session_token).execute()
        
        # Get user data
        user_response = supabase.table('admin_users')\
            .select('*, admin_roles(role_name, permissions)')\
            .eq('id', session['admin_user_id'])\
            .execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.data[0]
        
        return {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "name": user['name'],
            "role": user.get('admin_roles', {}).get('role_name'),
            "permissions": user.get('admin_roles', {}).get('permissions', {}),
            "must_change_password": user.get('must_change_password', False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, authorization: str = Header(None)):
    """Change admin password"""
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        session_token = authorization.replace('Bearer ', '')
        supabase = get_supabase_client()
        
        # Get current user from session
        session_response = supabase.table('admin_sessions')\
            .select('admin_user_id')\
            .eq('session_token', session_token)\
            .execute()
        
        if not session_response.data:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_id = session_response.data[0]['admin_user_id']
        
        # Get user
        user_response = supabase.table('admin_users').select('*').eq('id', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.data[0]
        
        # Verify current password
        if not verify_password(request.current_password, user.get('password_hash', '')):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash new password
        new_password_hash = hash_password(request.new_password)
        
        # Update password
        supabase.table('admin_users').update({
            'password_hash': new_password_hash,
            'password_changed_at': datetime.utcnow().isoformat(),
            'must_change_password': False
        }).eq('id', user_id).execute()
        
        # Log security event
        log_security_event('password_change', user['username'], 'internal', 'low', {'user_id': user_id})
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
