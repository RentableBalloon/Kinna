import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { upload } from '../middleware/upload.middleware';

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

      // Generate JWT
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
          created_at: user.created_at
        },
        token
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
