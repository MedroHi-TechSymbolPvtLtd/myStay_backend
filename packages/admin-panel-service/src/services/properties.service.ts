import axios from 'axios';
import { config } from '../config';
import logger from '../logger';

// Assuming Property Service exists or is part of another service
// If not defined, we'll assume it's on port 3002 (common in this arch for core/property)
const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002/api/properties';

export class PropertiesService {

    async getAllProperties(token: string) {
        try {
            // Admin getting all properties
            const response = await axios.get(`${PROPERTY_SERVICE_URL}/admin/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            // If service not responding and we are in dev/demo, mock response or throw
            logger.error('Error fetching properties', error.message);
            // Fallback for demo if service is offline
            if (config.env === 'development' && error.code === 'ECONNREFUSED') {
                return [
                    { id: '1', name: 'Luxury Villa', location: 'Goa', status: 'ACTIVE' },
                    { id: '2', name: 'City Apartment', location: 'Mumbai', status: 'MAINTENANCE' }
                ];
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch properties');
        }
    }

    async getPropertyById(id: string, token: string) {
        try {
            const response = await axios.get(`${PROPERTY_SERVICE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error(`Error fetching property ${id}`, error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch property');
        }
    }

    async updateStatus(id: string, status: string, token: string) {
        try {
            const response = await axios.put(`${PROPERTY_SERVICE_URL}/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error: any) {
            logger.error(`Error updating property ${id} status`, error.message);
            throw new Error(error.response?.data?.message || 'Failed to update property status');
        }
    }
}
