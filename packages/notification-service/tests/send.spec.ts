import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';
import { redisClient } from '../src/cache/redis.client';

describe('Send API', () => {
    beforeAll(async () => {
        // Mock Redis
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await redisClient.disconnect();
    });

    describe('POST /api/notify/send', () => {
        it('should send a notification successfully', async () => {
            const res = await request(app)
                .post('/api/notify/send')
                .set('x-admin-key', 'dev_admin_key')
                .send({
                    recipient: { email: 'test@example.com' },
                    channels: ['email'],
                    payload: { title: 'Test', body: 'Hello' },
                });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('sent');
        });

        it('should handle idempotency', async () => {
            const key = `test-idempotency-${Date.now()}`;

            // First request
            const res1 = await request(app)
                .post('/api/notify/send')
                .set('x-admin-key', 'dev_admin_key')
                .send({
                    idempotencyKey: key,
                    recipient: { email: 'test@example.com' },
                    channels: ['email'],
                    payload: { title: 'Test', body: 'Hello' },
                });

            expect(res1.status).toBe(200);

            // Second request
            const res2 = await request(app)
                .post('/api/notify/send')
                .set('x-admin-key', 'dev_admin_key')
                .send({
                    idempotencyKey: key,
                    recipient: { email: 'test@example.com' },
                    channels: ['email'],
                    payload: { title: 'Test', body: 'Hello' },
                });

            expect(res2.status).toBe(200);
            expect(res2.body.auditId).toBe(res1.body.auditId);
            expect(res2.body.cached).toBe(true);
        });
    });
});
