import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Admin Global Dashboard
router.get(
    '/admin/summary',
    authorizeAdmin,
    analyticsController.getGlobalSummary
);

router.get(
    '/admin/monthly',
    authorizeAdmin,
    analyticsController.getMonthlyTrends
);

// Property Specific
const propertyParams = z.object({
    params: z.object({
        propertyId: z.string().regex(/^\d+$/),
    }),
});

router.get(
    '/property/:propertyId/overview',
    validate(propertyParams),
    // Additional permission logic could go here: authorizeOwnerOrAdmin
    analyticsController.getPropertyOverview
);

router.get(
    '/property/:propertyId/occupancy',
    validate(propertyParams),
    analyticsController.getOccupancy
);

router.get(
    '/property/:propertyId/dues',
    validate(propertyParams),
    analyticsController.getDues
);

export default router;
