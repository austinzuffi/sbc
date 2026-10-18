## Welcome to the README
Hi, you are cool and life is pretty tight.

The SBC Radio was built with React! It's a webapp that hits an endpoint that serves a .ogg media stream. It serves the stream endpoint to the client when a user selects the the tape for an endpoint on a UI and presses play.

Our goals for the application are to:
- add a server 
- send notifications when an SBC DJ is live-streaming
- Build a Genre explorer that uses Spotify to tell you what genres of music that you like. (Aaron)
- Become a mobile app?

with <3 Warlock and Bird

## link
live @ [softboys.club](https://softboys.club)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder with Vite.

### `npm run preview`

Serves the production build locally so you can check it before deploying.

## Deploying

The site is hosted on Cloudflare Workers as static assets (see `wrangler.jsonc`). Log in once with `npx wrangler login`, then run `npm run deploy` to build and upload `dist`.

The station URLs are baked in at build time from the `REACT_APP_*` variables in `.env`.


### `version history`

* v0.0.1 : Icecast Server deployed, hosting a test station.
* v0.0.2 : Icecast client deployed, hosting test station.
* v0.0.3 : Station #1 added to server
* v0.0.4 : Alpha UI deployed to test environment
* v0.0.5 : Alpha UI renders variable number of stations
* v0.0.6 : Alpha UI plays, pauses, renders playing animation.
* v0.0.7 : Deploy Alpha UI on Netlify
* V0.0.8 : SSL encryption for main server route, change URL endpoint for media data
* v0.0.9 : Update favicon icons
* v0.1.0 : Deploy Beta UI, cassettes and radio in test environment
* v0.1.1 : Mobile and Desktop friendly UI render
* v0.1.2 : add version number to UI, Deploy Beta UI to Netlify
* v0.1.3 : Add SSL encryption to all routes, all the way home
* v0.1.4 : Used the site for a fundraiser!
* v0.1.5 : Imagine a disco ball...
* v0.2.0 : Moved from Create React App to Vite, upgraded to React 19
