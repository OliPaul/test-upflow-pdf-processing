import { LocalFileStorage } from './localFileStorage';
import { S3FileStorage } from './s3FileStorage';
import {FileStorage} from "../../models/fileStorage";

export type FileStorageType = 'local' | 's3';

export class FileStorageFactory {
    private static instance: FileStorage;

    static getInstance(type: FileStorageType = 'local', options?: any): FileStorage {
        if (!FileStorageFactory.instance) {
            switch (type) {
                case 'local':
                    FileStorageFactory.instance = new LocalFileStorage();
                    break;
                case 's3':
                    FileStorageFactory.instance = new S3FileStorage(options?.bucket);
                    break;
                default:
                    throw new Error(`Unsupported file storage type: ${type}`);
            }
        }

        return FileStorageFactory.instance;
    }
}