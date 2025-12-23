import { Router } from 'express';
import { getDashboardSummary, getMonthlyStats, getPropertyDashboard } from '../controllers/dashboard.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { PERMISSIONS } from '../utils/permissions';

const router = Router();

router.use(authenticateAdmin);

router.get('/summary', checkPermission(PERMISSIONS.CAN_ACCESS_ANALYTICS), getDashboardSummary);
router.get('/monthly', checkPermission(PERMISSIONS.CAN_ACCESS_ANALYTICS), getMonthlyStats);
router.get('/property/:propertyId', checkPermission(PERMISSIONS.CAN_ACCESS_ANALYTICS), getPropertyDashboard);

export default router;
