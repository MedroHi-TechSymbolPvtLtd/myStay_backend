import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
    identifier: z.string().min(1),
    password: z.string().min(1)
});

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateAdmin, getProfile);

export default router;
