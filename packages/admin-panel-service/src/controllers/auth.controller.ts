import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const { identifier, password } = req.body;
        const result = await authService.login(identifier, password);
        successResponse(res, result, 'Login successful');
    } catch (error: any) {
        errorResponse(res, error.message, 401);
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        // req.admin.id is guaranteed by middleware
        const adminId = (req as AuthRequest).admin!.id;
        const profile = await authService.getProfile(adminId);
        successResponse(res, profile);
    } catch (error: any) {
        errorResponse(res, error.message, 404);
    }
}
