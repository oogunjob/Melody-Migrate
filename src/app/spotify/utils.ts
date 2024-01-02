import { SpotifyApi, Tracks } from "@spotify/web-api-ts-sdk";

const baseUrl = "https://api.spotify.com/v1/search";
const token = "";


export async function SearchForSong(artist: string, songTitle: string, albumTitle: string) {
    let originalQuery = `${artist} ${songTitle} ${albumTitle}`;
    let encodedQuery = encodeURIComponent(originalQuery);

    let api_url = baseUrl + `?q=${encodedQuery}&type=track&limit=3`

    const tracks: Tracks = await fetch(api_url, { headers: { 'Authorization': `Bearer ${token}` }}).then(
        (response => response.json()));

    return tracks;
}

export async function AddSongsToPlaylist(ids: string[]){
    const url = "https://api.spotify.com/v1/users/smedjan/playlists";

    const body = {
        name: "New Playlist",
        description: "New playlist description",
        public: false
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    }).then(response => {
        var res = response.json()
        return res;
    });

    console.log(response)
}