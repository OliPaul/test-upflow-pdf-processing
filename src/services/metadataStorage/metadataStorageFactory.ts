import { InMemoryMetadataStorage } from './inMemoryMetadataStorage';
import { DbMetadataStorage } from './dbMetadataStorage';
import {MetadataStorage} from "../../models/metadataStorage";
import {RedisMetadataStorage} from "./redisMetadataStorage";

// We can add more types here if we want to support more storage types
export type MetadataStorageType = 'memory' | 'redis' | 'postgres' | 'mongodb';

export interface MetadataStorageOptions {
    connectionString?: string;
}

export class MetadataStorageFactory {
    private static instance: MetadataStorage;

    static getInstance(type: MetadataStorageType = 'memory', options?: MetadataStorageOptions): MetadataStorage {
        if (!MetadataStorageFactory.instance) {
            switch (type) {
                case 'memory':
                    MetadataStorageFactory.instance = new InMemoryMetadataStorage();
                    break;
                case 'redis':
                    MetadataStorageFactory.instance = new RedisMetadataStorage(
                        options?.connectionString || 'redis://localhost:6379'
                    );
                    break;
                case 'postgres':
                case 'mongodb':
                    MetadataStorageFactory.instance = new DbMetadataStorage(
                        type,
                        options?.connectionString || 'default-connection-string'
                    );
                    break;
                default:
                    throw new Error(`Unsupported metadata storage type: ${type}`);
            }
        }

        return MetadataStorageFactory.instance;
    }
}