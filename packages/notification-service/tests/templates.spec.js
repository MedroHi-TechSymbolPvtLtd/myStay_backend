"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/prisma");
describe('Templates API', () => {
    beforeAll(async () => {
        await prisma_1.prisma.template.deleteMany();
    });
    afterAll(async () => {
        await prisma_1.prisma.$disconnect();
    });
    it('should create and retrieve a template', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        const getRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/notify/templates/test_template')
            .set('x-admin-key', 'dev_admin_key');
        expect(getRes.status).toBe(200);
        expect(getRes.body.name).toBe('Test Template');
    });
});
