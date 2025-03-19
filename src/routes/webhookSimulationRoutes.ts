import { Router } from 'express';
import {WebhookSimulationController} from "../controllers/webhookSimulationController";

const router = Router();
const webhookSimulationController = new WebhookSimulationController();

router.post('/webhook-simulation', (req, res) => webhookSimulationController.simulateWebhook(req, res));

export default router;