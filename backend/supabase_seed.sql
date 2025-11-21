-- ============================================
-- SEED DATA FOR TESTING
-- ============================================
-- Run this AFTER running the main schema
-- This creates a test user so the app works immediately

-- Create a test user with ID 1
INSERT INTO users (id, phone_number, name, email, coins, created_at, updated_at)
VALUES (1, '+1234567890', 'Test User', 'test@foodid.com', 10, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    coins = EXCLUDED.coins;

-- Create some welcome notifications
INSERT INTO notifications (user_id, title, message, notification_type, extra_data, read, created_at)
VALUES 
    (1, 'Welcome to FoodID! 🎉', 'Start scanning your meals to track nutrition and earn coins with every scan!', 'system', '{"welcome_bonus": 10}', false, NOW() - INTERVAL '2 hours'),
    (1, 'Referral Bonus Available 👥', 'Invite friends to earn bonus coins. Share FoodID today!', 'referral', '{"bonus_per_referral": 5}', false, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Create some initial coin transactions
INSERT INTO coin_transactions (user_id, amount, transaction_type, description, created_at)
VALUES 
    (1, 10, 'bonus', 'Welcome bonus', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Notifications created:' as info, COUNT(*) as count FROM notifications;
SELECT 'Coin transactions created:' as info, COUNT(*) as count FROM coin_transactions;
