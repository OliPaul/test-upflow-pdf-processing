import express from 'express';
import path from 'path';
import pdfRoutes from "./routes/pdfRoutes";
import webhookSimulationRoutes from "./routes/webhookSimulationRoutes";

const app = express();

app.use(express.json());

app.use('/api', [pdfRoutes, webhookSimulationRoutes]);

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({ status: 'Service is working like a charm 😎' });
});

// Expose the storage directories
app.use('/pdfs', express.static(path.join(process.cwd(), 'storage', 'pdfs')));
app.use('/thumbnails', express.static(path.join(process.cwd(), 'storage', 'thumbnails')));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;