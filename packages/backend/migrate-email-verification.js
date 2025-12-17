const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kinna_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function migrate() {
  try {
    console.log('🔄 Creating email_verification_codes table...');
    
    await pool.query(`
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
    `);
    
    console.log('✅ Table created successfully');
    
    console.log('🔄 Creating indices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user 
      ON email_verification_codes(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email 
      ON email_verification_codes(email, code);
    `);
    
    console.log('✅ Indices created successfully');
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
