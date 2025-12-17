import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { loginController } from '../controllers/login.controller';
import { forgotPinController } from '../controllers/forgotPin.controller';
import {
  registerCustomerValidation,
  registerAdminValidation,
  loginValidation,
  forgotPinRequestValidation,
  forgotPinVerifyValidation,
  loginRequestOtpValidation,
  loginVerifyOtpValidation,
  validate,
} from '../middlewares/validation';

const router = Router();

// Registration routes
router.post(
  '/register/customer',
  validate(registerCustomerValidation),
  authController.registerCustomer.bind(authController)
);

router.post(
  '/register/admin',
  validate(registerAdminValidation),
  authController.registerAdmin.bind(authController)
);

// Login route
router.post(
  '/login',
  validate(loginValidation),
  loginController.login.bind(loginController)
);

router.post(
  '/login/request-otp',
  validate(loginRequestOtpValidation),
  loginController.requestOTP.bind(loginController)
);

router.post(
  '/login/verify-otp',
  validate(loginVerifyOtpValidation),
  loginController.verifyOTP.bind(loginController)
);

// Forgot PIN routes
router.post(
  '/forgot-pin/request',
  validate(forgotPinRequestValidation),
  forgotPinController.requestOTP.bind(forgotPinController)
);

router.post(
  '/forgot-pin/verify',
  validate(forgotPinVerifyValidation),
  forgotPinController.verifyOTPAndResetPin.bind(forgotPinController)
);

export default router;

