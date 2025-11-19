import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { userService } from '../services/user.service';
import { cacheService } from '../services/cache.service';
import { jwtService } from '../services/jwt.service';
import bcrypt from 'bcrypt';

describe('Profile API Tests', () => {
  let app: Express;
  let testUser: any;
  let testAdmin: any;
  let userToken: string;
  let adminToken: string;
  let otherUserToken: string;
  let otherUser: any;

  beforeAll(async () => {
    app = createApp();
    
    // Wait for Redis connection
    await cacheService.connect();

    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        phone: {
          in: ['+1111111111', '+2222222222', '+3333333333'],
        },
      },
    });

    // Create test user
    const pinHash = await bcrypt.hash('1234', 10);
    testUser = await userService.findUserByUniqueId('TEST-USER-001') || 
      await prisma.user.create({
        data: {
          uniqueId: 'TEST-USER-001',
          userType: 'customer',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1111111111',
          email: 'testuser@example.com',
          profileExtras: { pinHash },
        },
      });

    // Create test admin
    testAdmin = await userService.findUserByUniqueId('TEST-ADMIN-001') ||
      await prisma.user.create({
        data: {
          uniqueId: 'TEST-ADMIN-001',
          userType: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+2222222222',
          email: 'admin@example.com',
        },
      });

    // Create another user for authorization tests
    otherUser = await userService.findUserByUniqueId('TEST-USER-002') ||
      await prisma.user.create({
        data: {
          uniqueId: 'TEST-USER-002',
          userType: 'customer',
          firstName: 'Other',
          lastName: 'User',
          phone: '+3333333333',
          email: 'other@example.com',
        },
      });

    // Generate JWT tokens (using jwt.sign would require importing jwt, so we'll mock in tests)
    // For now, we'll use a simple token string and mock jwtService.verify in each test
    userToken = 'mock-user-token';
    adminToken = 'mock-admin-token';
    otherUserToken = 'mock-other-user-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        phone: {
          in: ['+1111111111', '+2222222222', '+3333333333'],
        },
      },
    });
    await prisma.$disconnect();
    await cacheService.disconnect();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.del('user:profile:TEST-USER-001');
    await cacheService.del('user:profile:TEST-ADMIN-001');
    await cacheService.del('user:profile:TEST-USER-002');
  });

  describe('GET /api/users/:uniqueId/profile', () => {
    it('should return user profile from database on cache miss', async () => {
      // Mock JWT verification
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      const response = await request(app)
        .get(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.uniqueId).toBe(testUser.uniqueId);
      expect(response.body.cached).toBe(false);

      jwtService.verify = originalVerify;
    });

    it('should return user profile from cache on cache hit', async () => {
      // Mock JWT verification
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      // First request - cache miss
      await request(app)
        .get(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`);

      // Second request - cache hit
      const response = await request(app)
        .get(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.uniqueId).toBe(testUser.uniqueId);
      expect(response.body.cached).toBe(true);

      jwtService.verify = originalVerify;
    });

    it('should return 404 for non-existent user', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      const response = await request(app)
        .get('/api/users/NON-EXISTENT/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      jwtService.verify = originalVerify;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.uniqueId}/profile`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:uniqueId/profile', () => {
    it('should update profile when user is the owner', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      const updateData = {
        city: 'New City',
        state: 'New State',
        profession: 'Developer',
      };

      const response = await request(app)
        .put(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.city).toBe('New City');
      expect(response.body.user.state).toBe('New State');
      expect(response.body.user.profession).toBe('Developer');

      // Verify cache was cleared
      const cached = await cacheService.get(`user:profile:${testUser.uniqueId}`);
      expect(cached).toBeNull();

      jwtService.verify = originalVerify;
    });

    it('should update profile when requester is admin', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testAdmin.id.toString(),
        uniqueId: testAdmin.uniqueId,
        userType: testAdmin.userType,
      });

      const updateData = {
        city: 'Admin Updated City',
      };

      const response = await request(app)
        .put(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.city).toBe('Admin Updated City');

      jwtService.verify = originalVerify;
    });

    it('should deny access when user is not owner or admin', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: otherUser.id.toString(),
        uniqueId: otherUser.uniqueId,
        userType: otherUser.userType,
      });

      const updateData = {
        city: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');

      jwtService.verify = originalVerify;
    });

    it('should validate input data', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      const response = await request(app)
        .put(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          pincode: '123', // Invalid - must be 6 digits
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      jwtService.verify = originalVerify;
    });

    it('should clear cache after update', async () => {
      const originalVerify = jwtService.verify.bind(jwtService);
      (jwtService as any).verify = jest.fn().mockReturnValue({
        userId: testUser.id.toString(),
        uniqueId: testUser.uniqueId,
        userType: testUser.userType,
      });

      // First, cache the profile
      await request(app)
        .get(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`);

      // Verify it's cached
      const cachedBefore = await cacheService.get(`user:profile:${testUser.uniqueId}`);
      expect(cachedBefore).not.toBeNull();

      // Update profile
      await request(app)
        .put(`/api/users/${testUser.uniqueId}/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ city: 'Updated City' });

      // Verify cache is cleared
      const cachedAfter = await cacheService.get(`user:profile:${testUser.uniqueId}`);
      expect(cachedAfter).toBeNull();

      jwtService.verify = originalVerify;
    });
  });
});

