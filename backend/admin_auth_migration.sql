-- ============================================
-- Advanced Admin System - Database Migration
-- ============================================
-- Run this script in Supabase SQL Editor to add authentication and security features
-- ============================================

-- ============================================
-- 1. UPDATE admin_users TABLE
-- ============================================
-- Add authentication fields
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT false;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- ============================================
-- 2. CREATE admin_sessions TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for service role" ON admin_sessions FOR ALL USING (true);

-- ============================================
-- 3. CREATE security_events TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'login_success', 'login_failed', 'password_change', 'permission_change', 'suspicious_activity', 'account_locked'
    admin_user_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Enable RLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for service role" ON security_events FOR ALL USING (true);

-- ============================================
-- 4. CREATE login_history TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    login_status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'blocked'
    failure_reason VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB, -- {"city": "Mumbai", "country": "India", "region": "Maharashtra"}
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history(login_status);

-- Enable RLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for service role" ON login_history FOR ALL USING (true);

-- ============================================
-- 5. UPDATE app_settings WITH SECURITY SETTINGS
-- ============================================
-- Add security-related settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, category, description) VALUES
('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes'),
('max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before account lock'),
('account_lockout_minutes', '30', 'number', 'security', 'Account lockout duration in minutes'),
('password_min_length', '8', 'number', 'security', 'Minimum password length'),
('password_require_special', 'true', 'boolean', 'security', 'Require special characters in password'),
('password_require_numbers', 'true', 'boolean', 'security', 'Require numbers in password'),
('password_require_uppercase', 'true', 'boolean', 'security', 'Require uppercase letters in password'),
('password_expiry_days', '90', 'number', 'security', 'Password expiry in days (0 = never)'),
('enable_2fa', 'false', 'boolean', 'security', 'Enable two-factor authentication'),
('ip_whitelist', '[]', 'json', 'security', 'IP addresses allowed to access admin panel')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 6. CREATE FUNCTION TO CLEAN EXPIRED SESSIONS
-- ============================================
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CREATE DEFAULT ADMIN USER (FOR TESTING)
-- ============================================
-- Password: Admin@123 (hashed with bcrypt)
-- You should change this after first login!
INSERT INTO admin_users (email, name, username, password_hash, role_id, is_active, must_change_password)
SELECT 
    'admin@foodid.com',
    'Super Admin',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr3WMBsSm', -- Admin@123
    (SELECT id FROM admin_roles WHERE role_name = 'Super Admin' LIMIT 1),
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admin_sessions', 'security_events', 'login_history');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name IN ('username', 'password_hash');
-- SELECT * FROM app_settings WHERE category = 'security';
