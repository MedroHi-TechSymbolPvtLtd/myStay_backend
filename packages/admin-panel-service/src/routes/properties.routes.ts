import { Router } from 'express';
import { getAllProperties, getProperty, updatePropertyStatus } from '../controllers/properties.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { PERMISSIONS } from '../utils/permissions';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

router.use(authenticateAdmin);

// Properties List & Detail
router.get('/', checkPermission(PERMISSIONS.CAN_MANAGE_PROPERTIES), getAllProperties);
router.get('/:propertyId', checkPermission(PERMISSIONS.CAN_MANAGE_PROPERTIES), getProperty);

// Update Status
const updateStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
});
router.put('/:propertyId/status', checkPermission(PERMISSIONS.CAN_MANAGE_PROPERTIES), validate(updateStatusSchema), updatePropertyStatus);

export default router;
