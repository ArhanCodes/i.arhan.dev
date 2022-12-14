/**
 * @file displayAPI.ts
 */
import { Request, Response } from 'express';
import fs from 'fs';
import { resolve } from 'path';
import Config from '../Config';
import Database from '../db/Database';
import Logger from '../Logger';
import { getUploadByUID } from '../util';
const c = new Logger("API");

export default async function displayAPI(req: Request, res: Response) {
    try {
        const content = req.params.content.split('.')[0];
        if (!content) {
            res.status(400).send('No content specified');
            return;
        }
        const upload = await getUploadByUID(content);
        if (!upload) {
            res.status(404).send('Content not found');
            return;
        }
        const filePath = resolve(__dirname, `../../uploads/${upload.saveAs.name}`);
        if (!fs.existsSync(filePath)) {
            res.status(404).send('Content not found!');
            return;
        }
        c.log(`${req.originalUrl.split('?')[0]} requested by ${req.ip}`);
        // Update view count
        upload.views++;
        await Database.getInstance().update('uploads', { _id: upload._id }, upload);

        // Check if file is blacklisted
        if (upload.takedown.status) {
            res.status(451).send(upload.takedown.reason || "Content is unavailable");
        }

        res.setHeader('Content-Disposition', `attachment; filename="${upload.file.name}"`);
        res.sendFile(filePath);
    } catch (e) {
        c.error(e as unknown as Error);
        res.status(500).send(`An error has occured.`);
    }
}
