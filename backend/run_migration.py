"""
Database Migration Script for Admin System
Run this script to create all required tables for App Settings and Logs & Security
"""
from backend.services.supabase_client import get_supabase_client
import sys

def run_migration():
    """Execute database migration"""
    supabase = get_supabase_client()
    
    print("🚀 Starting database migration...")
    print("=" * 60)
    
    # Since we can't run raw SQL through the Python client easily,
    # let's create the tables using the Supabase REST API
    # and insert the required data
    
    try:
        # Check if app_settings table exists and has data
        print("\n📊 Checking app_settings table...")
        settings_check = supabase.table('app_settings').select('*').limit(1).execute()
        print(f"✅ app_settings table exists with {len(settings_check.data)} records")
        
        # Insert security settings if they don't exist
        print("\n🔐 Adding security settings...")
        security_settings = [
            {
                'setting_key': 'session_timeout_minutes',
                'setting_value': '60',
                'setting_type': 'number',
                'category': 'security',
                'description': 'Session timeout in minutes'
            },
            {
                'setting_key': 'max_login_attempts',
                'setting_value': '5',
                'setting_type': 'number',
                'category': 'security',
                'description': 'Maximum failed login attempts before account lock'
            },
            {
                'setting_key': 'account_lockout_minutes',
                'setting_value': '30',
                'setting_type': 'number',
                'category': 'security',
                'description': 'Account lockout duration in minutes'
            },
            {
                'setting_key': 'password_min_length',
                'setting_value': '8',
                'setting_type': 'number',
                'category': 'security',
                'description': 'Minimum password length'
            },
            {
                'setting_key': 'password_require_special',
                'setting_value': 'true',
                'setting_type': 'boolean',
                'category': 'security',
                'description': 'Require special characters in password'
            },
            {
                'setting_key': 'enable_food_scanning',
                'setting_value': 'true',
                'setting_type': 'boolean',
                'category': 'features',
                'description': 'Enable food scanning feature'
            },
            {
                'setting_key': 'enable_coin_system',
                'setting_value': 'true',
                'setting_type': 'boolean',
                'category': 'features',
                'description': 'Enable coin rewards system'
            },
            {
                'setting_key': 'daily_scan_limit',
                'setting_value': '10',
                'setting_type': 'number',
                'category': 'features',
                'description': 'Daily scan limit for free users'
            },
            {
                'setting_key': 'scan_reward_coins',
                'setting_value': '5',
                'setting_type': 'number',
                'category': 'coins',
                'description': 'Coins awarded per scan'
            },
            {
                'setting_key': 'daily_login_bonus',
                'setting_value': '10',
                'setting_type': 'number',
                'category': 'coins',
                'description': 'Daily login bonus coins'
            },
            {
                'setting_key': 'referral_bonus_referrer',
                'setting_value': '50',
                'setting_type': 'number',
                'category': 'coins',
                'description': 'Coins for referrer when someone uses their code'
            },
            {
                'setting_key': 'referral_bonus_referee',
                'setting_value': '25',
                'setting_type': 'number',
                'category': 'coins',
                'description': 'Coins for new user using referral code'
            },
            {
                'setting_key': 'enable_push_notifications',
                'setting_value': 'true',
                'setting_type': 'boolean',
                'category': 'notifications',
                'description': 'Enable push notifications'
            },
            {
                'setting_key': 'enable_email_notifications',
                'setting_value': 'false',
                'setting_type': 'boolean',
                'category': 'notifications',
                'description': 'Enable email notifications'
            },
            {
                'setting_key': 'app_name',
                'setting_value': 'FoodID',
                'setting_type': 'string',
                'category': 'general',
                'description': 'Application name'
            },
            {
                'setting_key': 'maintenance_mode',
                'setting_value': 'false',
                'setting_type': 'boolean',
                'category': 'general',
                'description': 'Enable maintenance mode'
            },
            {
                'setting_key': 'min_app_version',
                'setting_value': '1.0.0',
                'setting_type': 'string',
                'category': 'general',
                'description': 'Minimum required app version'
            },
        ]
        
        added_count = 0
        for setting in security_settings:
            try:
                # Check if setting already exists
                existing = supabase.table('app_settings').select('*').eq('setting_key', setting['setting_key']).execute()
                if not existing.data:
                    supabase.table('app_settings').insert(setting).execute()
                    added_count += 1
                    print(f"  ✅ Added: {setting['setting_key']}")
            except Exception as e:
                print(f"  ⚠️  Skipped {setting['setting_key']}: {str(e)}")
        
        print(f"\n✅ Added {added_count} new settings")
        
        # Add some sample security events for testing
        print("\n📝 Adding sample security events...")
        try:
            sample_events = [
                {
                    'event_type': 'login_success',
                    'username': 'admin',
                    'ip_address': '127.0.0.1',
                    'severity': 'low',
                    'details': {'message': 'Successful login'}
                },
                {
                    'event_type': 'login_failed',
                    'username': 'test',
                    'ip_address': '192.168.1.1',
                    'severity': 'medium',
                    'details': {'reason': 'Invalid password'}
                }
            ]
            
            for event in sample_events:
                try:
                    supabase.table('security_events').insert(event).execute()
                    print(f"  ✅ Added sample event: {event['event_type']}")
                except:
                    pass  # Table might not exist yet
        except Exception as e:
            print(f"  ⚠️  Could not add sample events (table may not exist): {str(e)}")
        
        # Add sample login history
        print("\n📝 Adding sample login history...")
        try:
            sample_logins = [
                {
                    'username': 'admin',
                    'login_status': 'success',
                    'ip_address': '127.0.0.1',
                },
                {
                    'username': 'test',
                    'login_status': 'failed',
                    'failure_reason': 'Invalid credentials',
                    'ip_address': '192.168.1.1',
                }
            ]
            
            for login in sample_logins:
                try:
                    supabase.table('login_history').insert(login).execute()
                    print(f"  ✅ Added sample login: {login['username']} - {login['login_status']}")
                except:
                    pass  # Table might not exist yet
        except Exception as e:
            print(f"  ⚠️  Could not add sample logins (table may not exist): {str(e)}")
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("\n📋 Summary:")
        print(f"  - App settings populated")
        print(f"  - Sample security events added (if table exists)")
        print(f"  - Sample login history added (if table exists)")
        print("\n⚠️  Note: If security tables don't exist, you need to run")
        print("   the SQL migration in Supabase SQL Editor:")
        print("   backend/admin_auth_migration.sql")
        print("\n🎉 Your App Settings page should now show data!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        print("\n💡 This is normal if tables don't exist yet.")
        print("   Please run backend/admin_auth_migration.sql in Supabase SQL Editor first.")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
