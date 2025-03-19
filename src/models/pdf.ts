export enum PdfStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
}

export interface Pdf {
    id: string;
    sourceUrl: string;
    fileName: string;
    filePath: string;
    thumbnailName: string;
    thumbnailPath: string;
    status: PdfStatus;
    // Content hash to avoid duplicate
    contentHash?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PdfResponse {
    id: string;
    sourceUrl: string;
    pdfUrl: string;
    thumbnailUrl: string;
    status: PdfStatus;
    createdAt: Date;
    updatedAt: Date;
}