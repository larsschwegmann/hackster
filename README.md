# Hackster Game

This project is a NextJS-based reimplementation of the companion app of the [HITSTER board game](https://hitstergame.com/).
The original app signed me out of the Spotify session multiple times per game, so I decided to reimplement the app with additional features in my browser.

Added features:
- Create custom printable card sheets based on your own Spotify playlists
- Playback on any Spotify connect device in your account

Unfortunately, I cannot make a hosted version of this available publicly due to the [terms and conditions of the Spotify API](https://developer.spotify.com/policy#iii-some-prohibited-applications), which disallow Music Trivia games.
I have no idea how the HITSTER team got around that.
This application is for personal use and educational purposes only.

## Prerequisites

In order to run this, you will need a `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`, which you can obtain from the [Spotify Developer console](https://developer.spotify.com/).
You will also net to set `NEXAUTH_SECRET` and `NEXTAUTH_URL`.
You can supply these via environemnt variables or a `.env` file:

```
SPOTIFY_CLIENT_ID="1234567890"
SPOTIFY_CLIENT_SECRET="abcdefghijk"
NEXTAUTH_SECRET="random_string_for_nextauth"
NEXTAUTH_URL="https://<yourip>:3000"
```

The app needs to be hosted via https for the in-browser spotify player to work, as it requires browser DRM.
The next dev environment sets up an https server automatically.

## Building & Running

This is a pretty standard NextJS project. Run `npm i`, then run `npm run dev` for the dev environment and `npm run build` for the production build.
 
## License

This project [is released under the Creative-Commons CC-BY-NC 4.0 License](LICENSE) for the reasons stated above.