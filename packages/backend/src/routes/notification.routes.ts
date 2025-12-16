import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT n.*, 
              u.username as related_username, u.name as related_name, u.profile_picture as related_profile_picture
       FROM notifications n
       LEFT JOIN users u ON n.related_user_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ notifications: result.rows, page, limit });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Mark all notifications as read
router.put('/read/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get unread count
router.get('/unread/count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
