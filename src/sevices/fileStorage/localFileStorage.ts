
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { Readable } from 'stream';
import {FileStorage} from "../../models/fileStorage";

export class LocalFileStorage implements FileStorage {
    private readonly pdfDir: string;
    private readonly thumbnailDir: string;

    constructor() {
        this.pdfDir = path.join(process.cwd(), 'storage', 'pdfs');
        this.thumbnailDir = path.join(process.cwd(), 'storage', 'thumbnails');
    }

    async saveFileFromUrl(url: string, filePath: string): Promise<void> {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 30000, // 30 secondes timeout
        });

        const writer = fs.createWriteStream(filePath);

        return new Promise<void>((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', () => resolve());
            writer.on('error', reject);
        });
    }

    getFilePath(fileName: string, type: 'pdf' | 'thumbnail'): string {
        const dir = type === 'pdf' ? this.pdfDir : this.thumbnailDir;
        return path.join(dir, fileName);
    }

    getFileUrl(fileName: string, type: 'pdf' | 'thumbnail', baseUrl = ''): string {
        const urlPath = type === 'pdf' ? 'pdfs' : 'thumbnails';
        return `${baseUrl}/${urlPath}/${fileName}`;
    }

    async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
        await fs.promises.copyFile(sourcePath, destinationPath);
    }

    async deleteFile(filePath: string): Promise<void> {
        if (await this.fileExists(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }

    async calculateFileHash(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);

            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    async getFileReadStream(filePath: string): Promise<Readable> {
        if (!(await this.fileExists(filePath))) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fs.createReadStream(filePath);
    }

    async ensureDirectoriesExist(): Promise<void> {
        await fs.promises.mkdir(this.pdfDir, { recursive: true });
        await fs.promises.mkdir(this.thumbnailDir, { recursive: true });
    }
}