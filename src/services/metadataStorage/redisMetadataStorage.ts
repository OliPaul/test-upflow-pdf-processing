import {Pdf, PdfStatus} from '../../models/pdf';
import {v4 as uuidv4} from 'uuid';
import Redis from 'ioredis';
import {MetadataStorage} from "../../models/metadataStorage";

export class RedisMetadataStorage implements MetadataStorage {
    private client: Redis;
    private prefix: string = 'pdf:';

    constructor(redisUrl: string = 'redis://localhost:6379') {
        this.client = new Redis(redisUrl);
    }

    private serializePDF(pdf: Pdf): string {
        return JSON.stringify(pdf);
    }

    private deserializePDF(json: string | null): Pdf | null {
        if (!json) {
            return null;
        }

        const pdf = JSON.parse(json) as Pdf;
        pdf.createdAt = new Date(pdf.createdAt);
        pdf.updatedAt = new Date(pdf.updatedAt);

        return pdf;
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

        await this.client.set(
            this.prefix + id,
            this.serializePDF(pdf)
        );

        await this.client.sadd('pdfs:all', id);

        await this.client.set(`pdfs:url:${this.hashString(pdf.sourceUrl)}`, id);

        await this.client.sadd(`pdfs:status:${pdf.status}`, id);

        return pdf;
    }

    async getPDFById(id: string): Promise<Pdf | null> {
        const pdfJson = await this.client.get(this.prefix + id);
        return this.deserializePDF(pdfJson);
    }

    async getAllPDFs(limit = 100, offset = 0): Promise<Pdf[]> {
        const ids = await this.client.smembers('pdfs:all');
        const sortedIds = ids.sort();

        const paginatedIds = sortedIds.slice(offset, offset + limit);

        if (paginatedIds.length === 0) {
            return [];
        }

        const pdfKeys = paginatedIds.map(id => this.prefix + id);
        const pdfsJson = await this.client.mget(...pdfKeys);

        const pdfs = pdfsJson
            .map(json => this.deserializePDF(json))
            .filter((pdf): pdf is Pdf => pdf !== null);

        return pdfs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async updatePDFStatus(id: string, status: Pdf['status'], hash?: string): Promise<Pdf | null> {
        const currentPdfJson = await this.client.get(this.prefix + id);
        const currentPdf = this.deserializePDF(currentPdfJson);

        if (!currentPdf) {
            return null;
        }

        const updatedPdf: Pdf = {
            ...currentPdf,
            status,
            ...(hash ? { hash } : {}),
            updatedAt: new Date()
        };

        await this.client.set(this.prefix + id, this.serializePDF(updatedPdf));

        await this.client.srem(`pdfs:status:${currentPdf.status}`, id);
        await this.client.sadd(`pdfs:status:${status}`, id);

        if (hash) {
            await this.client.set(`pdfs:hash:${hash}`, id);
        }

        return updatedPdf;
    }

    async findDuplicatePDFByUrl(url: string): Promise<Pdf | null> {
        const id = await this.client.get(`pdfs:url:${this.hashString(url)}`);

        if (!id) {
            return null;
        }

        return this.getPDFById(id);
    }

    async findDuplicatePDFByHash(hash: string): Promise<Pdf | null> {
        const id = await this.client.get(`pdfs:hash:${hash}`);

        if (!id) {
            return null;
        }

        const pdf = await this.getPDFById(id);

        return pdf && pdf.status === PdfStatus.Completed ? pdf : null;
    }

    async countPDFsByStatus(): Promise<Record<string, number>> {
        const statuses: Pdf['status'][] = [PdfStatus.Pending, PdfStatus.Processing, PdfStatus.Completed, PdfStatus.Failed];
        const counts: Record<string, number> = {};

        for (const status of statuses) {
            counts[status] = await this.client.scard(`pdfs:status:${status}`);
        }

        return counts;
    }

    private hashString(str: string): string {
        return require('crypto').createHash('md5').update(str).digest('hex');
    }
}