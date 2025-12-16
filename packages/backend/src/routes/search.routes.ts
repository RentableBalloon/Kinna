import { Router, Response } from 'express';
import pool from '../config/database';
import { optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Universal search
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string; // 'all', 'users', 'posts', 'forums', 'books'
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ error: { message: 'Search query required' } });
    }

    const searchPattern = `%${query}%`;
    const results: any = {};

    // Search users
    if (!type || type === 'all' || type === 'users') {
      const userResult = await pool.query(
        `SELECT id, username, name, profile_picture, bio
         FROM users
         WHERE (username ILIKE $1 OR name ILIKE $1 OR bio ILIKE $1) AND is_active = true
         ORDER BY 
           CASE 
             WHEN username ILIKE $2 THEN 1
             WHEN name ILIKE $2 THEN 2
             ELSE 3
           END
         LIMIT $3 OFFSET $4`,
        [searchPattern, `${query}%`, limit, offset]
      );
      results.users = userResult.rows;
    }

    // Search posts
    if (!type || type === 'all' || type === 'posts') {
      const postResult = await pool.query(
        `SELECT p.id, p.title, p.content, p.created_at, p.like_count, p.comment_count,
                u.username, u.name, u.profile_picture,
                f.name as forum_name
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN forums f ON p.forum_id = f.id
         WHERE (p.title ILIKE $1 OR p.content ILIKE $1) AND p.is_deleted = false
         ORDER BY p.like_count DESC, p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchPattern, limit, offset]
      );
      results.posts = postResult.rows;
    }

    // Search forums
    if (!type || type === 'all' || type === 'forums') {
      const forumResult = await pool.query(
        `SELECT f.id, f.name, f.description, f.cover_image, f.member_count, f.post_count,
                b.title as book_title
         FROM forums f
         LEFT JOIN books b ON f.book_id = b.id
         WHERE (f.name ILIKE $1 OR f.description ILIKE $1) AND f.is_active = true
         ORDER BY f.member_count DESC
         LIMIT $2 OFFSET $3`,
        [searchPattern, limit, offset]
      );
      results.forums = forumResult.rows;
    }

    // Search books
    if (!type || type === 'all' || type === 'books') {
      const bookResult = await pool.query(
        `SELECT id, title, author, description, cover_image, genre, publication_year
         FROM books
         WHERE title ILIKE $1 OR author ILIKE $1 OR description ILIKE $1
         ORDER BY 
           CASE 
             WHEN title ILIKE $2 THEN 1
             WHEN author ILIKE $2 THEN 2
             ELSE 3
           END
         LIMIT $3 OFFSET $4`,
        [searchPattern, `${query}%`, limit, offset]
      );
      results.books = bookResult.rows;
    }

    res.json({ results, query, page, limit });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// Get recommendations based on user preferences
router.get('/recommendations', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = 20;

    if (!userId) {
      // Return popular content for non-authenticated users
      const result = await pool.query(
        `SELECT p.*, u.username, u.name, u.profile_picture, f.name as forum_name
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN forums f ON p.forum_id = f.id
         WHERE p.is_deleted = false
         ORDER BY p.like_count DESC, p.created_at DESC
         LIMIT $1`,
        [limit]
      );
      return res.json({ posts: result.rows });
    }

    // Get user preferences
    const prefsResult = await pool.query(
      'SELECT preference_type, preference_value FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    const genres = prefsResult.rows
      .filter(p => p.preference_type === 'genre')
      .map(p => p.preference_value);
    
    const authors = prefsResult.rows
      .filter(p => p.preference_type === 'author')
      .map(p => p.preference_value);

    // Search for posts related to user's preferences
    const result = await pool.query(
      `SELECT DISTINCT p.*, u.username, u.name, u.profile_picture, f.name as forum_name
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN forums f ON p.forum_id = f.id
       LEFT JOIN books b ON f.book_id = b.id
       WHERE p.is_deleted = false
         AND (
           b.genre = ANY($1) OR
           b.author = ANY($2) OR
           p.content ILIKE ANY(ARRAY[${genres.map((_, i) => `$${i + 3}`).join(',')}])
         )
         AND p.user_id != $${genres.length + authors.length + 3}
       ORDER BY p.like_count DESC, p.created_at DESC
       LIMIT $${genres.length + authors.length + 4}`,
      [genres, authors, ...genres.map(g => `%${g}%`), userId, limit]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

export default router;
