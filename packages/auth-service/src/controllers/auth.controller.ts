import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userService } from '../services/user.service';
import { jwtService } from '../services/jwt.service';
import { cashfreeService } from '../services/cashfree.service';
import { otpService } from '../services/otp.service';
import { generateUniqueId } from '../utils/generateUniqueId';

interface RegisterRequest {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  gender?: string;
  pin?: string;
  aadhaarOtpToken?: string;
}

export class AuthController {
  async registerCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, phone, email, gender, aadhaarOtpToken }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await userService.findUserByPhone(phone);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this phone number already exists',
        });
      }

      // Check email if provided
      if (email) {
        const existingEmail = await userService.findUserByEmail(email);
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists',
          });
        }
      }

      // Handle Aadhaar verification if token provided
      let aadhaarStatus = 'unverified';
      if (aadhaarOtpToken) {
        const verificationResult = await cashfreeService.verifyAadhaar(aadhaarOtpToken);
        if (verificationResult.verified) {
          aadhaarStatus = 'verified';
        } else if (cashfreeService.isEnabled()) {
          // If Cashfree is enabled but verification failed, return error
          return res.status(400).json({
            success: false,
            message: verificationResult.message || 'Aadhaar verification failed',
          });
        }
        // If Cashfree is disabled, continue with unverified status
      }

      // Generate unique ID
      const uniqueId = generateUniqueId('customer');

      // Create user
      const user = await userService.createUser({
        uniqueId,
        userType: 'customer',
        firstName,
        lastName,
        phone,
        email,
        sex: gender,
        aadhaarStatus,
      });

      // Generate OTP for verification
      const otp = await otpService.generateOTP(phone);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify OTP.',
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (error) {
      console.error('Customer registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
      });
    }
  }

  async registerAdmin(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, phone, email, pin, aadhaarOtpToken }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await userService.findUserByPhone(phone);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this phone number already exists',
        });
      }

      // Check email if provided
      if (email) {
        const existingEmail = await userService.findUserByEmail(email);
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists',
          });
        }
      }

      // Handle Aadhaar verification if token provided
      let aadhaarStatus = 'unverified';
      if (aadhaarOtpToken) {
        const verificationResult = await cashfreeService.verifyAadhaar(aadhaarOtpToken);
        if (verificationResult.verified) {
          aadhaarStatus = 'verified';
        } else if (cashfreeService.isEnabled()) {
          return res.status(400).json({
            success: false,
            message: verificationResult.message || 'Aadhaar verification failed',
          });
        }
      }

      // Hash PIN if provided
      let pinHash: string | undefined;
      if (pin) {
        const saltRounds = 10;
        pinHash = await bcrypt.hash(pin, saltRounds);
      }

      // Generate unique ID
      const uniqueId = generateUniqueId('admin');

      // Create user
      const user = await userService.createUser({
        uniqueId,
        userType: 'admin',
        firstName,
        lastName,
        phone,
        email,
        pinHash,
        aadhaarStatus,
      });

      // Generate JWT token
      const token = jwtService.sign({
        userId: user.id.toString(),
        uniqueId: user.uniqueId,
        userType: user.userType,
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          uniqueId: user.uniqueId,
          firstName: user.firstName,
          phone: user.phone,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error('Admin registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
      });
    }
  }
}

export const authController = new AuthController();

