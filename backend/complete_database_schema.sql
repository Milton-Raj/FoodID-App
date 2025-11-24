-- ============================================
-- FoodID COMPLETE Database Schema for Supabase
-- ============================================
-- This script creates ALL tables needed for the FoodID app
-- Run this in Supabase SQL Editor to create all missing tables
-- ============================================

-- ============================================
-- 1. COIN RULES TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL, -- 'earning' or 'spending'
    action_name VARCHAR(100) NOT NULL, -- 'scan_food', 'daily_login', 'referral', etc.
    coin_amount INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    conditions JSONB, -- Additional conditions (daily_limit, max_per_user, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_rules_active ON coin_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_coin_rules_type ON coin_rules(rule_type);

-- Insert default coin rules
INSERT INTO coin_rules (rule_type, action_name, coin_amount, description, is_active, conditions) VALUES
('earning', 'scan_food', 10, 'Earn coins for scanning food', true, '{"daily_limit": 5}'),
('earning', 'daily_login', 5, 'Daily login bonus', true, '{"once_per_day": true}'),
('earning', 'referral_signup', 50, 'Earn coins when referred user signs up', true, '{}'),
('earning', 'profile_complete', 20, 'Complete your profile', true, '{"once_per_user": true}'),
('spending', 'premium_analysis', 50, 'Unlock premium nutrition analysis', true, '{}'),
('spending', 'ad_free', 100, 'Remove ads for 30 days', true, '{"duration_days": 30}')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. SCHEDULED NOTIFICATIONS TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'active', 'inactive'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);

-- ============================================
-- 3. ADMIN ROLES TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin role
INSERT INTO admin_roles (role_name, description, permissions) VALUES
('Super Admin', 'Full access to all features', '{"users": ["read", "write", "delete"], "analytics": ["read"], "notifications": ["read", "write"], "settings": ["read", "write"]}'),
('Moderator', 'Limited admin access', '{"users": ["read"], "analytics": ["read"], "notifications": ["read"]}')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================
-- 4. ADMIN USERS TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role_id BIGINT REFERENCES admin_roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- ============================================
-- 5. ADMIN ACTIVITY LOGS TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);

-- ============================================
-- 6. REFERRAL CODES TABLE (for Admin Panel & Mobile)
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);

-- ============================================
-- 7. FOOD DATABASE TABLE (for Admin Panel & Mobile)
-- ============================================
CREATE TABLE IF NOT EXISTS food_database (
    id BIGSERIAL PRIMARY KEY,
    food_name VARCHAR(200) NOT NULL,
    category VARCHAR(50), -- 'fruits', 'vegetables', 'grains', 'proteins', 'dairy', 'snacks'
    calories REAL,
    protein REAL,
    carbs REAL,
    fat REAL,
    fiber REAL,
    sugar REAL,
    sodium REAL,
    vitamins JSONB, -- {"vitamin_a": 100, "vitamin_c": 50, ...}
    minerals JSONB, -- {"iron": 2.5, "calcium": 100, ...}
    allergens TEXT[], -- ['gluten', 'dairy', 'nuts']
    health_score INTEGER, -- 1-100
    ingredients TEXT[],
    description TEXT,
    image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_database_name ON food_database(food_name);
CREATE INDEX IF NOT EXISTS idx_food_database_category ON food_database(category);
CREATE INDEX IF NOT EXISTS idx_food_database_verified ON food_database(is_verified);

-- Insert sample food items
INSERT INTO food_database (food_name, category, calories, protein, carbs, fat, health_score, is_verified) VALUES
('Apple', 'fruits', 95, 0.5, 25, 0.3, 85, true),
('Banana', 'fruits', 105, 1.3, 27, 0.4, 80, true),
('Chicken Breast', 'proteins', 165, 31, 0, 3.6, 90, true),
('Brown Rice', 'grains', 216, 5, 45, 1.8, 75, true),
('Broccoli', 'vegetables', 55, 3.7, 11, 0.6, 95, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. APP SETTINGS TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50), -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(50), -- 'general', 'features', 'notifications', 'coins'
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, category, description) VALUES
('app_name', 'FoodID', 'string', 'general', 'Application name'),
('maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode'),
('min_app_version', '1.0.0', 'string', 'general', 'Minimum required app version'),
('daily_scan_limit', '10', 'number', 'features', 'Maximum scans per day for free users'),
('referral_bonus_coins', '50', 'number', 'coins', 'Coins awarded for successful referral'),
('scan_reward_coins', '10', 'number', 'coins', 'Coins awarded per food scan'),
('enable_notifications', 'true', 'boolean', 'notifications', 'Enable push notifications')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 9. COIN ADJUSTMENTS TABLE (for Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_adjustments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL, -- 'add' or 'subtract'
    reason TEXT,
    admin_id VARCHAR(255),
    previous_balance INTEGER,
    new_balance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_adjustments_user ON coin_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_adjustments_created_at ON coin_adjustments(created_at DESC);

-- ============================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_coin_rules_updated_at ON coin_rules;
CREATE TRIGGER update_coin_rules_updated_at
    BEFORE UPDATE ON coin_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_food_database_updated_at ON food_database;
CREATE TRIGGER update_food_database_updated_at
    BEFORE UPDATE ON food_database
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all new tables
ALTER TABLE coin_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for service role)
CREATE POLICY "Enable all for service role" ON coin_rules FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON scheduled_notifications FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON admin_roles FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON admin_users FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON admin_activity_logs FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON referral_codes FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON food_database FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON app_settings FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON coin_adjustments FOR ALL USING (true);

-- ============================================
-- 12. VERIFICATION QUERIES
-- ============================================
-- Run these to verify your tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT COUNT(*) FROM coin_rules;
-- SELECT COUNT(*) FROM food_database;
-- SELECT COUNT(*) FROM app_settings;
