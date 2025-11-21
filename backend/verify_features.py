import requests
import json
import os

API_URL = "http://localhost:8000/api"

def test_auth_flow():
    print("\n--- Testing Auth Flow ---")
    # 1. Send OTP
    phone = "+15550000001"
    print(f"Sending OTP to {phone}...")
    resp = requests.post(f"{API_URL}/auth/send-otp", json={"phone_number": phone})
    if resp.status_code != 200:
        print(f"Failed to send OTP: {resp.text}")
        return None
    print("OTP Sent")

    # 2. Verify OTP (assuming mock OTP is 123456 or returned in logs, but for test env it might be fixed or we need to check logs. 
    # However, the previous turn showed the backend returns the OTP in the response for testing!)
    otp_code = resp.json().get("otp_code")
    if not otp_code:
        # If not returned, try default mock
        otp_code = "123456"
    
    print(f"Verifying OTP {otp_code}...")
    resp = requests.post(f"{API_URL}/auth/verify-otp", json={"phone_number": phone, "otp_code": otp_code})
    if resp.status_code != 200:
        print(f"Failed to verify OTP: {resp.text}")
        return None
    
    user_data = resp.json()
    print(f"User verified: {user_data['user']['id']}")
    return user_data['user']

def test_coin_transfer(sender, receiver_phone):
    print("\n--- Testing Coin Transfer ---")
    amount = 10
    print(f"Transferring {amount} coins from {sender['id']} to {receiver_phone}...")
    
    resp = requests.post(f"{API_URL}/coins/transfer", json={
        "sender_id": sender['id'],
        "receiver_phone": receiver_phone,
        "amount": amount
    })
    
    if resp.status_code != 200:
        print(f"Transfer failed: {resp.text}")
    else:
        print(f"Transfer successful: {resp.json()}")

def test_referral(referrer_id, referred_phone):
    print("\n--- Testing Referral ---")
    # First, send referral (optional, but good for flow)
    print(f"Sending referral from {referrer_id} to {referred_phone}...")
    resp = requests.post(f"{API_URL}/referrals/send", json={
        "user_id": referrer_id,
        "phone_numbers": [referred_phone]
    })
    if resp.status_code == 200:
        print("Referral sent")
    else:
        print(f"Failed to send referral: {resp.text}")

    # Redeem referral (assuming referred user is created or we use their ID if they exist)
    # The redeem endpoint takes referral_id (which is usually the referrer's ID in simple systems or a unique code).
    # In our system, `redeem_referral` takes `referral_id` (which seems to be the ID of the referral record? or the referrer's ID?)
    # Let's check the code. `redeem_referral(referral_id: int, user_id: int)`
    # And `backend/routers/referrals.py` calls `supabase_client.redeem_referral`.
    # If `referral_id` is the ID of the referral *record*, we need to know it.
    # If it's the referrer's user ID, that's different.
    # Let's assume for now we might skip this if we don't have the referral record ID easily, 
    # OR we check if the system uses user_id as referral code.
    # Looking at `ReferralScreen.js`, we implemented `parseInt(redeemCode)` and passed it as `referralId`.
    # If the user enters the referrer's ID as the code, then `referral_id` in the backend function likely refers to the Referrer's User ID?
    # Let's check `supabase_client.py` `redeem_referral` implementation if possible.
    pass

def test_notifications(user_id):
    print("\n--- Testing Notifications ---")
    # Create notification
    print(f"Creating notification for user {user_id}...")
    resp = requests.post(f"{API_URL}/notifications/create", json={
        "user_id": user_id,
        "title": "Test Notification",
        "message": "This is a test notification",
        "type": "info"
    })
    if resp.status_code == 200:
        print("Notification created")
    else:
        print(f"Failed to create notification: {resp.text}")

    # Get notifications
    print(f"Fetching notifications for user {user_id}...")
    resp = requests.get(f"{API_URL}/notifications?user_id={user_id}")
    if resp.status_code == 200:
        notifs = resp.json()
        print(f"Found {len(notifs)} notifications")
    else:
        print(f"Failed to fetch notifications: {resp.text}")

def main():
    # Create/Login User A
    user_a = test_auth_flow()
    if not user_a:
        return

    # Create/Login User B (to receive coins)
    print("\nCreating User B...")
    phone_b = "+15550000002"
    resp = requests.post(f"{API_URL}/auth/send-otp", json={"phone_number": phone_b})
    otp_b = resp.json().get("otp_code", "123456")
    resp = requests.post(f"{API_URL}/auth/verify-otp", json={"phone_number": phone_b, "otp_code": otp_b})
    user_b = resp.json()['user']
    print(f"User B created: {user_b['id']}")

    # Test Features
    test_coin_transfer(user_a, phone_b)
    test_notifications(user_a['id'])
    
    # Test Scan (requires a file)
    # We can create a dummy file
    with open("test_image.jpg", "wb") as f:
        f.write(os.urandom(1024)) # Dummy image content
    
    print("\n--- Testing Scan ---")
    files = {'file': ('test_image.jpg', open('test_image.jpg', 'rb'), 'image/jpeg')}
    resp = requests.post(f"{API_URL}/scan/analyze?user_id={user_a['id']}", files=files)
    if resp.status_code == 200:
        print("Scan successful:", resp.json().get("name"))
    else:
        print(f"Scan failed: {resp.text}")
    
    os.remove("test_image.jpg")

if __name__ == "__main__":
    main()
