import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import colorScheme from './colorScheme'
import iColorResponse from './interfaces/iColorResponse';
import iSlackResponse from './interfaces/iSlackResponse';
import { WebClient } from '@slack/web-api';

dotenv.config();
const app: Express = express();
const client = new WebClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => { console.log('Express server listening on port 3000 in %s mode', app.settings.env); });

app.get('/', (req, res) => {
    res.send('Successfully setup and running Node and Express.');
});

app.post('/', (req: Request, res: Response) => {
    colorScheme(req.body.text, function (colors: iColorResponse[]) {
        var data: iSlackResponse = {
            response_type: 'in_channel', // public to the channel 
            text: colors.join(',')
        };
        res.json(data);
    })
});

app.get('/slack/auth', async (_, res) => {
    console.log(process.env.SLACK_CLIENT_ID)
    const scopes = 'identity.basic,identity.email';
    const redirect_url = 'https://87b0-69-123-91-54.ngrok.io/auth/slack/callback';
    //Here you build the url. You could also copy and paste it from the Manage Distribution page of your app.
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${scopes}&redirect_uri=${redirect_url}`;

    res.status(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(`
            <html><body>
            <a href="${url}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
            </body></html>
        `);
});

app.get('/slack/auth/callback', async (req, res) => {

    try {
        const response = await client.oauth.v2.access({
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code: (req.query as any).code 
        });

        const identity = await client.users.identity({
            token: response.authed_user.access_token
        });

        // At this point you can assume the user has logged in successfully with their account.
        res.status(200).send(`<html><body><p>You have successfully logged in with your slack account! Here are the details:</p><p>Response: ${JSON.stringify(response)}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`);
    } catch (eek) {
        console.log(eek);
        res.status(500).send(`<html><body><p>Something went wrong!</p><p>${JSON.stringify(eek)}</p>`);
    }
});