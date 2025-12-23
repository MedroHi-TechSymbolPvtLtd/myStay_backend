import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        userType: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.userType !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden: Admin only' } });
    }
    next();
};
