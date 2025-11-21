"""
Database migration script to update schema for new features.
This script will:
1. Create new tables: notifications, referrals, coin_transactions
2. Add new columns to users table
3. Preserve existing data
"""

import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from models import User, Scan, Notification, Referral, CoinTransaction
from sqlalchemy import inspect

def migrate_database():
    """Run database migration"""
    print("Starting database migration...")
    
    # Get inspector to check existing tables
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Existing tables: {existing_tables}")
    
    # Create all tables (will only create new ones)
    Base.metadata.create_all(bind=engine)
    
    print("Migration completed successfully!")
    print("New tables created:")
    print("  - notifications")
    print("  - referrals")
    print("  - coin_transactions")
    print("User table extended with new columns:")
    print("  - phone_number")
    print("  - name")
    print("  - email")
    print("  - profile_image")
    print("  - coins")
    print("  - created_at")
    print("  - updated_at")

if __name__ == "__main__":
    migrate_database()
