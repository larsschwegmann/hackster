"use client";
import {Pause, Play} from "lucide-react";
import sdk from "@/lib/spotify-sdk/ClientInstance";
import {useEffect, useState} from "react";


type SpotifyConnectPlayerProps = {
    hideUI: boolean,
    spotifyDeviceId: string
}

export default function SpotifyConnectPlayer({ hideUI, spotifyDeviceId }: SpotifyConnectPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            const playbackState = await sdk.player.getPlaybackState();
            if (playbackState) {
                setIsPlaying(playbackState.is_playing);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    async function play() {
        await sdk.player.startResumePlayback(spotifyDeviceId);
    }

    async function pause() {
        await sdk.player.pausePlayback(spotifyDeviceId);
    }

    if (!hideUI) {
        return (
            <div className="flex justify-center">
                <button className="btn btn-circle h-36 w-36" onClick={async () => isPlaying ? await pause() : await play()}>{!isPlaying ? <Play size={128}/> : <Pause size={128}/>}</button>
            </div>
        )
    } else {
        return <div></div>;
    }

}