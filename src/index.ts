import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';
import colorScheme from './colorScheme'
import iColorResponse from './interfaces/iColorResponse';
import iSlackResponse from './interfaces/iSlackResponse';

const client = new WebClient();
const app = express();
dotenv.config();

app.get('/', (_, res: Response) => {
    res.send('Yeehaw! Express and node are up and running');
});

app.get('/slack/auth', async (_, res: Response) => {
    const redirect = 'https://87b0-69-123-91-54.ngrok.io/auth/slack/callback';
    const scopes = 'identity.basic,identity.email';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${scopes}&redirect_uri=${redirect}`;
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
        const response = await client.oauth.v2.access({
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code: (req.query as any).code 
        });

        const identity = await client.users.identity({
            token: response.authed_user.access_token
        });
        res.status(200).send(`<html><body><p>Success! You are logged in with your slack account. Here are some details:</p><p>Response: ${JSON.stringify(response)}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`);
    } catch (err) {
        console.log(err);
        res.status(500).send(`<html><body><p>Sorry! Something went wrong</p><p>${JSON.stringify(err)}</p>`);
    }
});

app.post('/', (req: Request, res: Response) => {
    colorScheme(req.body.text, function (colors: iColorResponse[]) {
        var data: iSlackResponse = {
            response_type: 'in_channel',
            text: colors.join(',')
        };
        res.json(data);
    })
});

app.listen(3000, () => { console.log('Express server listening on port 3000 in %s mode', app.settings.env); });
