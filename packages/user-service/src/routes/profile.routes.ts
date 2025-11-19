import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOwnerOrAdmin } from '../middlewares/authorization';
import { validate, updateProfileValidation } from '../middlewares/validation';
import { profileController } from '../controllers/profile.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile (with caching)
router.get(
  '/:uniqueId/profile',
  profileController.getProfile.bind(profileController)
);

// Update user profile (requires owner or admin)
router.put(
  '/:uniqueId/profile',
  requireOwnerOrAdmin,
  validate(updateProfileValidation),
  profileController.updateProfile.bind(profileController)
);

export default router;

