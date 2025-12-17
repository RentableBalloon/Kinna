import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Migration endpoint (should be removed in production or protected)
router.post('/migrate', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running email verification migration...');
    
    // Create email_verification_codes table
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
    
    // Create indices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user 
      ON email_verification_codes(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email 
      ON email_verification_codes(email, code);
    `);
    
    console.log('✅ Email verification migration complete!');
    
    res.json({ 
      success: true, 
      message: 'Email verification tables and indices created successfully' 
    });
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
