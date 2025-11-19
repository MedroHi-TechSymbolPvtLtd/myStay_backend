import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { cacheService } from '../services/cache.service';
import bcrypt from 'bcrypt';
import { jwtService } from '../services/jwt.service';

const app: Express = createApp();

describe('User Service Cache Behaviour', () => {
  const uniqueId = 'CUST-CACHE-001';

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { uniqueId },
    });

    const pinHash = await bcrypt.hash('9999', 10);
    await prisma.user.create({
      data: {
        uniqueId,
        userType: 'customer',
        firstName: 'Cache',
        lastName: 'Tester',
        phone: '+15550999000',
        email: 'cache@example.com',
        profileExtras: { pinHash },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { uniqueId },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('caches profile responses and invalidates on update', async () => {
    const setSpy = jest.spyOn(cacheService, 'set');
    const delSpy = jest.spyOn(cacheService, 'del');
    const verifySpy = jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({
        userId: '1',
        uniqueId,
        userType: 'customer',
      } as any);

    // First request should populate cache
    const getResponse = await request(app)
      .get(`/api/users/${uniqueId}/profile`)
      .set('Authorization', 'Bearer mock-token');

    expect(getResponse.status).toBe(200);
    expect(setSpy).toHaveBeenCalled();
    const cacheKey = setSpy.mock.calls[0][0];
    expect(cacheKey).toContain(uniqueId);

    // Update should invalidate cache
    const updateResponse = await request(app)
      .put(`/api/users/${uniqueId}/profile`)
      .set('Authorization', 'Bearer mock-token')
      .send({ city: 'Cache City' });

    expect(updateResponse.status).toBe(200);
    expect(delSpy).toHaveBeenCalledWith(cacheKey);

    verifySpy.mockRestore();
  });
});

