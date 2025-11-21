# Supabase Database Setup Guide for FoodID

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard/project/ieetnyykalsijqncljlj
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

## Step 2: Run the Schema Script

1. Open the file: `backend/supabase_schema.sql`
2. Copy the ENTIRE contents of that file
3. Paste it into the Supabase SQL Editor
4. Click "Run" button (or press Cmd/Ctrl + Enter)

## Step 3: Verify Tables Were Created

Run this query to see all your tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- users
- scans
- notifications
- referrals
- coin_transactions

## Step 4: Check Table Structure

Run these queries to verify the structure:

```sql
-- Check users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- View sample data (will be empty initially)
SELECT * FROM users LIMIT 5;
```

## Step 5: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Test user creation via OTP:
   - Send OTP: `POST http://localhost:8000/api/send-otp`
   - Verify OTP: `POST http://localhost:8000/api/verify-otp`
   
3. Check if user was created in Supabase:
   ```sql
   SELECT * FROM users;
   ```

## What Happens Now

✅ **User Registration**: When a user verifies OTP, they are automatically created in Supabase
✅ **Profile Updates**: All profile changes are saved to Supabase
✅ **Scans**: Food scans are linked to users via `user_id`
✅ **Coins**: Coin balance and transactions are tracked
✅ **Notifications**: User notifications are stored
✅ **Referrals**: Referral tracking is enabled

## Important Notes

- **No Data Loss**: The schema uses `IF NOT EXISTS` so running it multiple times is safe
- **Existing Data**: If you have existing users in the local SQLite database, you'll need to migrate them manually
- **Phone Numbers**: Phone numbers are unique identifiers for users
- **Coins**: Users start with 0 coins, earn 1 per scan

## Troubleshooting

If you get errors:

1. **Permission Denied**: Make sure you're using the service role key (not anon key)
2. **Table Already Exists**: That's fine! The script handles this
3. **Foreign Key Errors**: Make sure to run the entire script, not parts of it

## Next Steps

After setup:
1. Test user registration through the mobile app
2. Verify data appears in Supabase dashboard
3. Check that coins are awarded for scans
4. Test profile updates

Your Supabase database is now ready! 🎉
