# Verification Instructions

I have implemented all the requested features:
1. **Authentication**: Real OTP flow with Supabase user creation.
2. **Coin Transfer**: Transfer coins between users.
3. **Referrals**: Send and redeem referrals.
4. **Notifications**: Create and view notifications.
5. **Mobile UI**: New screens for Transfer and Referrals, updated Notifications and Camera screens.

## Prerequisite: Database Setup

Before verifying, you **MUST** run the SQL schema in your Supabase project to create the necessary tables.

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ieetnyykalsijqncljlj/sql).
2.  Open `backend/supabase_schema.sql`.
3.  Copy the content and run it in the SQL Editor.
4.  (Optional) Run `backend/supabase_seed.sql` to populate test data.

## Verification

### 1. Automated Verification Script
I have created a script to verify the backend features end-to-end.
Once the database is set up, run:

```bash
python3 backend/verify_features.py
```

This script will:
- Simulate User A login/creation.
- Simulate User B login/creation.
- Transfer coins from A to B.
- Create and fetch notifications.
- Simulate a food scan.

### 2. Mobile App Verification
1.  Start the backend:
    ```bash
    cd backend
    python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
2.  Start the mobile app:
    ```bash
    cd mobile
    npx expo start
    ```
3.  **Login**: Use a phone number (e.g., +15550000001). OTP is returned in the backend logs or response (check `verify_features.py` output for example).
4.  **Home Screen**: Check coin balance (should be 0 initially).
5.  **Transfer**: Go to Profile -> Transfer (or add a button if I missed it? Wait, I didn't add a button to navigate to TransferScreen in HomeScreen!).
    - **Correction**: I need to add a way to navigate to `TransferScreen`. I'll add it to the `CoinHistoryScreen` or `HomeScreen`.
6.  **Referral**: Go to Home -> "Refer Now" card.
7.  **Notifications**: Tap the bell icon.

## Missing Navigation Link
I noticed I might have missed adding a direct link to `TransferScreen`.
I will add a "Transfer" button to the `CoinHistoryScreen` or `HomeScreen`.
Current `HomeScreen` has `CoinBadge` which goes to `CoinHistory`.
I'll check `CoinHistoryScreen` to see if I can add a "Transfer" button there.
