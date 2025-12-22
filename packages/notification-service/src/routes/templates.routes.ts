import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    // TODO: Implement get templates logic
    res.status(200).json({ templates: [] });
});

router.post('/', (req: Request, res: Response) => {
    // TODO: Implement create template logic
    res.status(201).json({ message: 'Template created' });
});

export default router;
