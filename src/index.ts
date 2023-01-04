import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import http from "http"
import https from "https"
import fs from 'fs'
import { WebClient } from '@slack/web-api';

dotenv.config();

const app = express();
const client = new WebClient();

const credentials = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => console.log('http app is listening on port 3000.'));
httpsServer.listen(3443, () => console.log('https app is listening on port 3443.'));

app.get('/', (req: Request, res: Response) => {
    res.send('Yeehaw! Express and node are up and running');
});

