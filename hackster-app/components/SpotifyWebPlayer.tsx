"use-client";
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import { Play, Pause } from "lucide-react";

type SpotifyWebPlayerProps = {
    setDeviceId: (deviceId?: string) => void,
    hideUI: boolean
    
    setSpotifyPlayer: (player?: Spotify.Player) => void,
}

export default function SpotifyWebPlayer({
    setDeviceId,
    hideUI,
    setSpotifyPlayer,
}: SpotifyWebPlayerProps) {
    const {data: sessionData} = useSession();

    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [player, setPlayer] = useState<Spotify.Player | undefined>();

    useEffect(() => {
        setSpotifyPlayer(player);
    }, [player, setSpotifyPlayer]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log("[SpotifyPlayback] SDK is ready");
            const player = new window.Spotify.Player({
                name: 'hackster',
                getOAuthToken: cb => { cb(sessionData!.user.access_token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('[SpotifyPlayback] Player ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('[SpotifyPlayback] Device ID has gone offline', device_id);
                setDeviceId(undefined);
            });

            player.addListener('player_state_changed', ( state => {
                console.log("[SpotifyPlayback] player state changed", state)
                if (!state) {
                    setActive(false);
                    return;
                } else {
                    setActive(true);
                }

                setPaused(state.paused);
                setActive(true);
            }));

            player.addListener('autoplay_failed', () => {
                console.error("[SpotifyPlayback] autoplay failed");
            });

            player.addListener('initialization_error', ({ message }) => {
                console.error(message);
            });
          
            player.addListener('authentication_error', ({ message }) => {
                console.error(message);
            });
          
            player.addListener('account_error', ({ message }) => {
                console.error(message);
            });

            player.addListener('playback_error', ({ message }) => {
                console.error(message);
            });

            player.connect();
        };        
    }, [sessionData, setDeviceId])

    if (!hideUI)  {
        return (
            <div className="flex justify-center">
                { isActive ? <button className="btn btn-circle h-36 w-36" onClick={async () => player?.togglePlay()}>{isPaused ? <Play size={128}/> : <Pause size={128}/>}</button> : null}            
            </div>
        )
    } else {
        return undefined;
    }
    
}