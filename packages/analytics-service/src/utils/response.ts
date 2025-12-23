import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
};

export const sendError = (res: Response, error: any, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'Internal Server Error',
            details: error.details,
        },
    });
};
