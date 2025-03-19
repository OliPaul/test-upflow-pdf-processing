import { Request, Response } from 'express';
import { PDFService } from '../services/pdfService';
import { createPDFQueue, PDFJobData } from '../queue/pdfQueue';
import Bull from 'bull';
import {Pdf} from "../models/pdf";

export class PDFController {
    private pdfService: PDFService;
    private pdfQueue: Bull.Queue<PDFJobData>;

    constructor() {
        this.pdfService = new PDFService();
        this.pdfQueue = createPDFQueue();

        this.pdfService.initialize()
            .then(() => console.log('PDF service initialized.'))
            .catch(err => console.error('Failed to initialize PDF service:', err));
    }

    async submitPDF(req: Request, res: Response): Promise<void> {
        try {
            const { url, webhookUrl } = req.body;

            if (!url) {
                res.status(400).json({ error: 'PDF URL is required' });
                return;
            }

            const existingPdf: Pdf | null = await this.pdfService.findDuplicatePDFByUrl(url);
            if (existingPdf) {
                const response = this.pdfService.transformPDFToResponse(
                    existingPdf,
                    `${req.protocol}://${req.get('host')}`
                );

                res.status(200).json({
                    ...response,
                    message: 'Duplicate PDF detected',
                });
                return;
            }

            const pdf = await this.pdfService.addPDF(url);

            await this.pdfQueue.add({
                pdfId: pdf.id,
                webhookUrl
            }, {
                priority: 1,
                jobId: pdf.id
            });

            const response = this.pdfService.transformPDFToResponse(
                pdf,
                `${req.protocol}://${req.get('host')}`
            );

            res.status(202).json({
                ...response,
                message: 'PDF submission accepted for processing',
            });
        } catch (error) {
            console.error('Error submitting PDF:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getPDFs(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

            const pdfs = await this.pdfService.getAllPDFs(limit, offset);

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const pdfsList = pdfs.map(pdf => this.pdfService.transformPDFToResponse(pdf, baseUrl));

            res.status(200).json(pdfsList);
        } catch (error) {
            console.error('Error getting PDFs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}