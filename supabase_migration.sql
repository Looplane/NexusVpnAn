-- NexusVPN Supabase Migration
-- Connection: postgres://postgres:NexusVPN02110@db.xorjbccyuinebimlxblu.supabase.co:5432/postgres
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/xorjbccyuinebimlxblu/editor)
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Create vpn_configs table
CREATE TABLE IF NOT EXISTS vpn_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_id UUID NOT NULL,
    public_key VARCHAR(255) NOT NULL,
    assigned_ip VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    ipv4 VARCHAR(50) NOT NULL,
    ipv6 VARCHAR(100),
    public_key VARCHAR(255),
    wg_port INTEGER DEFAULT 51820,
    ssh_user VARCHAR(50) DEFAULT 'root',
    load INTEGER DEFAULT 0,
    ping INTEGER DEFAULT 0,
    premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        actor_email VARCHAR(255),
        details TEXT,
        severity VARCHAR(50) DEFAULT 'info',
        ip_address VARCHAR(50),
        user_agent TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
);
-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Insert default admin user (password: "password")
INSERT INTO users (email, password_hash, full_name, plan, is_active)
VALUES (
        'admin@nexusvpn.com',
        '$2b$10$rKZvVxwJ5vZ5vZ5vZ5vZ5OqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK',
        'Admin User',
        'pro',
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Insert sample locations
INSERT INTO locations (
        name,
        city,
        country,
        country_code,
        ipv4,
        load,
        ping,
        premium
    )
VALUES (
        'US East',
        'New York',
        'United States',
        'US',
        '192.0.2.1',
        45,
        12,
        false
    ),
    (
        'EU West',
        'London',
        'United Kingdom',
        'GB',
        '192.0.2.2',
        30,
        25,
        false
    ),
    (
        'Asia Pacific',
        'Singapore',
        'Singapore',
        'SG',
        '192.0.2.3',
        60,
        80,
        true
    ) ON CONFLICT DO NOTHING;
-- Insert default system settings
INSERT INTO system_settings (key, value, description, category)
VALUES (
        'maintenance_mode',
        'false',
        'Enable/disable maintenance mode',
        'general'
    ),
    (
        'max_devices_free',
        '1',
        'Max devices for free plan',
        'limits'
    ),
    (
        'max_devices_basic',
        '5',
        'Max devices for basic plan',
        'limits'
    ),
    (
        'max_devices_pro',
        '10',
        'Max devices for pro plan',
        'limits'
    ) ON CONFLICT (key) DO
UPDATE
SET value = EXCLUDED.value;
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vpn_configs_user_id ON vpn_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
COMMIT;