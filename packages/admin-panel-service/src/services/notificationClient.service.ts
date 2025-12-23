import axios from 'axios';
import { config } from '../config';
import logger from '../logger';

export class NotificationClientService {
    private baseUrl = config.services.notification;

    async sendNotification(data: any, token: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/send`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error sending notification', error.message);
            throw new Error('Failed to send notification');
        }
    }
}
