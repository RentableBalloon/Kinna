import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
