import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { propertyService } from '../services/property.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

export const analyticsController = {
    getGlobalSummary: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Role check handled by auth middleware
            const data = await analyticsService.getAdminSummary();
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    },

    getMonthlyTrends: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const data = await analyticsService.getMonthlyTrends(year);
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    },

    getPropertyOverview: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const propertyId = BigInt(req.params.propertyId);
            const data = await propertyService.getPropertyOverview(propertyId);
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    },

    getOccupancy: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const propertyId = BigInt(req.params.propertyId);
            const data = await propertyService.getOccupancy(propertyId);
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    },

    getDues: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const propertyId = BigInt(req.params.propertyId);
            const data = await propertyService.getDues(propertyId);
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }
};
