import {Pdf} from '../../models/pdf';
import {v4 as uuidv4} from 'uuid';
import {MetadataStorage} from "../../models/metadataStorage";

export class DbMetadataStorage implements MetadataStorage {

    constructor(private dbType: string, private connectionString: string) {
        console.log(`[DbMetadataStorage] Initializing ${dbType} connection to ${connectionString}`);
    }

    async addPDF(pdfData: Omit<Pdf, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pdf> {
        console.log(`[DbMetadataStorage] Adding PDF: ${pdfData.sourceUrl}`);

        const id = uuidv4();
        const now = new Date();

        return {
            ...pdfData,
            id,
            createdAt: now,
            updatedAt: now
        };
    }

    async getPDFById(id: string): Promise<Pdf | null> {
        console.log(`[DbMetadataStorage] Getting PDF by ID: ${id}`);
        return null;
    }

    async getAllPDFs(limit = 100, offset = 0): Promise<Pdf[]> {
        console.log(`[DbMetadataStorage] Getting all PDFs (limit: ${limit}, offset: ${offset})`);
        return [];
    }

    async updatePDFStatus(id: string, status: Pdf['status'], hash?: string): Promise<Pdf | null> {
        console.log(`[DbMetadataStorage] Updating PDF status: ${id} -> ${status}`);
        return null;
    }

    async findDuplicatePDFByUrl(url: string): Promise<Pdf | null> {
        console.log(`[DbMetadataStorage] Finding duplicate PDF by URL: ${url}`);
        return null;
    }

    async findDuplicatePDFByHash(hash: string): Promise<Pdf | null> {
        console.log(`[DbMetadataStorage] Finding duplicate PDF by hash: ${hash}`);
        return null;
    }

    async countPDFsByStatus(): Promise<Record<string, number>> {
        console.log(`[DbMetadataStorage] Counting PDFs by status`);
        return {
            pending: 0,
            processing: 0,
            processed: 0,
            failed: 0
        };
    }
}