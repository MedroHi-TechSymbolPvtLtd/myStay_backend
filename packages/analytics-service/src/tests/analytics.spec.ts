import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';
import { cacheService } from '../services/cache.service';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Mock Prism and Cache
jest.mock('../services/cache.service');
jest.mock('../prisma', () => ({
    prisma: {
        transaction: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 100 } }) },
        expense: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 50 } }) },
        property: { count: jest.fn().mockResolvedValue(10) },
        room: { count: jest.fn().mockResolvedValue(50) },
        enrollment: { count: jest.fn().mockResolvedValue(20) },
        $queryRaw: jest.fn().mockResolvedValue([1]),
        $connect: jest.fn(),
    }
}));

const adminToken = jwt.sign({ userId: '1', userType: 'admin' }, config.jwtSecret);
const userToken = jwt.sign({ userId: '2', userType: 'customer' }, config.jwtSecret);

describe('Analytics API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/analytics/admin/summary', () => {
        it('should return summary for admin', async () => {
            (cacheService.get as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get('/api/analytics/admin/summary')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.totalRevenue).toBe(100);
            expect(res.body.data.totalExpenses).toBe(50);
        });

        it('should deny non-admin', async () => {
            const res = await request(app)
                .get('/api/analytics/admin/summary')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it('should fail without token', async () => {
            const res = await request(app).get('/api/analytics/admin/summary');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /health', () => {
        it('should return 200', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
