import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { errorResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message || err);

    if (err.name === 'UnauthorizedError') {
        return errorResponse(res, 'Invalid Token', 401);
    }

    return errorResponse(res, err.message || 'Server Error', 500, config.env === 'development' ? err : undefined);
};

// Need access to config in errorHandler for dev mode check
import { config } from '../config'; 
