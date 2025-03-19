import { Request, Response } from 'express';

export class WebhookSimulationController {
    constructor() {}

    async simulateWebhook(req: Request, res: Response): Promise<void> {
        try {
            console.log('Webhook received:', req.body);
            res.status(200).send('Webhook simulation successful');
        } catch (error) {
            res.status(500).send('Webhook simulation failed');
        }
    }
}