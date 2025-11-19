import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { cacheService } from '../services/cache.service';

const CACHE_TTL_SECONDS = 300; // 5 minutes
const CACHE_KEY_PREFIX = 'user:profile:';

export class ProfileController {
  /**
   * Get user profile by uniqueId
   * GET /api/users/:uniqueId/profile
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { uniqueId } = req.params;

      // Check cache first
      const cacheKey = `${CACHE_KEY_PREFIX}${uniqueId}`;
      const cachedProfile = await cacheService.get(cacheKey);

      if (cachedProfile) {
        console.log(`[Profile Controller] Cache hit for ${uniqueId}`);
        return res.status(200).json({
          success: true,
          user: JSON.parse(cachedProfile),
          cached: true,
        });
      }

      // Cache miss - fetch from database
      console.log(`[Profile Controller] Cache miss for ${uniqueId}, fetching from database`);
      const user = await userService.findUserByUniqueId(uniqueId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prepare response (exclude sensitive data)
      const profileExtras = user.profileExtras as Record<string, any> | null;
      const { pinHash, ...safeProfileExtras } = profileExtras || {};

      const userProfile = {
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
      };

      // Cache the profile
      await cacheService.set(cacheKey, JSON.stringify(userProfile), CACHE_TTL_SECONDS);

      return res.status(200).json({
        success: true,
        user: userProfile,
        cached: false,
      });
    } catch (error) {
      console.error('[Profile Controller] Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/:uniqueId/profile
   */
  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { uniqueId } = req.params;
      const {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        emergencyName,
        emergencyPhone,
        profession,
      } = req.body;

      // Check if user exists
      const existingUser = await userService.findUserByUniqueId(uniqueId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Build update data (only include provided fields)
      const updateData: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        emergencyName?: string;
        emergencyPhone?: string;
        profession?: string;
      } = {};

      if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
      if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (pincode !== undefined) updateData.pincode = pincode;
      if (emergencyName !== undefined) updateData.emergencyName = emergencyName;
      if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone;
      if (profession !== undefined) updateData.profession = profession;

      // Update user in database
      const updatedUser = await userService.updateUserProfile(uniqueId, updateData);

      // Clear cache for this user
      const cacheKey = `${CACHE_KEY_PREFIX}${uniqueId}`;
      await cacheService.del(cacheKey);
      console.log(`[Profile Controller] Cache cleared for ${uniqueId}`);

      // Prepare response
      const profileExtras = updatedUser.profileExtras as Record<string, any> | null;
      const { pinHash, ...safeProfileExtras } = profileExtras || {};

      const userProfile = {
        id: updatedUser.id.toString(),
        uniqueId: updatedUser.uniqueId,
        userType: updatedUser.userType,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        sex: updatedUser.sex,
        phone: updatedUser.phone,
        email: updatedUser.email,
        aadhaarStatus: updatedUser.aadhaarStatus,
        addressLine1: updatedUser.addressLine1,
        addressLine2: updatedUser.addressLine2,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        emergencyName: updatedUser.emergencyName,
        emergencyPhone: updatedUser.emergencyPhone,
        profession: updatedUser.profession,
        profileExtras: safeProfileExtras,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userProfile,
      });
    } catch (error) {
      console.error('[Profile Controller] Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile',
      });
    }
  }
}

export const profileController = new ProfileController();

