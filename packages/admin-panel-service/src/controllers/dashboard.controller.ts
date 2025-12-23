import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { cacheService } from '../services/cache.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

const dashboardService = new DashboardService();
const CACHE_TTL = 120; // 120 seconds

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const adminRole = (req as AuthRequest).admin!.role;
        const cacheKey = `admin:dashboard:summary:${adminRole}`; // Cache could be role specific
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return successResponse(res, cached, 'Dashboard summary from cache');
        }

        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await dashboardService.getSummary(adminRole, token);

        await cacheService.set(cacheKey, result, CACHE_TTL);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
    try {
        // We could cache this too
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await dashboardService.getMonthlyOverview(token);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const getPropertyDashboard = async (req: Request, res: Response) => {
    // Falls through to Analytics Client
    // Implement wrapper if needed or direct client call in service
    // For now, let's assume it's part of the summary or separate call
    // The prompt asked for GET /api/admin/dashboard/property/:propertyId
    // I'll implement handled by service or client
    try {
        const { propertyId } = req.params;
        // Logic to fetch property specific dashboard from Analytics Service
        // Client Service needed
        const { AnalyticsClientService } = require('../services/analyticsClient.service');
        const client = new AnalyticsClientService();
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await client.getPropertyAnalytics(propertyId, token);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
}
