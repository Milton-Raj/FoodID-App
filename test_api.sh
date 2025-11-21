#!/bin/bash

# Quick test script to verify Supabase integration
# Run this to test all API endpoints

API_URL="http://192.168.225.120:8000"

echo "🧪 Testing FoodID API Endpoints..."
echo ""

# Test 1: Get Profile
echo "1️⃣ Testing Profile API..."
curl -s "${API_URL}/api/profile/1" | python3 -m json.tool
echo ""

# Test 2: Get Coin Balance
echo "2️⃣ Testing Coin Balance API..."
curl -s "${API_URL}/api/coins/1/balance" | python3 -m json.tool
echo ""

# Test 3: Get Coin History
echo "3️⃣ Testing Coin History API..."
curl -s "${API_URL}/api/coins/1/history" | python3 -m json.tool
echo ""

# Test 4: Get Notifications
echo "4️⃣ Testing Notifications API..."
curl -s "${API_URL}/api/notifications/1" | python3 -m json.tool
echo ""

# Test 5: Get Referral Stats
echo "5️⃣ Testing Referral Stats API..."
curl -s "${API_URL}/api/referrals/1/stats" | python3 -m json.tool
echo ""

echo "✅ All tests complete!"
echo ""
echo "If you see data above, Supabase integration is working!"
echo "If you see errors, make sure:"
echo "  1. Backend is running: cd backend && uvicorn main:app --reload"
echo "  2. Supabase schema and seed data are loaded"
echo "  3. API_URL is correct in this script"
