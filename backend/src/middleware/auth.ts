import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No valid authorization token provided'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email || 'User'
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal authentication error'
    });
    return;
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header provided, continue without user
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email || 'User'
      };
    } catch (error) {
      // Token invalid, but continue without user
      console.warn('Optional auth token verification failed:', error);
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};

export { AuthenticatedRequest };