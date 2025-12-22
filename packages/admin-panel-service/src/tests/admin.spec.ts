import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Mock middleware or auth
const mockToken = jwt.sign({ id: '1', role: 'super_admin' }, config.jwtSecret);

// Mock Prisma
jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        admin: {
            findUnique: jest.fn().mockImplementation((args) => {
                if (args.where.admin_id === BigInt(1)) {
                    return Promise.resolve({ admin_id: BigInt(1), role: 'super_admin', is_active: true, permissions: { canManageProperties: true } });
                }
                return Promise.resolve(null);
            }),
            findMany: jest.fn().mockResolvedValue([]),
        },
        $transaction: jest.fn(),
    },
}));

describe('Admin Management', () => {
    it('should list admins for super_admin', async () => {
        const res = await request(app)
            .get('/api/admin/list')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
