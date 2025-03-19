import {createPDFQueue} from './queue/pdfQueue';
import {PDFService} from './services/pdfService';
import {ThumbnailService} from './services/thumbnailService';
import {WebhookService} from './services/webhookService';
import {getConfig} from './config/config';
import {PdfStatus} from "./models/pdf";

const pdfService = new PDFService();
const thumbnailService = new ThumbnailService();
const webhookService = new WebhookService();

const pdfQueue = createPDFQueue();

const config = getConfig();
const MAX_CONCURRENT_PROCESSING = config.queue.concurrency;

async function startWorker() {
    console.log(`Starting PDF processing worker with concurrency: ${MAX_CONCURRENT_PROCESSING}`);

    await pdfService.initialize();

    await pdfQueue.process(MAX_CONCURRENT_PROCESSING, async (job) => {
        const {pdfId, webhookUrl} = job.data;

        try {
            await job.progress(10);
            console.log(`Processing PDF ${pdfId}...`);

            const pdf = await pdfService.getPDFById(pdfId);

            if (!pdf) {
                throw new Error(`PDF with ID ${pdfId} not found`);
            }

            await pdfService.updatePDFStatus(pdfId, PdfStatus.Processing);
            await job.progress(20);

            await pdfService.downloadPDF(pdf.sourceUrl, pdf.filePath);
            await job.progress(50);

            const fileStorage = (pdfService as any).fileStorage;
            const fileHash = await fileStorage.calculateFileHash(pdf.filePath);

            const duplicatePdf = await pdfService.findDuplicatePDFByHash(fileHash);

            if (duplicatePdf && duplicatePdf.id !== pdfId) {
                await fileStorage.copyFile(duplicatePdf.thumbnailPath, pdf.thumbnailPath);
                await job.progress(90);
            } else {
                await thumbnailService.generateThumbnail(pdf.filePath, pdf.thumbnailPath);
                await job.progress(90);
            }

            await pdfService.updatePDFStatus(pdfId, PdfStatus.Completed, fileHash);

            if (webhookUrl) {
                const updatedPdf = await pdfService.getPDFById(pdfId);
                if (updatedPdf) {
                    await webhookService.notify(webhookUrl, updatedPdf);
                }
            }

            await job.progress(100);
            console.log(`PDF ${pdfId} processed successfully`);

            return {success: true, id: pdfId};
        } catch (error) {
            console.error(`Error processing PDF ${pdfId}:`, error);

            await pdfService.updatePDFStatus(pdfId, PdfStatus.Failed);

            throw error;
        }
    });

    console.log('Worker started successfully');
}

startWorker().catch(err => {
    console.error('Failed to start worker:', err);
    process.exit(1);
});