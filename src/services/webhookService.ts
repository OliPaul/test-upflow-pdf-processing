import axios from 'axios';
import {Pdf, PdfStatus} from '../models/pdf';

export class WebhookService {

    async notify(webhookUrl: string, pdf: Pdf): Promise<boolean> {
        try {
            const payload = {
                id: pdf.id,
                status: pdf.status,
                url: pdf.sourceUrl,
                processedAt: pdf.updatedAt,
                pdfUrl: pdf.fileName,
                thumbnailUrl: pdf.status === PdfStatus.Completed ? pdf.thumbnailName : null,
            };

            await axios.post(webhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });

            return true;
        } catch (error) {
            console.error('Webhook notification failed:', error);
            return false;
        }
    }
}