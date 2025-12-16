import sys
import os
import bcrypt

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.supabase_client import get_supabase_client

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def reset_admin_password():
    try:
        supabase = get_supabase_client()
        username = 'admin'
        new_password = '12345'
        
        print(f"Resetting password for user '{username}' to '{new_password}'...")
        
        # 1. Check if user exists
        response = supabase.table('admin_users').select('*').eq('username', username).execute()
        
        if not response.data:
            print(f"User '{username}' not found. Creating new user...")
            # Create user if not exists
            # Get role ID for 'Super Admin'
            role_resp = supabase.table('admin_roles').select('id').eq('role_name', 'Super Admin').execute()
            if not role_resp.data:
                print("Error: 'Super Admin' role not found. Cannot create user.")
                return
            
            role_id = role_resp.data[0]['id']
            
            new_user = {
                'email': 'admin@foodid.com',
                'name': 'Super Admin',
                'username': username,
                'password_hash': hash_password(new_password),
                'role_id': role_id,
                'is_active': True,
                'must_change_password': False
            }
            supabase.table('admin_users').insert(new_user).execute()
            print("User created successfully.")
            
        else:
            user_id = response.data[0]['id']
            # Update password
            update_data = {
                'password_hash': hash_password(new_password),
                'must_change_password': False,
                'account_locked': False,
                'failed_login_attempts': 0,
                'locked_until': None
            }
            supabase.table('admin_users').update(update_data).eq('id', user_id).execute()
            print("Password updated successfully.")
            
    except Exception as e:
        print(f"Error resetting password: {e}")

if __name__ == "__main__":
    reset_admin_password()
