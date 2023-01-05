import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import colorScheme from './colorScheme'
import iColorResponse from './interfaces/iColorResponse';
import iSlackResponse from './interfaces/iSlackResponse';
import { WebClient } from '@slack/web-api';

dotenv.config();
const app: Express = express();
const client: WebClient = new WebClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT, () => { console.log('Express server listening on port %s in %s mode', process.env.PORT, app.settings.env); });

app.get('/', (_, res: Response) => {
    res.send('running Node and Express');
});

app.post('/', (req: Request, res: Response) => {
    colorScheme(req.body.text, function (colors: iColorResponse[]) {
        var slackResponse: iSlackResponse = {
            response_type: 'in_channel', // public to the channel 
            text: colors.join(',')
        };
        res.json(slackResponse);
    })
});

app.get('/slack/auth', async (_, res: Response) => {
    const scopes = 'identity.basic,identity.email';
    const redirect_url = process.env.HOST + '/auth/slack/callback';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${scopes}&redirect_uri=${redirect_url}`;
    res.status(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(`
            <html><body>
            <a href="${url}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
            </body></html>
        `);
});

app.get('/slack/auth/callback', async (req: Request, res: Response) => {
    try {
        await client.oauth.v2.access({
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code: (req.query as any).code
        });
        res.status(200).send(`<html><body><p>color schemer was installed successfully, you can now use the / slash command</p></body></html>`);
    } catch (err) {
        res.status(500).send(`<html><body><p>Something went wrong!</p><p>${JSON.stringify(err)}</p>`);
    }
});