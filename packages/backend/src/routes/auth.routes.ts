import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { upload } from '../middleware/upload.middleware';
import emailService from '../services/email.service';

const router = Router();

// Register
router.post(
  '/register',
  upload.single('profile_picture'),
  [
    body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('age').isInt({ min: 13, max: 120 }),
    body('gender').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, name, age, gender, preferences } = req.body;

      // Check if username or email already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ 
          error: { message: 'Username or email already taken' } 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Get profile picture path if uploaded
      const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

      // Insert user
      const userResult = await pool.query(
        `INSERT INTO users (username, email, password_hash, name, age, gender, profile_picture)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, name, age, gender, profile_picture, created_at`,
        [username, email, hashedPassword, name, age, gender, profilePicture]
      );

      const user = userResult.rows[0];

      // Insert preferences if provided
      if (preferences && Array.isArray(preferences)) {
        const preferencePromises = preferences.map((pref: any) =>
          pool.query(
            'INSERT INTO user_preferences (user_id, preference_type, preference_value) VALUES ($1, $2, $3)',
            [user.id, pref.type, pref.value]
          )
        );
        await Promise.all(preferencePromises);
      }

      // Create privacy settings
      await pool.query(
        'INSERT INTO privacy_settings (user_id) VALUES ($1)',
        [user.id]
      );

      // Generate verification code
      const verificationCode = emailService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Store verification code
      await pool.query(
        'INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)',
        [user.id, email, verificationCode, expiresAt]
      );

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(email, verificationCode, username);
      
      if (!emailSent) {
        console.warn('⚠️ Failed to send verification email to:', email);
      }

      // Generate JWT (but user needs to verify email first)
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          profile_picture: user.profile_picture,
          is_verified: false,
          created_at: user.created_at
        },
        token,
        message: 'Registration successful. Please check your email for verification code.'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: { message: 'Server error during registration' } });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('login').trim().notEmpty(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { login, password } = req.body;

      // Find user by email or username
      const userResult = await pool.query(
        'SELECT id, username, email, password_hash, name, profile_picture FROM users WHERE email = $1 OR username = $1',
        [login]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      // Update last login
      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          profile_picture: user.profile_picture
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: { message: 'Server error during login' } });
    }
  }
);

// Verify email with code
router.post(
  '/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;

      // Find verification code
      const codeResult = await pool.query(
        `SELECT id, user_id, expires_at, is_used 
         FROM email_verification_codes 
         WHERE email = $1 AND code = $2 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, code]
      );

      if (codeResult.rows.length === 0) {
        return res.status(400).json({ 
          error: { message: 'Invalid verification code' } 
        });
      }

      const verificationCode = codeResult.rows[0];

      // Check if already used
      if (verificationCode.is_used) {
        return res.status(400).json({ 
          error: { message: 'Verification code has already been used' } 
        });
      }

      // Check if expired
      if (new Date() > new Date(verificationCode.expires_at)) {
        return res.status(400).json({ 
          error: { message: 'Verification code has expired. Please request a new one.' } 
        });
      }

      // Mark code as used
      await pool.query(
        'UPDATE email_verification_codes SET is_used = true WHERE id = $1',
        [verificationCode.id]
      );

      // Update user as verified
      const userResult = await pool.query(
        'UPDATE users SET is_verified = true WHERE id = $1 RETURNING id, username, email, name, profile_picture, is_verified',
        [verificationCode.user_id]
      );

      const user = userResult.rows[0];

      // Send welcome email
      await emailService.sendWelcomeEmail(email, user.username);

      res.json({
        message: 'Email verified successfully!',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          profile_picture: user.profile_picture,
          is_verified: user.is_verified
        }
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ error: { message: 'Server error during verification' } });
    }
  }
);

// Resend verification code
router.post(
  '/resend-verification',
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Find user
      const userResult = await pool.query(
        'SELECT id, username, email, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          error: { message: 'No account found with this email' } 
        });
      }

      const user = userResult.rows[0];

      // Check if already verified
      if (user.is_verified) {
        return res.status(400).json({ 
          error: { message: 'Email is already verified' } 
        });
      }

      // Check for recent verification code (rate limiting)
      const recentCodeResult = await pool.query(
        `SELECT created_at FROM email_verification_codes 
         WHERE email = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email]
      );

      if (recentCodeResult.rows.length > 0) {
        const lastCodeTime = new Date(recentCodeResult.rows[0].created_at);
        const timeSinceLastCode = Date.now() - lastCodeTime.getTime();
        const minWaitTime = 60 * 1000; // 1 minute

        if (timeSinceLastCode < minWaitTime) {
          const waitSeconds = Math.ceil((minWaitTime - timeSinceLastCode) / 1000);
          return res.status(429).json({ 
            error: { message: `Please wait ${waitSeconds} seconds before requesting a new code` } 
          });
        }
      }

      // Generate new verification code
      const verificationCode = emailService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store new verification code
      await pool.query(
        'INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)',
        [user.id, email, verificationCode, expiresAt]
      );

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(email, verificationCode, user.username);

      if (!emailSent) {
        return res.status(500).json({ 
          error: { message: 'Failed to send verification email. Please try again later.' } 
        });
      }

      res.json({
        message: 'Verification code sent successfully. Please check your email.'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: { message: 'Server error while resending verification code' } });
    }
  }
);

// Check username availability
router.get('/check-username/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    res.json({ available: result.rows.length === 0 });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
