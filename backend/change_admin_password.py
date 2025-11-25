import bcrypt
from backend.services.supabase_client import get_supabase_client

def hash_password(password: str) -> str:
    """Hash a plain‑text password using bcrypt (same as the app)."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def main():
    supabase = get_supabase_client()
    new_hash = hash_password('12345')
    response = (
        supabase.table('admin_users')
        .update({
            'password_hash': new_hash,
            'must_change_password': False,
        })
        .eq('username', 'admin')
        .execute()
    )
    print('Password update response:', response)

if __name__ == '__main__':
    main()
