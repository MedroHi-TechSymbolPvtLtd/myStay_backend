import axios from 'axios';
import { config } from '../config';
import logger from '../logger';

export class TransactionClientService {
    private baseUrl = config.services.transaction;

    async getTransactionsByProperty(propertyId: string, token: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/property/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error(`Error fetching transactions for ${propertyId}`, error.message);
            throw new Error('Failed to fetch transactions');
        }
    }
}
