import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Create forum
router.post(
  '/',
  authenticate,
  upload.single('cover_image'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, description, book_id } = req.body;
      const coverImage = req.file ? `/uploads/forums/${req.file.filename}` : null;

      const result = await pool.query(
        `INSERT INTO forums (name, description, book_id, creator_id, cover_image, member_count)
         VALUES ($1, $2, $3, $4, $5, 1)
         RETURNING *`,
        [name, description, book_id || null, userId, coverImage]
      );

      const forum = result.rows[0];

      // Add creator as owner
      await pool.query(
        'INSERT INTO forum_members (forum_id, user_id, role) VALUES ($1, $2, $3)',
        [forum.id, userId, 'owner']
      );

      res.status(201).json({ forum });
    } catch (error) {
      console.error('Create forum error:', error);
      res.status(500).json({ error: { message: 'Server error' } });
    }
  }
);

// Get all forums
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let query = `
      SELECT f.*, u.username as creator_username, b.title as book_title
      FROM forums f
      JOIN users u ON f.creator_id = u.id
      LEFT JOIN books b ON f.book_id = b.id
      WHERE f.is_active = true
    `;

    const params: any[] = [];
    if (search) {
      query += ' AND (f.name ILIKE $1 OR f.description ILIKE $1)';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY f.member_count DESC, f.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ forums: result.rows, page, limit });
  } catch (error) {
    console.error('Get forums error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get single forum
router.get('/:forumId', async (req: AuthRequest, res: Response) => {
  try {
    const { forumId } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT f.*, u.username as creator_username, b.title as book_title,
              ${userId ? `(SELECT role FROM forum_members WHERE forum_id = f.id AND user_id = $2) as user_role,` : 'null as user_role,'}
              ${userId ? `(SELECT COUNT(*) FROM forum_members WHERE forum_id = f.id AND user_id = $2) > 0 as is_member` : 'false as is_member'}
       FROM forums f
       JOIN users u ON f.creator_id = u.id
       LEFT JOIN books b ON f.book_id = b.id
       WHERE f.id = $1 AND f.is_active = true`,
      userId ? [forumId, userId] : [forumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Forum not found' } });
    }

    res.json({ forum: result.rows[0] });
  } catch (error) {
    console.error('Get forum error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Join forum
router.post('/:forumId/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { forumId } = req.params;

    await pool.query(
      'INSERT INTO forum_members (forum_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [forumId, userId, 'member']
    );

    // Update member count
    await pool.query(
      'UPDATE forums SET member_count = (SELECT COUNT(*) FROM forum_members WHERE forum_id = $1) WHERE id = $1',
      [forumId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Leave forum
router.post('/:forumId/leave', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { forumId } = req.params;

    // Check if user is owner
    const ownerCheck = await pool.query(
      'SELECT role FROM forum_members WHERE forum_id = $1 AND user_id = $2',
      [forumId, userId]
    );

    if (ownerCheck.rows.length > 0 && ownerCheck.rows[0].role === 'owner') {
      return res.status(400).json({ error: { message: 'Owner cannot leave the forum' } });
    }

    await pool.query(
      'DELETE FROM forum_members WHERE forum_id = $1 AND user_id = $2',
      [forumId, userId]
    );

    // Update member count
    await pool.query(
      'UPDATE forums SET member_count = (SELECT COUNT(*) FROM forum_members WHERE forum_id = $1) WHERE id = $1',
      [forumId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get forum posts
router.get('/:forumId/posts', async (req: AuthRequest, res: Response) => {
  try {
    const { forumId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT p.*, u.username, u.name, u.profile_picture,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as like_count,
              ${userId ? `(SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id AND user_id = $3) > 0 as is_liked,` : 'false as is_liked,'}
              (SELECT json_agg(json_build_object('media_url', media_url, 'media_type', media_type) ORDER BY order_index)
               FROM post_media WHERE post_id = p.id) as media
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.forum_id = $1 AND p.is_deleted = false
       ORDER BY p.is_pinned DESC, p.created_at DESC
       LIMIT $2 OFFSET ${userId ? '$4' : '$3'}`,
      userId ? [forumId, limit, userId, offset] : [forumId, limit, offset]
    );

    res.json({ posts: result.rows, page, limit });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get forum members
router.get('/:forumId/members', async (req: AuthRequest, res: Response) => {
  try {
    const { forumId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT fm.role, fm.joined_at, u.id, u.username, u.name, u.profile_picture
       FROM forum_members fm
       JOIN users u ON fm.user_id = u.id
       WHERE fm.forum_id = $1
       ORDER BY 
         CASE fm.role 
           WHEN 'owner' THEN 1 
           WHEN 'moderator' THEN 2 
           ELSE 3 
         END,
         fm.joined_at DESC
       LIMIT $2 OFFSET $3`,
      [forumId, limit, offset]
    );

    res.json({ members: result.rows, page, limit });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Update member role (moderators only)
router.put('/:forumId/members/:userId/role', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = req.user!.id;
    const { forumId, userId } = req.params;
    const { role } = req.body;

    // Check if requester is owner or moderator
    const permissionCheck = await pool.query(
      'SELECT role FROM forum_members WHERE forum_id = $1 AND user_id = $2',
      [forumId, requesterId]
    );

    if (permissionCheck.rows.length === 0 || 
        !['owner', 'moderator'].includes(permissionCheck.rows[0].role)) {
      return res.status(403).json({ error: { message: 'Insufficient permissions' } });
    }

    // Update role
    await pool.query(
      'UPDATE forum_members SET role = $1 WHERE forum_id = $2 AND user_id = $3',
      [role, forumId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
