import {Pdf, PdfStatus} from '../../models/pdf';
import {v4 as uuidv4} from 'uuid';
import {MetadataStorage} from "../../models/metadataStorage";

export class InMemoryMetadataStorage implements MetadataStorage {
    private pdfs: Map<string, Pdf>;

    constructor() {
        this.pdfs = new Map<string, Pdf>();
    }

    async addPDF(pdfData: Omit<Pdf, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pdf> {
        const id = uuidv4();
        const now = new Date();

        const pdf: Pdf = {
            ...pdfData,
            id,
            createdAt: now,
            updatedAt: now
        };

        this.pdfs.set(id, pdf);
        return pdf;
    }

    async getPDFById(id: string): Promise<Pdf | null> {
        const pdf = this.pdfs.get(id);
        return pdf || null;
    }

    async getAllPDFs(limit = 100, offset = 0): Promise<Pdf[]> {
        const pdfs = Array.from(this.pdfs.values());

        // Sort by createdAt in descending order
        pdfs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Apply limit and offset
        return pdfs.slice(offset, offset + limit);
    }

    async updatePDFStatus(id: string, status: Pdf['status'], hash?: string): Promise<Pdf | null> {
        const pdf = this.pdfs.get(id);

        if (!pdf) {
            return null;
        }

        const updatedPdf: Pdf = {
            ...pdf,
            status,
            contentHash: hash || pdf.contentHash,
            updatedAt: new Date()
        };

        this.pdfs.set(id, updatedPdf);
        return updatedPdf;
    }

    async findDuplicatePDFByUrl(url: string): Promise<Pdf | null> {
        for (const pdf of this.pdfs.values()) {
            if (pdf.sourceUrl === url) {
                return pdf;
            }
        }

        return null;
    }

    async findDuplicatePDFByHash(hash: string): Promise<Pdf | null> {
        for (const pdf of this.pdfs.values()) {
            if (pdf.contentHash === hash && pdf.status === PdfStatus.Completed) {
                return pdf;
            }
        }

        return null;
    }

    async countPDFsByStatus(): Promise<Record<string, number>> {
        const counts: Record<string, number> = {
            pending: 0,
            processing: 0,
            processed: 0,
            failed: 0
        };

        for (const pdf of this.pdfs.values()) {
            counts[pdf.status]++;
        }

        return counts;
    }
}