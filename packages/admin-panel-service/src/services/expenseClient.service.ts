import axios from 'axios';
import { config } from '../config';
import logger from '../logger';

export class ExpenseClientService {
    private baseUrl = config.services.expense;

    async getExpensesByProperty(propertyId: string, token: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/${propertyId}`, { // Assuming route pattern
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error(`Error fetching expenses for ${propertyId}`, error.message);
            throw new Error('Failed to fetch expenses');
        }
    }
}
