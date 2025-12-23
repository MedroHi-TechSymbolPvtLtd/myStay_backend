import { Request, Response } from 'express';
import { PropertiesService } from '../services/properties.service';
import { cacheService } from '../services/cache.service'; // I created this
import { successResponse, errorResponse } from '../utils/response';

const propertiesService = new PropertiesService();
const CACHE_TTL = 180; // 180 seconds

export const getAllProperties = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'admin:properties:list';
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return successResponse(res, cached, 'Properties fetched from cache');
        }

        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await propertiesService.getAllProperties(token);

        await cacheService.set(cacheKey, result, CACHE_TTL);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const getProperty = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await propertiesService.getPropertyById(propertyId, token);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const updatePropertyStatus = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const { status } = req.body;
        const token = req.headers.authorization?.split(' ')[1] || '';

        const result = await propertiesService.updateStatus(propertyId, status, token);

        // Invalidate list cache
        await cacheService.delete('admin:properties:list');

        successResponse(res, result, 'Property status updated');
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};
