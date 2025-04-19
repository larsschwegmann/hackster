import sdk from "@/lib/spotify-sdk/ClientInstance";
import {PlaylistedTrack, Track} from "@spotify/web-api-ts-sdk";

export async function getAllPlaylistItems(playlistId: string) {
    let total = 1;
    const playlistItems: PlaylistedTrack<Track>[] = [];
    let offset = 0;
    while (playlistItems.length < total) {
        console.log(`Fetching playlist: offset ${offset}, limit: 50, total: ${total}, len: ${playlistItems.length}`)
        const newItems = await sdk.playlists.getPlaylistItems(playlistId, undefined, undefined, 50, offset);
        playlistItems.push(...newItems.items);
        total = newItems.total;
        offset += newItems.items.length;
    }
    return playlistItems;
}