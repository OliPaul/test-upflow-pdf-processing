import { Pdf } from './pdf';

export interface MetadataStorage {
    addPDF(pdf: Omit<Pdf, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pdf>;
    getPDFById(id: string): Promise<Pdf | null>;
    getAllPDFs(limit?: number, offset?: number): Promise<Pdf[]>;
    updatePDFStatus(id: string, status: Pdf['status'], hash?: string): Promise<Pdf | null>;
    findDuplicatePDFByUrl(url: string): Promise<Pdf | null>;
    findDuplicatePDFByHash(hash: string): Promise<Pdf | null>;
    countPDFsByStatus(): Promise<Record<string, number>>;
}