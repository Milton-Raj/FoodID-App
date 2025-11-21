from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.otp_service import create_otp, verify_otp
from services.supabase_client import create_user, get_user_by_phone

router = APIRouter()

# Pydantic Models
class PhoneRequest(BaseModel):
    phone_number: str

class OTPVerifyRequest(BaseModel):
    phone_number: str
    otp_code: str

@router.post("/send-otp")
def send_otp(request: PhoneRequest):
    """Send OTP to phone number (Mock SMS)"""
    result = create_otp(request.phone_number)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Failed to send OTP'))
    
    return {
        'success': True,
        'message': result['message'],
        'otp_code': result['otp_code']  # Only for testing - remove in production
    }

@router.post("/verify-otp")
def verify_otp_endpoint(request: OTPVerifyRequest):
    """Verify OTP and login/register user in Supabase"""
    result = verify_otp(request.phone_number, request.otp_code)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Invalid OTP'))
    
    # Get or create user in Supabase
    user = get_user_by_phone(request.phone_number)
    if not user:
        # Create new user
        user = create_user(request.phone_number)
        if not user:
            raise HTTPException(status_code=500, detail='Failed to create user')
    
    return {
        'success': True,
        'user': user,
        'message': 'Login successful'
    }
