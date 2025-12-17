import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';

describe('Templates API', () => {
    beforeAll(async () => {
        await prisma.template.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should create and retrieve a template', async () => {
        const res = await request(app)
            .post('/api/notify/templates')
            .set('x-admin-key', 'dev_admin_key')
            .send({
                id: 'test_template',
                name: 'Test Template',
                channel: 'email',
                body: 'Hello {{name}}',
                variables: { name: 'string' },
            });

        expect(res.status).toBe(201);

        const getRes = await request(app)
            .get('/api/notify/templates/test_template')
            .set('x-admin-key', 'dev_admin_key');

        expect(getRes.status).toBe(200);
        expect(getRes.body.name).toBe('Test Template');
    });
});
