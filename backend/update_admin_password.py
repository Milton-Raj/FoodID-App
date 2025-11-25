import bcrypt
import sys, os
sys.path.append(os.path.abspath('backend'))
from services.supabase_client import get_supabase_client

def hash_password(pw: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw.encode('utf-8'), salt).decode('utf-8')

def main():
    supabase = get_supabase_client()
    new_hash = hash_password('12345')
    res = supabase.table('admin_users').update({
        'password_hash': new_hash,
        'must_change_password': False
    }).eq('username', 'admin').execute()
    print('Update response:', res)

if __name__ == '__main__':
    main()
