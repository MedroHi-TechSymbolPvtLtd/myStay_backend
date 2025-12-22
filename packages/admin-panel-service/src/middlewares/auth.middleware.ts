import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { errorResponse } from '../utils/response';
import prisma from '../prisma';

export interface AuthRequest extends Request {
    admin?: {
        id: string; // BigInt to string
        role: string;
        permissions: any;
    };
}

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Unauthorized: No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, config.jwtSecret);

        if (!decoded || !decoded.id) {
            return errorResponse(res, 'Unauthorized: Invalid token', 401);
        }

        // Create a lean admin object for the request
        // We can also fetch fresh permissions from DB if we want to be strict,
        // but for performance we might trust the token or use a cached version.
        // Let's fetch strict for now as requested "Secure Control Center"

        // Handle BigInt serialization if needed, or just cast to string
        const adminId = BigInt(decoded.id);

        const admin = await prisma.admin.findUnique({
            where: { admin_id: adminId },
            include: { permissions: true }
        });

        if (!admin || !admin.is_active) {
            return errorResponse(res, 'Unauthorized: Admin not found or inactive', 401);
        }

        (req as AuthRequest).admin = {
            id: admin.admin_id.toString(),
            role: admin.role,
            permissions: admin.permissions
        };

        next();
    } catch (error) {
        return errorResponse(res, 'Unauthorized: Invalid token', 401);
    }
};
