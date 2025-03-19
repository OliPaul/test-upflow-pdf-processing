import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as pdfjs from 'pdfjs-dist';

export class ThumbnailService {

    async generateThumbnail(pdfPath: string, thumbnailPath: string): Promise<void> {
        const pdfjsLib = pdfjs;

        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const loadingTask = pdfjsLib.getDocument({ data });

        try {
            const pdfDocument = await loadingTask.promise;

            const page = await pdfDocument.getPage(1);

            const scale = 0.5;
            const viewport = page.getViewport({ scale });

            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

            await page.render({
                canvasContext: context,
                viewport,
            }).promise;


            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(thumbnailPath, buffer);
        } catch (error) {
            throw new Error(`Failed to generate thumbnail`);
        }
    }
}