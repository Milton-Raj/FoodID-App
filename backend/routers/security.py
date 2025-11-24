from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/security", tags=["Security & Logs"])

# ============================================
# SECURITY EVENTS ENDPOINTS
# ============================================

@router.get("/events")
async def get_security_events(
    limit: int = 100,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    admin_user_id: Optional[int] = None
):
    """Get security events with filters"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table('security_events').select('*')
        
        if event_type:
            query = query.eq('event_type', event_type)
        if severity:
            query = query.eq('severity', severity)
        if admin_user_id:
            query = query.eq('admin_user_id', admin_user_id)
        
        response = query.order('created_at', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/stats")
async def get_security_stats():
    """Get security event statistics"""
    try:
        supabase = get_supabase_client()
        
        # Get all events
        events = supabase.table('security_events').select('*').execute().data
        
        if not events:
            return {
                "total_events": 0,
                "events_today": 0,
                "events_this_week": 0,
                "by_severity": {},
                "by_type": {}
            }
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        
        events_today = sum(1 for e in events if datetime.fromisoformat(e['created_at'].replace('Z', '')) >= today_start)
        events_this_week = sum(1 for e in events if datetime.fromisoformat(e['created_at'].replace('Z', '')) >= week_start)
        
        # Count by severity
        severity_counts = {}
        type_counts = {}
        
        for event in events:
            severity = event.get('severity', 'low')
            event_type = event.get('event_type', 'unknown')
            
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            type_counts[event_type] = type_counts.get(event_type, 0) + 1
        
        return {
            "total_events": len(events),
            "events_today": events_today,
            "events_this_week": events_this_week,
            "by_severity": severity_counts,
            "by_type": type_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# LOGIN HISTORY ENDPOINTS
# ============================================

@router.get("/login-history")
async def get_login_history(
    limit: int = 100,
    status: Optional[str] = None,
    username: Optional[str] = None
):
    """Get login history with filters"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table('login_history').select('*')
        
        if status:
            query = query.eq('login_status', status)
        if username:
            query = query.eq('username', username)
        
        response = query.order('created_at', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/login-history/stats")
async def get_login_stats():
    """Get login history statistics"""
    try:
        supabase = get_supabase_client()
        
        # Get all login attempts
        logins = supabase.table('login_history').select('*').execute().data
        
        if not logins:
            return {
                "total_attempts": 0,
                "attempts_today": 0,
                "attempts_this_week": 0,
                "success_rate": 0,
                "failed_attempts": 0,
                "blocked_attempts": 0
            }
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        
        attempts_today = sum(1 for l in logins if datetime.fromisoformat(l['created_at'].replace('Z', '')) >= today_start)
        attempts_this_week = sum(1 for l in logins if datetime.fromisoformat(l['created_at'].replace('Z', '')) >= week_start)
        
        success_count = sum(1 for l in logins if l.get('login_status') == 'success')
        failed_count = sum(1 for l in logins if l.get('login_status') == 'failed')
        blocked_count = sum(1 for l in logins if l.get('login_status') == 'blocked')
        
        success_rate = (success_count / len(logins) * 100) if logins else 0
        
        return {
            "total_attempts": len(logins),
            "attempts_today": attempts_today,
            "attempts_this_week": attempts_this_week,
            "success_rate": round(success_rate, 2),
            "successful_logins": success_count,
            "failed_attempts": failed_count,
            "blocked_attempts": blocked_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ACTIVE SESSIONS ENDPOINTS
# ============================================

@router.get("/sessions")
async def get_active_sessions():
    """Get all active sessions"""
    try:
        supabase = get_supabase_client()
        
        # Get sessions that haven't expired
        now = datetime.utcnow().isoformat()
        response = supabase.table('admin_sessions')\
            .select('*, admin_users(username, email, name)')\
            .gte('expires_at', now)\
            .order('created_at', desc=True)\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def force_logout_session(session_id: int):
    """Force logout a session"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('admin_sessions').delete().eq('id', session_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session terminated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/stats")
async def get_session_stats():
    """Get session statistics"""
    try:
        supabase = get_supabase_client()
        
        # Get all sessions
        all_sessions = supabase.table('admin_sessions').select('*').execute().data
        
        # Get active sessions
        now = datetime.utcnow().isoformat()
        active_sessions = supabase.table('admin_sessions')\
            .select('*')\
            .gte('expires_at', now)\
            .execute().data
        
        return {
            "total_sessions": len(all_sessions),
            "active_sessions": len(active_sessions),
            "expired_sessions": len(all_sessions) - len(active_sessions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
