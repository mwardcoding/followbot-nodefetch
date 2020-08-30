const auth = require('./myauth');
const fetch = require('node-fetch');
const fs = require('fs');
const express = require('express');
const crypto = require('crypto');

const app = express()
const port = 3000

auth.checkTokenFileExists();
const token_info = JSON.parse(fs.readFileSync('token.json'));
const user_id = 568825210


const body = {
  'hub.callback': 'http://09c071595507.ngrok.io',
  'hub.mode': 'subscribe',
  'hub.topic': `https://api.twitch.tv/helix/users/follows?first=1&from_id=${user_id}`,
  'hub.lease_seconds': '360',
  'hub.secret': 'uked02Kj0BGXS4BeNJPeeyQ42LPfIam2b162K9qKiEdAXa3oYvrnUivEDSD7ecH9' 
}

fetch('https://api.twitch.tv/helix/webhooks/hub', {
  method: 'POST',
  body:   JSON.stringify(body),
  headers: {'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${token_info.access_token}`,
            'Content-Type': 'application/json'},
}).then(console.log('Webhooked'))
.catch(err => console.error(err));

app.use(express.json());

app.listen(port, () => {
  console.log(`${port}`)
})

app.get('/', (req, res) => {
  res.status(200).send(req.query['hub.challenge']);
  console.log("GET requested");
})

app.post('/', function (req, res) {
  let xHubSig = req.headers['x-hub-signature'].split("=");
  let hash = crypto.createHmac('sha256', process.env.HUB_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
  if (hash == xHubSig[1]) {
      res.status(200).end();
      console.log("POST requested");
      console.log(req.body);
  }
  else {
    res.status(400).end();
    console.log("Signature does not match hash.");
  }
})


