import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        admin: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

describe('Auth Endpoints', () => {
    it('should login successfully with valid credentials', async () => {
        const mockAdmin = {
            admin_id: BigInt(1),
            email: 'admin@example.com',
            password: await bcrypt.hash('password123', 10),
            is_active: true,
            role: 'admin',
        };

        (prisma.admin.findFirst as jest.Mock).mockResolvedValue(mockAdmin);

        const res = await request(app)
            .post('/api/admin/auth/login')
            .send({ identifier: 'admin@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
        (prisma.admin.findFirst as jest.Mock).mockResolvedValue(null);

        const res = await request(app)
            .post('/api/admin/auth/login')
            .send({ identifier: 'admin@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });
});
