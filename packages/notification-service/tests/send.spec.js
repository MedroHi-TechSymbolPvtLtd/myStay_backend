"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/prisma");
const redis_client_1 = require("../src/cache/redis.client");
describe('Send API', () => {
    beforeAll(async () => {
        // Mock Redis
        if (!redis_client_1.redisClient.isOpen) {
            await redis_client_1.redisClient.connect();
        }
    });
    afterAll(async () => {
        await prisma_1.prisma.$disconnect();
        await redis_client_1.redisClient.disconnect();
    });
    describe('POST /api/notify/send', () => {
        it('should send a notification successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res1 = await (0, supertest_1.default)(app_1.default)
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
            const res2 = await (0, supertest_1.default)(app_1.default)
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
