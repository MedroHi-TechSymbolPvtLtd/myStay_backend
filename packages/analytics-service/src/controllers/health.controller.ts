import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { cacheService } from '../services/cache.service';
import { sendSuccess, sendError } from '../utils/response';

export const healthController = {
    check: async (req: Request, res: Response) => {
        try {
            // Simple DB check
            await prisma.$queryRaw`SELECT 1`;
            await cacheService.get('health_check'); // Simple Redis check if enabled
            sendSuccess(res, {
                status: 'UP',
                service: 'analytics-service',
                timestamp: new Date()
            });
        } catch (error) {
            sendError(res, { message: 'Service unhealthy', details: error }, 503);
        }
    }
};
