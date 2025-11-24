from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import bcrypt
from backend.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/admin-management", tags=["Admin Management"])

# Pydantic Models
class RoleCreate(BaseModel):
    role_name: str
    description: Optional[str] = None
    permissions: Optional[Dict] = {}

class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict] = None

class AdminUserCreate(BaseModel):
    username: str
    password: str
    role_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

# Helper Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# ============================================
# ROLES & PERMISSIONS
# ============================================

@router.get("/roles")
async def get_roles():
    """Get all admin roles"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('admin_roles').select('*').order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roles")
async def create_role(role: RoleCreate):
    """Create a new admin role"""
    try:
        supabase = get_supabase_client()
        
        role_data = {
            'role_name': role.role_name,
            'description': role.description,
            'permissions': role.permissions,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('admin_roles').insert(role_data).execute()
        
        return {
            "message": "Role created successfully",
            "role": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/roles/{role_id}")
async def update_role(role_id: int, role_update: RoleUpdate):
    """Update an admin role"""
    try:
        supabase = get_supabase_client()
        
        update_data = {k: v for k, v in role_update.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table('admin_roles').update(update_data).eq('id', role_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return {
            "message": "Role updated successfully",
            "role": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/roles/{role_id}")
async def delete_role(role_id: int):
    """Delete an admin role"""
    try:
        supabase = get_supabase_client()
        
        # Check if any users have this role
        users_with_role = supabase.table('admin_users').select('id').eq('role_id', role_id).execute()
        if users_with_role.data:
            raise HTTPException(status_code=400, detail=f"Cannot delete role. {len(users_with_role.data)} users are assigned to this role.")
        
        response = supabase.table('admin_roles').delete().eq('id', role_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return {"message": "Role deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ADMIN USERS
# ============================================

@router.get("/users")
async def get_admin_users():
    """Get all admin users"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('admin_users')\
            .select('*, admin_roles(role_name, description)')\
            .order('created_at', desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users")
async def create_admin_user(user: AdminUserCreate):
    """Create a new admin user"""
    try:
        supabase = get_supabase_client()
        
        # Hash password
        password_hash = hash_password(user.password)
        
        # Generate dummy email if not provided
        email = user.email if user.email else f"{user.username}@foodid.admin"
        name = user.name if user.name else user.username
        
        user_data = {
            'email': email,
            'username': user.username,
            'name': name,
            'password_hash': password_hash,
            'role_id': user.role_id,
            'is_active': user.is_active,
            'must_change_password': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('admin_users').insert(user_data).execute()
        
        return {
            "message": "Admin user created successfully",
            "user": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
async def update_admin_user(user_id: int, user_update: AdminUserUpdate):
    """Update an admin user"""
    try:
        supabase = get_supabase_client()
        
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table('admin_users').update(update_data).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Admin user not found")
        
        return {
            "message": "Admin user updated successfully",
            "user": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_admin_user(user_id: int):
    """Delete an admin user"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('admin_users').delete().eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Admin user not found")
        
        return {"message": "Admin user deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ACTIVITY LOGS
# ============================================

@router.get("/logs")
async def get_activity_logs(
    limit: int = 100,
    admin_id: Optional[int] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None
):
    """Get admin activity logs with optional filters"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table('admin_activity_logs').select('*, admin_users(name, email)')
        
        if admin_id:
            query = query.eq('admin_id', admin_id)
        if action:
            query = query.eq('action', action)
        if resource_type:
            query = query.eq('resource_type', resource_type)
        
        response = query.order('created_at', desc=True).limit(limit).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logs")
async def create_activity_log(
    admin_email: str,
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[Dict] = None,
    ip_address: Optional[str] = None
):
    """Create an activity log entry"""
    try:
        supabase = get_supabase_client()
        
        log_data = {
            'admin_email': admin_email,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'details': details,
            'ip_address': ip_address,
            'created_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('admin_activity_logs').insert(log_data).execute()
        
        return {
            "message": "Activity logged successfully",
            "log": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/stats")
async def get_activity_stats():
    """Get activity log statistics"""
    try:
        supabase = get_supabase_client()
        from datetime import timedelta
        
        # Get all logs
        logs = supabase.table('admin_activity_logs').select('*').execute().data
        
        if not logs:
            return {
                "total_actions": 0,
                "actions_today": 0,
                "actions_this_week": 0,
                "top_actions": [],
                "top_admins": []
            }
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        
        actions_today = sum(1 for log in logs if datetime.fromisoformat(log['created_at'].replace('Z', '')) >= today_start)
        actions_this_week = sum(1 for log in logs if datetime.fromisoformat(log['created_at'].replace('Z', '')) >= week_start)
        
        # Count actions
        action_counts = {}
        admin_counts = {}
        
        for log in logs:
            action = log.get('action', 'Unknown')
            admin = log.get('admin_email', 'Unknown')
            
            action_counts[action] = action_counts.get(action, 0) + 1
            admin_counts[admin] = admin_counts.get(admin, 0) + 1
        
        top_actions = [{"action": k, "count": v} for k, v in sorted(action_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        top_admins = [{"admin": k, "count": v} for k, v in sorted(admin_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            "total_actions": len(logs),
            "actions_today": actions_today,
            "actions_this_week": actions_this_week,
            "top_actions": top_actions,
            "top_admins": top_admins
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
