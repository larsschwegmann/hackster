import { z } from "zod";
import sdk from "@/lib/spotify-sdk/ClientInstance";

const HacksterPlaylistSchema = z.object({
    name: z.string(),
    spotifyURL: z.string()
})

const HitsterOriginalPlaylistSchema = HacksterPlaylistSchema.extend({
    playlistExtractionRegex: z.string()
})

export type HacksterPlaylist = z.infer<typeof HacksterPlaylistSchema>
export type HitsterOriginalPlaylist = z.infer<typeof HitsterOriginalPlaylistSchema>

function spotifyPlaylistIdFromURL(url: string): string {
    const re = new RegExp("^https://open.spotify.com/playlist/([a-zA-Z0-9]+)")
    const result = url.match(re)
    if (!result) {
        throw new Error("Invalid Spotify URL")
    }
    return result[1]
}

function spotifyPlaylistURIFromID(id: string): string {
    return `spotify:playlist:${id}`
}



export const histerPlaylists: HitsterOriginalPlaylist[] = [
    {
        "name": "HITSTER - Deutsch",
        "spotifyURL": "https://open.spotify.com/playlist/26zIHVncgI9HmHlgYWwnDi",
        "playlistExtractionRegex": "hitstergame.com/de/([0-9]{5})$",
    },
    {
        "name": "HISTER - Deutschland Guilty Pleasures",
        "spotifyURL": "https://open.spotify.com/playlist/2u0vgWYqU1TWVcDehJnZuN",
        "playlistExtractionRegex": "hitstergame.com/de/aaaa0015/([0-9]{5})$",
    }
]

async function getPlaylistItems(playlist: HitsterOriginalPlaylist) {
    const playlistId = spotifyPlaylistIdFromURL(playlist.spotifyURL)
    let items = [];
    let total = 0;
    let offset = 0;
    do {
        const page = await sdk.playlists.getPlaylistItems(playlistId, undefined, undefined, 50, offset);
        total = page.total;
        items.push(...page.items);
        offset += page.limit;
    } while (items.length < total)
    
    return items;
}

export async function decodeQRData(data: string) {
    // Check if spotify URI
    if (data.startsWith("spotify:track:")) {
        return data
    }

    // Check for Hister data
    const playlistMatch = histerPlaylists.find(playlist => {
        return data.match(playlist.playlistExtractionRegex)
    });
    if (playlistMatch) {
        const items = await getPlaylistItems(playlistMatch);
        const index = parseInt(data.match(playlistMatch.playlistExtractionRegex)![1])
        return items[index-1].track.uri;
    }
    console.error("Invalid QR Code");
}