import { Request, Response, NextFunction } from 'express';

/**
 * Authorization Middleware
 * 
 * Ensures that the requester is either:
 * 1. The owner of the resource (same uniqueId)
 * 2. An admin user
 */
export const requireOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    // User should be attached by authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get the uniqueId from route parameters
    const requestedUniqueId = req.params.uniqueId;
    const requesterUniqueId = req.user.uniqueId;
    const requesterUserType = req.user.userType;

    // Allow if requester is admin
    if (requesterUserType === 'admin') {
      return next();
    }

    // Allow if requester is the owner
    if (requesterUniqueId === requestedUniqueId) {
      return next();
    }

    // Otherwise, deny access
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own profile unless you are an admin.',
    });
  } catch (error) {
    console.error('[Authorization Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization',
    });
  }
};

