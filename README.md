# Twitch Follow Bot

For my final project, I created a Node.JS app that calls out to the Twitch API and detects new followers via their WebSub interface. Upon successful acknowledgement of a follower, the app triggers a Raspberry Pi to flick on some christmas lights.

## Authentication

The first step in the followbot is to properly authenticate with the Twitch API. After navigating to the developer website, I obtained a client_id and client_secret which I stored in a .env file in my program.

I utilized the node-fetch module to call the appropriate API routes to obtain a new access token which is stored in a JSON file. Additionally, to prevent creation of a new token every time the app runs, the program makes a call to examine the existing auth token (which can stay valid for over a month) and check validity.

## Webhook Setup and Ngrok

The next step the application takes is to make a call out to the Twitch API and set up a webhook to listen for follower events. Here I had to provide:
- a callback URL 
- the topic I wanted to subscribe to (follow events)
- the amount of time I wanted to listen for events
- a secret to which would later be used to decode messages obtained from Twitch

As part of this step I needed a callback URL that could be accessed outside of my local network. For this I set up ngrok. Once ngrok provides a public URL, I added a call to fetch from my local env and store it to be leveraged by the API.

## Creating My Server

I utilized express to create a very simple server that would work with GET and POST requests.

The GET request is utilized to immediately respond with a 200 status code and a simple parameter provided by Twitch in the inital call to subscribe to events in order to establish the connection. At this point the startupLights.py program is started to show that a successful GET call was performed.

The POST request prints out the information received from Twitch after validating the post with a sha-256 hash. Additionally, it then runs a python script to kick off the GPIO event.

## GPIO
The Raspberry Pi has a very simple python script that tells one of the GPIO pins to turn on then triggering a relay which starts up the christmas lights. After 10 seconds this turns off and the lights go out.

## Start Up
As a final step, I changed the start up code on the raspberry pi to immediately boot an ngrok tunnel and then start up the program. This allows me to simply plug in the Raspberry Pi and have it run the whole program. 

## Follow Up
An areas I'd like to explore with this program are the ability to serve it publically, so multiple users can easily authenticate with a single website and gain access to follow events that can be easily leveraged on the Raspberry Pi.

Alongside this, I'd like to expand the functionality to leverage any and all events available by Twitch easily.

The final result would be a simple, personalized web interface that authenticates with twitch that can be leveraged to create very simple, real-world events that users can display when they stream.