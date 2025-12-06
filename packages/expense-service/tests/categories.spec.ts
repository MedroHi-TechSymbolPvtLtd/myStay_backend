import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

const adminToken = jwt.sign({ id: 1, role: 'admin' }, config.jwtSecret);
const userToken = jwt.sign({ id: 2, role: 'user' }, config.jwtSecret);

describe('Categories API', () => {
    beforeAll(async () => {
        await prisma.expenseCategory.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/expenses/categories', () => {
        it('should create a new category', async () => {
            const res = await request(app)
                .post('/api/expenses/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test Category', description: 'Test Description' });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Test Category');
        });

        it('should fail if not admin', async () => {
            const res = await request(app)
                .post('/api/expenses/categories')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Fail Category' });

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/expenses/categories', () => {
        it('should return all categories', async () => {
            const res = await request(app)
                .get('/api/expenses/categories')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
