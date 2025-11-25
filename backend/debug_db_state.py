import asyncio
from backend.services.supabase_client import get_supabase_client

async def list_data():
    supabase = get_supabase_client()
    
    print("--- ROLES ---")
    roles = supabase.table('admin_roles').select('*').execute()
    for role in roles.data:
        print(f"ID: {role['id']}, Name: {role['role_name']}")

    print("\n--- USERS ---")
    users = supabase.table('admin_users').select('id, username, email, role_id').execute()
    for user in users.data:
        print(f"ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Role ID: {user['role_id']}")

if __name__ == "__main__":
    asyncio.run(list_data())
