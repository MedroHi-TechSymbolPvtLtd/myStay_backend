import axios from 'axios';
import { config } from '../config';
import logger from '../logger';

export class AnalyticsClientService {
    private baseUrl = config.services.analytics;

    async getDashboardSummary(token: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/admin/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error('Error fetching analytics summary', error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
        }
    }

    async getMonthlyStats(token: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/admin/monthly`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error('Error fetching monthly stats', error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch monthly stats');
        }
    }

    async getPropertyAnalytics(propertyId: string, token: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/admin/property/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error(`Error fetching property analytics for ${propertyId}`, error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch property analytics');
        }
    }
}
