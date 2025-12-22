import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    // TODO: Implement send notification logic
    res.status(200).json({ message: 'Notification sent successfully' });
});

export default router;
