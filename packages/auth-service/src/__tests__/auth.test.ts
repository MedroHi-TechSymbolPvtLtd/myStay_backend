import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { otpService } from '../services/otp.service';
import { firebaseService } from '../services/firebase.service';
import bcrypt from 'bcrypt';
import { jwtService } from '../services/jwt.service';

const app = createApp();

describe('Auth Service API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        phone: {
          in: ['+15550000001', '+15550000002', '+15550000003', '+15550000004', '+15550000005'],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a customer successfully and returns OTP', async () => {
    const response = await request(app).post('/api/auth/register/customer').send({
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+15550000001',
      email: 'customer1@example.com',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.otp).toBeDefined(); // Only in dev/test environment usually, but checking here implies we rely on that behavior
    expect(response.body.message).toContain('OTP');
  });

  it('allows full flow: Register -> Verify OTP -> Set MPIN -> Login', async () => {
    const phone = '+15550000005';

    // 1. Register
    const regRes = await request(app).post('/api/auth/register/customer').send({
      firstName: 'Flow',
      lastName: 'User',
      phone: phone,
      email: 'flow@example.com',
    });
    expect(regRes.status).toBe(201);
    const otp = regRes.body.otp; // Assuming dev mode returns OTP

    // 2. Verify OTP
    const verifyRes = await request(app).post('/api/auth/login/verify-otp').send({
      phone: phone,
      otp: otp,
    });
    expect(verifyRes.status).toBe(200);
    const token = verifyRes.body.token;
    expect(token).toBeDefined();

    // 3. Set MPIN
    const mpinRes = await request(app)
      .post('/api/auth/set-mpin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mpin: '4321',
      });
    expect(mpinRes.status).toBe(200);

    // 4. Login with MPIN
    const loginRes = await request(app).post('/api/auth/login').send({
      phone: phone,
      pin: '4321',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('allows login with PIN (legacy/pre-set user)', async () => {
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
    // Register (without PIN)
    await request(app).post('/api/auth/register/customer').send({
      firstName: 'Reset',
      phone: '+15550000003',
      email: 'reset@example.com',
    });
    // Assume user somehow verified and set pin or just forgot it purely.
    // For this test we need the user to exist.

    // Request OTP for forgot pin
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
