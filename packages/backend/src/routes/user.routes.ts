import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Get user profile
router.get('/:username', async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.user?.id;

    const userResult = await pool.query(
      `SELECT u.id, u.username, u.name, u.age, u.gender, u.profile_picture, u.bio, u.created_at,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as follower_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_deleted = false) as post_count
       FROM users u
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const user = userResult.rows[0];

    // Check if requester follows this user
    if (requesterId) {
      const followResult = await pool.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [requesterId, user.id]
      );
      user.is_following = followResult.rows.length > 0;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Update user profile
router.put(
  '/profile',
  authenticate,
  upload.single('profile_picture'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, bio, age, gender } = req.body;

      let updateQuery = 'UPDATE users SET';
      const values: any[] = [];
      let paramCount = 1;

      if (name) {
        updateQuery += ` name = $${paramCount},`;
        values.push(name);
        paramCount++;
      }
      if (bio !== undefined) {
        updateQuery += ` bio = $${paramCount},`;
        values.push(bio);
        paramCount++;
      }
      if (age) {
        updateQuery += ` age = $${paramCount},`;
        values.push(age);
        paramCount++;
      }
      if (gender !== undefined) {
        updateQuery += ` gender = $${paramCount},`;
        values.push(gender);
        paramCount++;
      }
      if (req.file) {
        updateQuery += ` profile_picture = $${paramCount},`;
        values.push(`/uploads/profiles/${req.file.filename}`);
        paramCount++;
      }

      updateQuery = updateQuery.slice(0, -1); // Remove trailing comma
      updateQuery += ` WHERE id = $${paramCount} RETURNING id, username, name, bio, age, gender, profile_picture`;
      values.push(userId);

      const result = await pool.query(updateQuery, values);
      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: { message: 'Server error' } });
    }
  }
);

// Follow user
router.post('/:userId/follow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.user!.id;
    const { userId } = req.params;

    if (followerId === userId) {
      return res.status(400).json({ error: { message: 'Cannot follow yourself' } });
    }

    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, userId]
    );

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, type, content, related_user_id)
       VALUES ($1, 'follow', $2, $3)`,
      [userId, 'started following you', followerId]
    );

    res.json({ success: true, message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Unfollow user
router.delete('/:userId/follow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.user!.id;
    const { userId } = req.params;

    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.profile_picture
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ followers: result.rows, page, limit });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get user's following
router.get('/:userId/following', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.profile_picture
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ following: result.rows, page, limit });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get/Update privacy settings
router.get('/settings/privacy', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await pool.query(
      'SELECT * FROM privacy_settings WHERE user_id = $1',
      [userId]
    );
    res.json({ settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

router.put('/settings/privacy', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { profile_visibility, show_email, show_age, allow_messages, allow_tags, show_activity } = req.body;

    const result = await pool.query(
      `UPDATE privacy_settings 
       SET profile_visibility = COALESCE($1, profile_visibility),
           show_email = COALESCE($2, show_email),
           show_age = COALESCE($3, show_age),
           allow_messages = COALESCE($4, allow_messages),
           allow_tags = COALESCE($5, allow_tags),
           show_activity = COALESCE($6, show_activity)
       WHERE user_id = $7
       RETURNING *`,
      [profile_visibility, show_email, show_age, allow_messages, allow_tags, show_activity, userId]
    );

    res.json({ settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
