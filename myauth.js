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
            .catch(function (err){
                console.log("err")
            })
        }
        const token_info = JSON.parse(fs.readFileSync('token.json'))
        return validateAccessToken(token_info);
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
            fs.writeFile('token.json', JSON.stringify(json), (err) => {
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
        fs.writeFile('ngrok.json', JSON.stringify(secureTunnel.public_url), (err) =>{
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
exports.checkTokenFileExists = checkTokenFileExists;
exports.generateNgrokUrl = generateNgrokUrl;

/*
function checkStatus(res) {
	if (res.ok) {
		// res.status >= 200 && res.status < 300
		return res;
	} else {
		throw MyCustomError(res.statusText);
	}
}
*/