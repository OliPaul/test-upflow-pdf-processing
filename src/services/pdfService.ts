import crypto from 'crypto';
import {Pdf, PdfResponse, PdfStatus} from '../models/pdf';
import {FileStorageFactory} from './fileStorage/fileStorageFactory';
import {MetadataStorageFactory} from './metadataStorage/metadataStorageFactory';
import {getConfig} from '../config/config';
import {FileStorage} from "../models/fileStorage";
import {MetadataStorage} from "../models/metadataStorage";

export class PDFService {
    private fileStorage: FileStorage;
    private metadataStorage: MetadataStorage;

    constructor() {
        const config = getConfig();
        this.fileStorage = FileStorageFactory.getInstance(
            config.fileStorage.type,
            config.fileStorage.options
        );
        this.metadataStorage = MetadataStorageFactory.getInstance(
            config.metadataStorage.type,
            config.metadataStorage.options
        );
    }

    async initialize(): Promise<void> {
        await this.fileStorage.ensureDirectoriesExist();
    }

    generateFileName(url: string): string {
        const hash = crypto.createHash('md5').update(url).digest('hex');
        return `${hash}.pdf`;
    }

    generateThumbnailName(pdfFileName: string): string {
        return pdfFileName.replace('.pdf', '.png');
    }

    async addPDF(url: string): Promise<Pdf> {
        const fileName = this.generateFileName(url);
        const thumbnailName = this.generateThumbnailName(fileName);

        const filePath = this.fileStorage.getFilePath(fileName, 'pdf');
        const thumbnailPath = this.fileStorage.getFilePath(thumbnailName, 'thumbnail');

        return this.metadataStorage.addPDF({
            sourceUrl: url,
            fileName,
            filePath,
            thumbnailName,
            thumbnailPath,
            status: PdfStatus.Pending
        });
    }

    async downloadPDF(url: string, filePath: string): Promise<void> {
        await this.fileStorage.saveFileFromUrl(url, filePath);
    }

    async updatePDFStatus(id: string, status: Pdf['status'], hash?: string): Promise<Pdf | null> {
        return this.metadataStorage.updatePDFStatus(id, status, hash);
    }

    async getPDFById(id: string): Promise<Pdf | null> {
        return this.metadataStorage.getPDFById(id);
    }

    async getAllPDFs(limit?: number, offset?: number): Promise<Pdf[]> {
        return this.metadataStorage.getAllPDFs(limit, offset);
    }

    async findDuplicatePDFByUrl(url: string): Promise<Pdf | null> {
        return this.metadataStorage.findDuplicatePDFByUrl(url);
    }

    async findDuplicatePDFByHash(hash: string): Promise<Pdf | null> {
        return this.metadataStorage.findDuplicatePDFByHash(hash);
    }

    transformPDFToResponse(pdf: Pdf, baseUrl: string): PdfResponse {
        return {
            id: pdf.id,
            sourceUrl: pdf.sourceUrl,
            pdfUrl: this.fileStorage.getFileUrl(pdf.fileName, 'pdf', baseUrl),
            thumbnailUrl: pdf.status === PdfStatus.Completed
                ? this.fileStorage.getFileUrl(pdf.thumbnailName, 'thumbnail', baseUrl)
                : null,
            status: pdf.status,
            createdAt: pdf.createdAt,
            updatedAt: pdf.updatedAt,
        };
    }
}