import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const mockToken = jwt.sign({ id: '1', role: 'admin' }, config.jwtSecret);

jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        admin: {
            findUnique: jest.fn().mockResolvedValue({ admin_id: BigInt(1), role: 'admin', is_active: true, permissions: { canAccessAnalytics: true } }),
        },
    },
}));

jest.mock('../services/analyticsClient.service', () => ({
    AnalyticsClientService: jest.fn().mockImplementation(() => ({
        getDashboardSummary: jest.fn().mockResolvedValue({ totalRevenue: 1000 }),
    })),
}));

jest.mock('../services/properties.service', () => ({
    PropertiesService: jest.fn().mockImplementation(() => ({
        getAllProperties: jest.fn().mockResolvedValue([]),
    })),
}));

jest.mock('../services/cache.service', () => ({
    cacheService: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn(),
    }
}));

describe('Dashboard', () => {
    it('should return summary', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard/summary')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
