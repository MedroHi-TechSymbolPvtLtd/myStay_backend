import { Request, Response } from 'express';
import { ExpenseClientService } from '../services/expenseClient.service';
import { TransactionClientService } from '../services/transactionClient.service';
import { NotificationClientService } from '../services/notificationClient.service';
import { successResponse, errorResponse } from '../utils/response';

const expenseClient = new ExpenseClientService();
const transactionClient = new TransactionClientService();
const notificationClient = new NotificationClientService();

export const healthCheck = (req: Request, res: Response) => {
    successResponse(res, { status: 'UP', service: 'admin-panel-service' });
};

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await expenseClient.getExpensesByProperty(propertyId, token);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await transactionClient.getTransactionsByProperty(propertyId, token);
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const sendNotification = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || '';
        const result = await notificationClient.sendNotification(req.body, token);
        successResponse(res, result, 'Notification sent');
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};
