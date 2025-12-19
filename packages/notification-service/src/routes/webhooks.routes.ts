import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    // TODO: Implement webhook handling logic
    console.log('Webhook received:', req.body);
    res.status(200).json({ received: true });
});

export default router;
