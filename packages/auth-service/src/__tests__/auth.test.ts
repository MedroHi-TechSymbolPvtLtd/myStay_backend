import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { otpService } from '../services/otp.service';
import { firebaseService } from '../services/firebase.service';
import bcrypt from 'bcrypt';

const app = createApp();

describe('Auth Service API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        phone: {
          in: ['+15550000001', '+15550000002', '+15550000003'],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a customer successfully', async () => {
    const response = await request(app).post('/api/auth/register/customer').send({
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+15550000001',
      email: 'customer1@example.com',
      pin: '1234',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.userType).toBe('customer');
  });

  it('allows login with PIN', async () => {
    const pinHash = await bcrypt.hash('5678', 10);
    await prisma.user.create({
      data: {
        uniqueId: 'CUST-LOGIN-001',
        userType: 'customer',
        firstName: 'Login',
        lastName: 'User',
        phone: '+15550000002',
        profileExtras: { pinHash },
      },
    });

    const response = await request(app).post('/api/auth/login').send({
      phone: '+15550000002',
      pin: '5678',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.phone).toBe('+15550000002');
  });

  it('supports forgot PIN flow end-to-end', async () => {
    // Register
    await request(app).post('/api/auth/register/customer').send({
      firstName: 'Reset',
      phone: '+15550000003',
      pin: '1111',
      email: 'reset@example.com',
    });

    // Request OTP
    const requestOtpResponse = await request(app)
      .post('/api/auth/forgot-pin/request')
      .send({ phone: '+15550000003' });

    expect(requestOtpResponse.status).toBe(200);

    const otpData = otpService.getOTPData('+15550000003');
    expect(otpData).toBeDefined();
    const otp = otpData?.otp as string;

    // Verify OTP & set new PIN
    const verifyResponse = await request(app)
      .post('/api/auth/forgot-pin/verify')
      .send({ phone: '+15550000003', otp, newPin: '2222' });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);

    // Login with new PIN
    const loginResponse = await request(app).post('/api/auth/login').send({
      phone: '+15550000003',
      pin: '2222',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });

  it('supports biometric login by mocking Firebase', async () => {
    const pinHash = await bcrypt.hash('3333', 10);
    await prisma.user.create({
      data: {
        uniqueId: 'CUST-BIO-001',
        userType: 'customer',
        firstName: 'Bio',
        lastName: 'Metric',
        phone: '+15550000004',
        profileExtras: { pinHash },
      },
    });

    const firebaseSpy = jest
      .spyOn(firebaseService, 'verifyIdToken')
      .mockResolvedValue({ uid: 'firebase-user' } as any);

    const response = await request(app).post('/api/auth/login').send({
      phone: '+15550000004',
      biometricToken: 'mock-token',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(firebaseSpy).toHaveBeenCalledWith('mock-token');

    firebaseSpy.mockRestore();
  });
});

