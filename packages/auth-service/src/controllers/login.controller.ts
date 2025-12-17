import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userService } from '../services/user.service';
import { jwtService } from '../services/jwt.service';
import { firebaseService } from '../services/firebase.service';
import { otpService } from '../services/otp.service';

interface LoginRequest {
  phone: string;
  pin?: string;
  biometricToken?: string;
}

export class LoginController {
  /**
   * Login with phone and PIN or biometric token
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, pin, biometricToken }: LoginRequest = req.body;

      // Validate that at least one authentication method is provided
      if (!pin && !biometricToken) {
        return res.status(400).json({
          success: false,
          message: 'Either PIN or biometricToken is required',
        });
      }

      // Find user by phone
      const user = await userService.findUserByPhone(phone);
      if (!user) {
        console.log(`[Login] User not found for phone: ${phone}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid phone number or credentials',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        console.log(`[Login] Inactive user attempted login: ${user.uniqueId}`);
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Handle biometric authentication
      if (biometricToken) {
        const decodedToken = await firebaseService.verifyIdToken(biometricToken);

        if (!decodedToken) {
          console.log(`[Login] Invalid biometric token for phone: ${phone}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid biometric token',
          });
        }

        // Biometric token verified, proceed with login
        console.log(`[Login] Biometric login successful for user: ${user.uniqueId}`);
      }
      // Handle PIN authentication
      else if (pin) {
        // Parse profileExtras to get pinHash
        const profileExtras = user.profileExtras as Record<string, any> | null;
        const pinHash = profileExtras?.pinHash;

        if (!pinHash) {
          console.log(`[Login] No PIN hash found for user: ${user.uniqueId}`);
          return res.status(401).json({
            success: false,
            message: 'PIN not set for this account',
          });
        }

        // Verify PIN
        const isPinValid = await bcrypt.compare(pin, pinHash);
        if (!isPinValid) {
          console.log(`[Login] Invalid PIN for user: ${user.uniqueId}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid phone number or credentials',
          });
        }

        console.log(`[Login] PIN login successful for user: ${user.uniqueId}`);
      }

      // Generate JWT token
      const token = jwtService.sign({
        userId: user.id.toString(),
        uniqueId: user.uniqueId,
        userType: user.userType,
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          uniqueId: user.uniqueId,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error('[Login] Error during login:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  }

  async requestOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone } = req.body;

      // Find user by phone
      const user = await userService.findUserByPhone(phone);
      if (!user) {
        console.log(`[Login] OTP request for non-existent phone: ${phone}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid phone number',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Generate OTP
      const otp = await otpService.generateOTP(phone);

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (error) {
      console.error('[Login] Error requesting OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, otp } = req.body;

      const isValid = await otpService.verifyOTP(phone, otp);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      const user = await userService.findUserByPhone(phone);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Generate Token
      const token = jwtService.sign({
        userId: user.id.toString(),
        uniqueId: user.uniqueId,
        userType: user.userType,
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          uniqueId: user.uniqueId,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error('[Login] Error verifying OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const loginController = new LoginController();

