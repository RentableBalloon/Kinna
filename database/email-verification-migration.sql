-- Email Verification Migration
-- Run this to add email verification support to Kinna

-- Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, code)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email, code);

-- Verify the table was created
SELECT 'Email verification table created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'email_verification_codes';
