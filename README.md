Hi, you are cool and life is pretty tight.

# Soft Boys Club Radio

[softboys.club](https://softboys.club) is a small internet radio station run by friends. The page is a radio and a shelf of cassette tapes. Each tape is a station that is on the air right now. Put a tape in the radio, press play, and you're listening live.

It has been on the air since February 2020. It was built by Warlock and Bird, has carried live DJ sets and a fundraiser, and runs on its own stream server rather than someone else's platform. It's a hobby project: no ads, no accounts, nothing to install.

## Contents

- [The radio](#the-radio)
- [Pioneer, the archive](#pioneer-the-archive)
- [How it works](#how-it-works)
- [For reference](#for-reference): running, deploying and version history

## The radio

**Tapes are stations.** The shelf shows one cassette for every station that is broadcasting. When a DJ goes live a new tape appears, and when a station stops its tape goes away. The list refreshes every 10 seconds, so there's no need to reload the page.

**Loading a tape.** Drag a tape into the slot on the radio, or tap it. Enter or Space works from the keyboard. Eject hands the tape back.

**It's always live.** Play opens a fresh connection each time, so after a pause you hear what is on now and not where you left off.

**It reconnects by itself.** If the stream drops because the DJ's connection hiccuped, the server restarted or your phone lost signal, the radio keeps retrying until it's back. If a station goes off the air while its tape is loaded, the tape stays in and the radio keeps trying to tune back in.

**Now playing.** The radio shows the song title the station sends. The title and play/pause also appear on your phone's lock screen and work from headphone buttons.

**Volume.** The wheel on the right side of the radio goes from 0 to 11. Push its edge up or down, scroll over it, or use the arrow keys once it's selected. It's remembered for next time. (iPhones and iPads use their own volume buttons instead.)

**The disco ball.** It comes down when a tape is loaded and spins while the music plays.

**The TV.** On wide screens there's a television beside the radio, and stations that send video show up on it as channels. Power turns it on, the CH knob changes channel, and it starts muted so it doesn't talk over the radio. Double-click the picture for full screen.

**Colors.** Four themes: classic, walnut, shore and jelly (clear plastic). On a computer, pick one with the crayons under the badge in the corner. On a phone, tap `theme:` in the footer. Your pick is remembered.

**The portal.** The small tilted window in the top corner is a doorway to Pioneer.

## Pioneer, the archive

[pioneer.softboys.club](https://pioneer.softboys.club) is the club's music archive: a library of albums with a player that looks like a terminal. It needs a login, so it's for members. This is what's behind the door.

### Browsing and playing

- Albums are listed newest first. `[>]` next to an album plays it without leaving the page.
- Open an album to see its tracks and click one to play it. An album split into `CD 1`, `CD 2` and so on plays as one album.
- Music keeps playing while you browse. If you reload or come back later, it picks up at the same track and position.
- If your connection drops mid-song, the song resumes where it stopped instead of skipping ahead.
- `[dl]` downloads a song.

### What plays next

- An album's own tracks always play in order.
- When an album ends, a random album follows. An album isn't picked again until the others have had a turn.
- `[ shuffle albums ]` starts a random album when nothing is playing. If music is already playing, it opens a random album's page and leaves the music alone, so you can look before you commit.
- `[ queue ]` on an album's page lines that album up after the current one. Press it again to take it back out.
- Narrow the list with a genre tag or a search before you start an album, and the random albums that follow come only from that narrowed list.

### Genre tags

Every album gets a genre tag, and a row of tags at the top filters the list. Tags come from the music files. When a file's tag is missing or vague ("Electronic", "Pop"), Discogs is asked for a better one.

### Sharing a song

`[url]` next to a song copies a short link to it (on a phone it opens the share sheet). Pasted into a chat, the link shows a preview with the song title, artist, album, year and cover. Opening it shows the album and plays that song, after the login.

### Even volume

Every song's loudness is measured ahead of time, and the player turns loud songs down to match. Going from a quiet 1970s record to a loud new one doesn't make you jump. An album played in order is turned down as a whole, so its quiet songs stay quieter than its loud ones. `[lvl]` turns this off. iPhones and iPads don't let a web page set the volume, so they play everything as it is.

### Colors

Three themes (green, walnut and shore), each with a dark version. `[inv]` flips to it.

### Keys

| Key | Does |
|---|---|
| `space` | play / pause |
| `←` `→` | back / forward 10 seconds |
| `shift` + `←` `→` | previous / next track |
| `/` | search |
| `t` | next theme |
| `i` | invert colors |
| `n` | volume leveling on / off |

## How it works

- **This repo is the front page**: a React app built with Vite and served as static files from Cloudflare Workers. There's no backend of its own.
- **The stations come from [Icecast](https://icecast.org)**, an open-source stream server the club runs itself. The page asks Icecast which stations are live (`/status-json.xsl`) and makes a tape for each one. Playing a tape points an ordinary `<audio>` element at that station's stream.
- **Live DJs** connect to Icecast from their own computers with any broadcasting software.
- **The auto DJ** fills the air between live sets. It's a shell script around `ffmpeg` that shuffles a folder of music into a station around the clock. Songs play back to back with no gap, quiet and loud records are evened out, and each song's title is sent along so the radio can show it.
- **Pioneer** is a plain nginx folder listing with a theme on top: one stylesheet and one script turn the file table into the player. A few scripts run on the server each night to convert new albums to MP3, find covers, look up genres, make the short links and measure loudness. With JavaScript off, the plain file listing still works.

The original project is [joelkperkins/Soft-Boys-Club-Radio](https://github.com/joelkperkins/Soft-Boys-Club-Radio).

with <3 Warlock and Bird

---

## For reference

Notes for whoever is working on the site.

### Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

#### `npm run build`

Builds the app for production to the `dist` folder with Vite.

#### `npm run preview`

Serves the production build locally so you can check it before deploying.

### Deploying

The site is hosted on Cloudflare Workers as static assets (see `wrangler.jsonc`). Pushing to `master` deploys it. To deploy by hand, log in once with `npx wrangler login`, then run `npm run deploy` to build and upload `dist`.

The station URLs are baked in at build time from the `REACT_APP_*` variables in `.env`.

### Themes

The theme names are in `THEMES` at the top of `src/App.jsx` and the colors are in `src/index.css`. A theme that changes more than colors also has a stylesheet in `src/themes`, which restyles the parts of the page by their `sbc-` class names. Each theme needs a crayon in `src/Components/Crayons.component.jsx`.

### Goals from 2020

- add a server
- send notifications when an SBC DJ is live-streaming
- Build a Genre explorer that uses Spotify to tell you what genres of music that you like. (Aaron)
- Become a mobile app?

### Version history

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
* v0.2.1 : Stream reconnects by itself, tapes load with a tap, live station list, lock-screen controls, volume
