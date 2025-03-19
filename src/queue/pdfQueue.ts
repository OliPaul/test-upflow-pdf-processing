import Bull from 'bull';
import { getConfig } from '../config/config';

export interface PDFJobData {
    pdfId: string;
    webhookUrl?: string;
}

export const QUEUE_NAME = 'pdf-processing';

export function createPDFQueue(): Bull.Queue<PDFJobData> {
    const config = getConfig();

    const queue = new Bull<PDFJobData>(QUEUE_NAME, {
        redis: {
            host: config.queue.redis.host,
            port: config.queue.redis.port,
        },
        defaultJobOptions: {
            attempts: 3, // Retries
            backoff: {   // Retries strategy
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: false,
            removeOnFail: false
        }
    });

    queue.on('completed', (job) => {
        console.log(`Job ${job.id} completed for PDF ${job.data.pdfId}`);
    });

    queue.on('failed', (job, error) => {
        console.error(`Job ${job.id} failed for PDF ${job.data.pdfId}:`, error);
    });

    queue.on('stalled', (job) => {
        console.warn(`Job ${job.id} stalled for PDF ${job.data.pdfId}`);
    });

    return queue;
}