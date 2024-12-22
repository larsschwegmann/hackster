"use client";
import sdk from "@/lib/spotify-sdk/ClientInstance";
import { useSession, signOut, signIn } from 'next-auth/react';


export default function Home() {

  const session = useSession();

  // function playFromSpotify() {
  //   const sdk = SpotifyApi.withUserAuthorization(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!, "http://localhost:3000/spotify_redirect", ["user-modify-playback-state"]);
  //   sdk.authenticate().then(() => {
  //     console.log("Authenticated");
  //   });
  //   // sdk.search("Never Gonna Give You Up", ["track"]).then((response) => {
  //   //   console.log(response)
  //   // });
  // }

  if (!session || session.status !== "authenticated") {
    return (
      <div>
        <h1>Spotify Web API Typescript SDK in Next.js</h1>
        <button onClick={() => signIn("spotify")}>Sign in with Spotify</button>
      </div>
    );
  }

  async function play() {

  }

  return (
    <div>
      <p>Logged in as {session.data.user?.name}</p>
      <button onClick={() => signOut()}>Sign out</button>

      <br/>
      <br/>

      <button onClick={async () => {
        const devices = await sdk.player.getAvailableDevices()
        const iphone = devices.devices.find(device => device.name === "iPhone")
        const searchResult = await sdk.search("Suffer Well", ["track"])
        const track = searchResult.tracks.items[0]
        await sdk.player.startResumePlayback(iphone!.id!, undefined, [track.uri])
      }}>Play a great song</button>
    </div>
  );
}