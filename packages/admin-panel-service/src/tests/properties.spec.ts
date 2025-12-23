import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const mockToken = jwt.sign({ id: '1', role: 'admin' }, config.jwtSecret);

jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        admin: {
            findUnique: jest.fn().mockResolvedValue({ admin_id: BigInt(1), role: 'admin', is_active: true, permissions: { canManageProperties: true } }),
        },
    },
}));

jest.mock('../services/properties.service', () => ({
    PropertiesService: jest.fn().mockImplementation(() => ({
        getAllProperties: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Property' }]),
    })),
}));

jest.mock('../services/cache.service', () => ({
    cacheService: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn(),
    }
}));


describe('Properties', () => {
    it('should list properties', async () => {
        const res = await request(app)
            .get('/api/admin/properties')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
    });
});
