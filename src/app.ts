import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({ status: 'Service is working like a charm 😎' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;