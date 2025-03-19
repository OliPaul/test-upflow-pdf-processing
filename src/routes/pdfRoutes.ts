import { Router } from 'express';
import { PDFController } from '../controllers/pdfController';

const router = Router();
const pdfController = new PDFController();

router.post('/pdfs', (req, res) => pdfController.submitPDF(req, res));
router.get('/pdfs', (req, res) => pdfController.getPDFs(req, res));

export default router;