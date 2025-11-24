-- Coin Rules Table
CREATE TABLE IF NOT EXISTS coin_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('earning', 'spending')),
    action_name VARCHAR(100) NOT NULL,
    coin_amount INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    conditions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default earning rules
INSERT INTO coin_rules (rule_type, action_name, coin_amount, description, is_active, conditions) VALUES
('earning', 'scan_food', 10, 'Earn coins for scanning food items', true, '{"daily_limit": 5}'),
('earning', 'daily_login', 5, 'Daily login bonus', true, '{"once_per_day": true}'),
('earning', 'referral_signup', 100, 'Earn coins when referred user signs up', true, NULL),
('earning', 'profile_complete', 50, 'Complete your profile', true, '{"one_time": true}'),
('earning', 'streak_bonus', 20, 'Maintain a 7-day login streak', true, '{"streak_days": 7}');

-- Insert default spending rules
INSERT INTO coin_rules (rule_type, action_name, coin_amount, description, is_active, conditions) VALUES
('spending', 'premium_analysis', 50, 'Unlock detailed nutrition analysis', true, NULL),
('spending', 'unlock_recipe', 30, 'Unlock premium recipes', true, NULL),
('spending', 'ad_free_day', 25, 'Remove ads for 24 hours', true, NULL),
('spending', 'custom_meal_plan', 100, 'Get personalized meal plan', true, NULL);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_coin_rules_type ON coin_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_coin_rules_active ON coin_rules(is_active);
