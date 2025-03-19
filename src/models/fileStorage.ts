import { Readable } from 'stream';

export interface FileStorage {
    saveFileFromUrl(url: string, filePath: string): Promise<void>;
    getFilePath(fileName: string, type: 'pdf' | 'thumbnail'): string;
    getFileUrl(fileName: string, type: 'pdf' | 'thumbnail', baseUrl?: string): string;
    fileExists(filePath: string): Promise<boolean>;
    copyFile(sourcePath: string, destinationPath: string): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    calculateFileHash(filePath: string): Promise<string>;
    getFileReadStream(filePath: string): Promise<Readable>;
    ensureDirectoriesExist(): Promise<void>;
}