import {FileStorageType} from "../services/fileStorage/fileStorageFactory";
import {MetadataStorageType} from "../services/metadataStorage/metadataStorageFactory";

export interface AppConfig {
    server: {
        port: number;
        host: string;
    };

    queue: {
        redis: {
            host: string;
            port: number;
        };
        concurrency: number;
    };

    fileStorage: {
        type: FileStorageType;
        options: any;
    };

    metadataStorage: {
        type: MetadataStorageType;
        options: any;
    };
}

const defaultConfig: AppConfig = {
    server: {
        port: Number(process.env.PORT) || 3000,
        host: process.env.HOST || 'localhost',
    },
    queue: {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        },
        concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
    },
    fileStorage: {
        type: (process.env.FILE_STORAGE_TYPE as FileStorageType) || 'local',
        options: {
            bucket: process.env.S3_BUCKET || 'pdf-microservice',
        },
    },
    metadataStorage: {
        type: (process.env.METADATA_STORAGE_TYPE as MetadataStorageType) || 'redis',
        options: {
            connectionString: process.env.DB_CONNECTION_STRING ||
                buildRedisUrl(
                    process.env.REDIS_HOST || 'localhost',
                    Number(process.env.REDIS_PORT) || 6379
                ),
        },
    },
};

function buildRedisUrl(host: string, port: number): string {
    return `redis://${host}:${port}`;
}

export function getConfig(): AppConfig {
    return defaultConfig;
}