import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Create post
router.post(
  '/',
  authenticate,
  upload.array('media', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { title, content, forum_id } = req.body;
      const files = req.files as Express.Multer.File[];

      // Insert post
      const postResult = await pool.query(
        `INSERT INTO posts (user_id, forum_id, title, content, post_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, forum_id || null, title, content, files && files.length > 0 ? 'mixed' : 'text']
      );

      const post = postResult.rows[0];

      // Insert media if any
      if (files && files.length > 0) {
        const mediaPromises = files.map((file, index) =>
          pool.query(
            'INSERT INTO post_media (post_id, media_url, media_type, order_index) VALUES ($1, $2, $3, $4)',
            [post.id, `/uploads/posts/${file.filename}`, 'image', index]
          )
        );
        await Promise.all(mediaPromises);
      }

      // Update forum post count if applicable
      if (forum_id) {
        await pool.query(
          'UPDATE forums SET post_count = post_count + 1 WHERE id = $1',
          [forum_id]
        );
      }

      res.status(201).json({ post });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: { message: 'Server error' } });
    }
  }
);

// Get feed (following + explore)
router.get('/feed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get posts from followed users
    const result = await pool.query(
      `SELECT p.*, u.username, u.name, u.profile_picture,
              f.name as forum_name,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as like_count,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id AND user_id = $1) > 0 as is_liked,
              (SELECT json_agg(json_build_object('media_url', media_url, 'media_type', media_type) ORDER BY order_index)
               FROM post_media WHERE post_id = p.id) as media
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN forums f ON p.forum_id = f.id
       WHERE p.is_deleted = false
         AND (p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1) OR p.user_id = $1)
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ posts: result.rows, page, limit });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get explore posts
router.get('/explore', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT p.*, u.username, u.name, u.profile_picture,
              f.name as forum_name,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as like_count,
              ${userId ? `(SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id AND user_id = $2) > 0 as is_liked,` : 'false as is_liked,'}
              (SELECT json_agg(json_build_object('media_url', media_url, 'media_type', media_type) ORDER BY order_index)
               FROM post_media WHERE post_id = p.id) as media
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN forums f ON p.forum_id = f.id
       WHERE p.is_deleted = false
       ORDER BY p.like_count DESC, p.created_at DESC
       LIMIT $1 OFFSET ${userId ? '$3' : '$2'}`,
      userId ? [limit, userId, offset] : [limit, offset]
    );

    res.json({ posts: result.rows, page, limit });
  } catch (error) {
    console.error('Get explore error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get single post
router.get('/:postId', async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT p.*, u.username, u.name, u.profile_picture,
              f.name as forum_name,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as like_count,
              ${userId ? `(SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id AND user_id = $2) > 0 as is_liked,` : 'false as is_liked,'}
              (SELECT json_agg(json_build_object('media_url', media_url, 'media_type', media_type) ORDER BY order_index)
               FROM post_media WHERE post_id = p.id) as media
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN forums f ON p.forum_id = f.id
       WHERE p.id = $1 AND p.is_deleted = false`,
      userId ? [postId, userId] : [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Post not found' } });
    }

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Like post
router.post('/:postId/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;

    await pool.query(
      'INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, 'post', postId]
    );

    // Update like count
    await pool.query(
      'UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2) WHERE id = $2',
      ['post', postId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Unlike post
router.delete('/:postId/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;

    await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [userId, 'post', postId]
    );

    // Update like count
    await pool.query(
      'UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2) WHERE id = $2',
      ['post', postId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Add comment
router.post('/:postId/comments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;
    const { content, parent_comment_id } = req.body;

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [postId, userId, parent_comment_id || null, content]
    );

    // Update comment count
    await pool.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
      [postId]
    );

    res.status(201).json({ comment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get comments
router.get('/:postId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username, u.name, u.profile_picture
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1 AND c.is_deleted = false
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Delete post
router.delete('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;

    await pool.query(
      'UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2',
      [postId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
