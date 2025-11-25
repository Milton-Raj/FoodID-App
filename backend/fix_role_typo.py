import asyncio
from backend.services.supabase_client import get_supabase_client

async def fix_typo():
    supabase = get_supabase_client()
    
    # Update 'Notifcation' to 'Notification'
    response = supabase.table('admin_roles').update({'role_name': 'Notification'}).eq('role_name', 'Notifcation').execute()
    
    if response.data:
        print("Fixed typo: 'Notifcation' -> 'Notification'")
    else:
        print("Role 'Notifcation' not found or already fixed.")

if __name__ == "__main__":
    asyncio.run(fix_typo())
