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
    }
}

export function getConfig(): AppConfig {
    return defaultConfig;
}