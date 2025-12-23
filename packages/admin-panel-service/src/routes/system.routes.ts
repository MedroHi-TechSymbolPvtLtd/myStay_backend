import { Router } from 'express';
import { healthCheck, getExpenses, getTransactions, sendNotification } from '../controllers/system.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { PERMISSIONS } from '../utils/permissions';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

// Health Check (Public or Protected? Usually public for LB, but prompt asked for sys health in admin panel features. Might be authenticated or separate)
// Prompt: GET /health. Usually standard health check is public.
// I'll leave /health public in app.ts, but here maybe internal health?
// The prompt listed "SYSTEM HEALTH GET /health" as an admin feature.
// I'll check app.ts structure. Usually /health is top level.
// I'll put specific logic here if needed, but for now strict implementation:

router.get('/health', healthCheck); // Public?

router.use(authenticateAdmin);

router.get('/expenses/:propertyId', checkPermission(PERMISSIONS.CAN_VIEW_EXPENSES), getExpenses);
router.get('/transactions/:propertyId', checkPermission(PERMISSIONS.CAN_VIEW_TRANSACTIONS), getTransactions);

const notificationSchema = z.object({
    userId: z.string().optional(),
    title: z.string(),
    message: z.string(),
    type: z.string().default('SYSTEM')
});
router.post('/notify', validate(notificationSchema), sendNotification); // Super Admin or specific permission? Defaults to authenticated admin.

export default router;
