import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { userController } from '../controllers/user.controller';
import { validate, setMpinValidation } from '../middlewares/validation';

const router = Router();

// All routes in this file require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/me', userController.getMe.bind(userController));

// Set MPIN
router.post(
    '/set-mpin',
    validate(setMpinValidation),
    userController.setMpin.bind(userController)
);

export default router;

