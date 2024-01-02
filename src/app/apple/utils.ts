import { AppleMusicApi } from "../types/apple-music-api";

const baseUrl = 'https://api.music.apple.com/v1';

const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Music-User-Token': `${process.env.NEXT_PUBLIC_MUSIC_USER_TOKEN}`
}


export async function FetchSongsFromPlaylist(id: string): Promise<AppleMusicApi.Song[]> {
    const all_songs: any[] = [];

    let api_url = baseUrl + `/me/library/playlists/${id}/tracks`

    // Time how long it takes to retrieve all songs in the selected playlist
    var startTime = performance.now();
    console.log(`Fetching all songs in playlist ${id}.`);

    // Fetch all songs in the selected playlist
    while (api_url) {
        try {
            // Fetch the first 25 songs in the playlist
            const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                headers: headers
            }).then(response => response.json()).then(data => { return data });

            all_songs.push(...response.data);

            // Update url to include new offset
            api_url = response.next ? baseUrl + response.next : '';

        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            break;
        }

        api_url = "";
    }

    var endTime = performance.now();
    console.log(`It took ${endTime - startTime} milliseconds to fetch ${all_songs.length} songs.`);

    return all_songs;
}

export async function FetchPlaylists(): Promise<AppleMusicApi.Playlist[]> {
    const all_playlists: AppleMusicApi.Playlist[] = [];

    let api_url = baseUrl + '/me/library/playlists?offset=0';

    // Time how long it takes to retrieve all songs in user library
    var startTime = performance.now();
    console.log(`Fetching all playlists in user library.`);

    // Fetch all playlists in the user's library
    while (api_url) {
        try {
            // Fetch the first 25 playlists in the user's library
            const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                headers: headers
            }).then(response => response.json()).then(data => { return data });

            all_playlists.push(...response.data);

            // Update url to include new offset
            api_url = response.next ? baseUrl + response.next : '';

        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            break;
        }
    }

    var endTime = performance.now();
    console.log(`It took ${endTime - startTime} milliseconds to fetch ${all_playlists.length} playlists.`);

    return all_playlists;
}

export async function FetchLibrary() {
    const all_songs: AppleMusicApi.Song[] = [];

    let api_url = baseUrl + '/me/library/songs?offset=0';

    // Time how long it takes to retrieve all songs in user library
    var startTime = performance.now();
    console.log(`Fetching all songs in user library.`);

    // Fetch all songs in the user's library
    while (api_url) {
        try {
            // Fetch the first 25 songs in the user's library
            const response: AppleMusicApi.Relationship<AppleMusicApi.Song> = await fetch(api_url, {
                headers: headers
            }).then(response => response.json()).then(data => { return data });

            all_songs.push(...response.data);

            // Update url to include new offset
            api_url = response.next ? baseUrl + response.next : '';

        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            break;
        }
    }

    var endTime = performance.now();
    console.log(`It took ${endTime - startTime} milliseconds to fetch ${all_songs.length} songs.`);
}