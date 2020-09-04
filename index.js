const auth = require('./myauth');
const fetch = require('node-fetch');
const fs = require('fs');
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process')

const app = express()
const port = 3000


    auth.checkTokenFileExists()
    auth.generateNgrokUrl()

    setTimeout(() => {auth.getHooked()}, 1000);




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
      exec('python Christmas_Lights.py')
  }
  else {
    res.status(400).end();
    console.log("Signature does not match hash.");
  }
})


