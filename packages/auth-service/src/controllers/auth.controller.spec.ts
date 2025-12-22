import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { userService } from '../services/user.service';
import { otpService } from '../services/otp.service';
import { cashfreeService } from '../services/cashfree.service';
import { jwtService } from '../services/jwt.service';

// Mock dependencies
jest.mock('../services/user.service');
jest.mock('../services/otp.service');
jest.mock('../services/cashfree.service');
jest.mock('../services/jwt.service');
jest.mock('../utils/generateUniqueId', () => ({
    generateUniqueId: jest.fn().mockReturnValue('CUST-123'),
}));

describe('AuthController', () => {
    let authController: AuthController;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        authController = new AuthController();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockRes = {
            status: statusMock,
        } as unknown as Response;

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('registerCustomer', () => {
        it('should register a customer successfully without PIN and send OTP', async () => {
            mockReq = {
                body: {
                    firstName: 'Test',
                    lastName: 'User',
                    phone: '+1234567890',
                    email: 'test@example.com',
                },
            };

            // Mock user service responses
            (userService.findUserByPhone as jest.Mock).mockResolvedValue(null);
            (userService.findUserByEmail as jest.Mock).mockResolvedValue(null);
            (userService.createUser as jest.Mock).mockResolvedValue({
                id: BigInt(1),
                uniqueId: 'CUST-123',
                userType: 'customer',
                firstName: 'Test',
                phone: '+1234567890',
            });

            // Mock OTP service
            (otpService.generateOTP as jest.Mock).mockResolvedValue('123456');

            await authController.registerCustomer(mockReq as Request, mockRes as Response);

            // Verify user lookup
            expect(userService.findUserByPhone).toHaveBeenCalledWith('+1234567890');

            // Verify user creation - ensures pinHash is NOT passed/generated
            expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                firstName: 'Test',
                phone: '+1234567890',
                aadhaarStatus: 'unverified',
            }));

            // Verify NO pinHash in createUser call
            const createUserArgs = (userService.createUser as jest.Mock).mock.calls[0][0];
            expect(createUserArgs).not.toHaveProperty('pinHash');

            // Verify OTP generation
            expect(otpService.generateOTP).toHaveBeenCalledWith('+1234567890');

            // Verify response
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('User registered successfully'),
            }));
        });

        it('should fail if user already exists', async () => {
            mockReq = {
                body: {
                    firstName: 'Test',
                    phone: '+1234567890',
                },
            };

            (userService.findUserByPhone as jest.Mock).mockResolvedValue({ id: 1 });

            await authController.registerCustomer(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringMatching(/already exists/),
            }));
        });
    });
});
