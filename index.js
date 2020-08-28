const url = require('url');
require('dotenv').config();
const auth = require('./myauth');

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

auth.checkTokenFileExists();


