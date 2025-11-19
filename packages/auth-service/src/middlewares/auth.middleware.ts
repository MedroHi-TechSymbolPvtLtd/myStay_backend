import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from '../services/jwt.service';

/**
 * Extend Express Request type to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header and attaches user info to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required',
      });
    }

    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header must start with "Bearer "',
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Verify JWT token
    try {
      const decoded = jwtService.verify(token);
      
      // Attach user info to request object
      req.user = {
        userId: decoded.userId,
        uniqueId: decoded.uniqueId,
        userType: decoded.userType,
      };

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

