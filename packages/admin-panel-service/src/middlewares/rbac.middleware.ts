import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { errorResponse } from '../utils/response';

export const checkRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
        }
        next();
    };
};

export const checkPermission = (permissionField: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.admin) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        const permissions = req.admin.permissions;

        // Super admin generally has all access, but let's check explicit permissions just in case
        if (req.admin.role === 'super_admin') {
            return next();
        }

        if (permissions && permissions[permissionField]) {
            return next();
        }

        return errorResponse(res, `Forbidden: Missing permission ${permissionField}`, 403);
    }
}
