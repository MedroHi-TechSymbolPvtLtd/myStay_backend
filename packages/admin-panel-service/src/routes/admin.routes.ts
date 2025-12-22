import { Router } from 'express';
import { createAdmin, listAdmins, updateAdminStatus, updatePermissions } from '../controllers/admin.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../utils/permissions';
import { z } from 'zod';

const router = Router();

// Only Super Admin can manage other admins
router.use(authenticateAdmin);
router.use(checkRole([ROLES.SUPER_ADMIN]));

const createAdminSchema = z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string(),
    password: z.string().min(6),
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN])
});

const updateStatusSchema = z.object({
    isActive: z.boolean()
});

router.post('/create', validate(createAdminSchema), createAdmin);
router.get('/list', listAdmins);
router.put('/:id/status', validate(updateStatusSchema), updateAdminStatus);
router.put('/:id/permissions', updatePermissions); // Schema could be added

export default router;
