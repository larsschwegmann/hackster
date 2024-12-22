import sdk from "@/lib/spotify-sdk/ClientInstance";

export type HacksterPlaylist = {
    name: string,
    spotifyURL: string
}
export type HitsterOriginalPlaylist = HacksterPlaylist & {
    playlistExtractionRegex: string
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

function spotifyPlaylistIdFromURL(url: string): string {
    const re = new RegExp("^https://open.spotify.com/playlist/([a-zA-Z0-9]+)")
    const result = url.match(re)
    if (!result) {
        throw new Error("Invalid Spotify URL")
    }
    return result[1]
}


async function getPlaylistItemAt(playlist: HitsterOriginalPlaylist, index: number) {
    const playlistId = spotifyPlaylistIdFromURL(playlist.spotifyURL);
    const items = (await sdk.playlists.getPlaylistItems(playlistId, undefined, undefined, 1, index)).items;
    return items[0];
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
        //const items = await getPlaylistItems(playlistMatch);
        const index = parseInt(data.match(playlistMatch.playlistExtractionRegex)![1])
        return (await getPlaylistItemAt(playlistMatch, index-1)).track.uri;
    }
    console.error("Invalid QR Code");
}