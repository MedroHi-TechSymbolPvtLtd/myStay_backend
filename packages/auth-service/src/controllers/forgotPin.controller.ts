import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userService } from '../services/user.service';
import { otpService } from '../services/otp.service';
import { prisma } from '../lib/prisma';

interface ForgotPinRequestRequest {
  phone: string;
}

interface ForgotPinVerifyRequest {
  phone: string;
  otp: string;
  newPin: string;
}

export class ForgotPinController {
  /**
   * Request OTP for PIN reset
   */
  async requestOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone }: ForgotPinRequestRequest = req.body;

      // Find user by phone
      const user = await userService.findUserByPhone(phone);
      if (!user) {
        // Don't reveal if user exists for security
        console.log(`[Forgot PIN] OTP request for non-existent phone: ${phone}`);
        // Still return success to prevent user enumeration
        return res.status(200).json({
          success: true,
          message: 'If the phone number exists, an OTP has been sent',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        console.log(`[Forgot PIN] OTP request for inactive user: ${user.uniqueId}`);
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Generate and store OTP
      const otp = await otpService.generateOTP(phone);

      // In production, OTP is sent via SMS here
      // For development, OTP is logged and returned in response (remove in production)
      console.log(`[Forgot PIN] OTP generated for ${phone}: ${otp}`);

      return res.status(200).json({
        success: true,
        message: 'If the phone number exists, an OTP has been sent',
        // Remove this in production - only for development
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (error) {
      console.error('[Forgot PIN] Error during OTP request:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during OTP request',
      });
    }
  }

  /**
   * Verify OTP and reset PIN
   */
  async verifyOTPAndResetPin(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, otp, newPin }: ForgotPinVerifyRequest = req.body;

      // Validate new PIN
      if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
        return res.status(400).json({
          success: false,
          message: 'PIN must be 4-6 digits',
        });
      }

      // Find user by phone
      const user = await userService.findUserByPhone(phone);
      if (!user) {
        console.log(`[Forgot PIN] Verify attempt for non-existent phone: ${phone}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP or phone number',
        });
      }

      // Verify OTP
      const isOTPValid = await otpService.verifyOTP(phone, otp);
      if (!isOTPValid) {
        console.log(`[Forgot PIN] Invalid OTP for phone: ${phone}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Hash new PIN
      const saltRounds = 10;
      const newPinHash = await bcrypt.hash(newPin, saltRounds);

      // Update user's PIN hash in profileExtras
      const profileExtras = (user.profileExtras as Record<string, any>) || {};
      profileExtras.pinHash = newPinHash;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          profileExtras: profileExtras,
        },
      });

      // Remove OTP after successful verification
      otpService.removeOTP(phone);

      console.log(`[Forgot PIN] PIN reset successful for user: ${user.uniqueId}`);

      return res.status(200).json({
        success: true,
        message: 'PIN has been reset successfully',
      });
    } catch (error) {
      console.error('[Forgot PIN] Error during PIN reset:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during PIN reset',
      });
    }
  }
}

export const forgotPinController = new ForgotPinController();

