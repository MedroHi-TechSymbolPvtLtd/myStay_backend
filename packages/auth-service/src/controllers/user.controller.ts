import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response): Promise<Response> {
    try {
      // User info is attached by authMiddleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const { uniqueId } = req.user;

      // Fetch user from database
      const user = await userService.findUserByUniqueId(uniqueId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Return user profile (exclude sensitive data like pinHash)
      const profileExtras = user.profileExtras as Record<string, any> | null;
      const { pinHash, ...safeProfileExtras } = profileExtras || {};

      return res.status(200).json({
        success: true,
        user: {
          id: user.id.toString(),
          uniqueId: user.uniqueId,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          sex: user.sex,
          phone: user.phone,
          email: user.email,
          aadhaarStatus: user.aadhaarStatus,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          emergencyName: user.emergencyName,
          emergencyPhone: user.emergencyPhone,
          profession: user.profession,
          profileExtras: safeProfileExtras,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('[User Controller] Error fetching user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user profile',
      });
    }
  }
}

export const userController = new UserController();

