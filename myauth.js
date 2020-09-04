const fetch = require('node-fetch');
const fs = require('fs');
const url = require('url');
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const authURL = url.format({
  protocol: 'https',
  hostname: 'id.twitch.tv',
  pathname: '/oauth2/token',
  query: {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials',
  }
});

async function checkTokenFileExists() {
    if (!fs.existsSync('token.json')) {
        await generateAccessToken(authURL)        
    }
    else {
        const token_info = JSON.parse(fs.readFileSync('token.json'))
        return validateAccessToken(token_info);
    }
}

function validateAccessToken(token_info) {
    fetch('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {'Authorization': `OAuth ${token_info.access_token}`},
        })
    .then(res => res.json())
    .then(json => {if (json.expires_in < 5000) {
        generateAccessToken(authURL)
        }
        console.log(json);
    })
}

function generateAccessToken(url) {
    fetch(authURL, { method: 'POST'})
        .then(res => res.json())
        .then(json => {
            fs.writeFileSync('token.json', JSON.stringify(json), (err) => {
                if (err) throw err;
                console.log("Success.");
            })
        })
}

function generateNgrokUrl() {
    fetch('http://localhost:4040/api/tunnels')
    .then(res => res.json())
    .then(json => json.tunnels.find(tunnel => tunnel.proto === 'https'))
    .then(secureTunnel => {
        console.log(secureTunnel.public_url);
        fs.writeFileSync('ngrok.json', JSON.stringify(secureTunnel.public_url), (err) =>{
            if (err) throw err;
        });
    })
    .catch(err => {
        if (err.code === 'ECONNREFUSED') {
        return console.error("Looks like you're not running ngrok.")
        }
        console.error(err)
    })
}

function getHooked() {
    const user_id = 505063151

    const tokenInfo = JSON.parse(fs.readFileSync('token.json'));
    const ngrokInfo = JSON.parse(fs.readFileSync('ngrok.json'));
    

    const body = {
        'hub.callback': ngrokInfo,
        'hub.mode': 'subscribe',
        'hub.topic': `https://api.twitch.tv/helix/users/follows?first=1&to_id=${user_id}`,
        'hub.lease_seconds': '86400',
        'hub.secret': process.env.HUB_SECRET 
    }

    fetch('https://api.twitch.tv/helix/webhooks/hub', {
    method: 'POST',
    body:   JSON.stringify(body),
    headers: {'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${tokenInfo.access_token}`,
                'Content-Type': 'application/json'},
    }).then(console.log('Webhooked'))
    .catch(err => console.error(err));

}


exports.checkTokenFileExists = checkTokenFileExists;
exports.generateNgrokUrl = generateNgrokUrl;
exports.getHooked = getHooked;

