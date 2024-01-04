import { AppleMusicApi } from "../types/apple-music-api";
import { BaseProvider } from "../types/sources";

// TODO: Rename this or make it look better
interface Song {
    artistName: string;
    songTitle: string;
    albumTitle: string;
    contentRating: string;
}

export class AppleMusicAPI implements BaseProvider {
    name = "Apple Music";
    icon = "apple";
    baseUrl: string = 'https://api.music.apple.com';

    private instance: MusicKit.MusicKitInstance | null;
    private musicKitToken: string | null = null;

    constructor(instance: MusicKit.MusicKitInstance) {
      this.instance = instance;
      this.musicKitToken = instance?.musicUserToken;
    }

    /**
     * Retrieves header for Apple Music API requests
     * @returns header for creating requests to Apple Music API
     */
    private GetHeader()
    {
        return {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN ?? ""}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Music-User-Token': this.musicKitToken ?? ""
        };
    }

    private CreatePlaylistBody(playlistName: string, trackIds: string[], description: string = ""): any {
        const mappedSongs: {id: string, type: string}[] = trackIds.map(id => ({ id, type: "songs" }));

        return {
            "attributes": {
                "name": playlistName,
                "description": description
            },
            "relationships": {
                "tracks": {
                    "data": mappedSongs
                }
            }
        }
    }

    LogIn = async (): Promise<Boolean> => {
        let success = false;
        await this.instance?.authorize().then((token: any) => { this.musicKitToken = token; success = true });

        return success;
    };

    /**
     * Logs user out of Apple Music
     */
    public async LogOut(): Promise<void> {
        await this.instance?.unauthorize();
    }

    /**
     * Fetch all songs from the given playlist
     * @param id Apple Music playlist id
     * @returns array of songs
     */
    public async FetchSongsFromPlaylist(id: string): Promise<AppleMusicApi.Song[]>
    {
        // TODO: Change the data type from any
        const songs: any[] = [];

        let api_url = this.baseUrl + `/v1/me/library/playlists/${id}/tracks`

        // Fetch all songs in the selected playlist
        while (api_url) {
            try {
                // Fetch the first 25 songs in the playlist
                // TODO: Will need to prepare for 429 errors
                const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                songs.push(...response.data);

                // Update url to include new offset
                console.log(response.next)
                api_url = response.next ? this.baseUrl + response.next : '';

            } catch (error: any) {
                console.error(`Error: ${error.message}`);
                break;
            }
        }

        return songs;
    }

    /**
     * Fetch all songs in the user's library
     * @returns array of songs
     */
    public async FetchSongsFromLibrary(): Promise<AppleMusicApi.Song[]> {
        const all_songs: AppleMusicApi.Song[] = [];

        let api_url = this.baseUrl + '/v1/me/library/songs?offset=0';

        // Time how long it takes to retrieve all songs in user library
        var startTime = performance.now();
        console.log(`Fetching all songs in user library.`);

        // Fetch all songs in the user's library
        while (api_url) {
            try {
                // Fetch the first 25 songs in the user's library
                const response: AppleMusicApi.Relationship<AppleMusicApi.Song> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                all_songs.push(...response.data);

                // Update url to include new offset
                api_url = response.next ? this.baseUrl + response.next : '';

            } catch (error: any) {
                console.error(`Error: ${error.message}`);
                break;
            }
        }

        return all_songs;
    }

    private FindBestMatch(songs: AppleMusicApi.Song[], criteria: Song): string {
        let bestMatchId: string = "";
        let bestMatchScore = -1;

        for (const song of songs)
        {
            let currentScore = 0;

            if (song.attributes?.name === criteria.songTitle) {
                currentScore += 4;
            }
            if (song.attributes?.artistName === criteria.artistName) {
                currentScore += 3;
            } if (song.attributes?.contentRating === criteria.contentRating) {
                currentScore += 2;
            } if (song.attributes?.albumName === criteria.albumTitle) {
                currentScore += 1;
            }

            if (currentScore > bestMatchScore) {
                bestMatchScore = currentScore;
                bestMatchId = song.id;
            }
        }

        const song = songs.find(song => song.id === bestMatchId);
        if (song !== undefined) {
            // console.log(`Found best match for ${criteria.songTitle} by ${criteria.artistName} with a score of ${bestMatchScore}: ${foundObject.attributes?.name} by ${foundObject.attributes?.artistName}`);
        }
        else {
            console.log(`Could not find best match for ${criteria.songTitle} by ${criteria.artistName}.`);
        }

        return bestMatchId;
    }

    // TODO: Need to account for potential 429 errors
    SearchForSong = async (songTitle: string, artist: string, albumTitle: string, explicit: boolean = true): Promise<string> => {
        const encodedQuery = encodeURIComponent(`${songTitle} ${artist} ${albumTitle}`);
        let api_url = this.baseUrl + `/v1/catalog/us/search?types=songs&term=${encodedQuery}&limit=3`;

        let songId: string = "";

        try {
            // Fetch the first 25 playlists in the user's library
            const response: AppleMusicApi.AppleMusicSearchResult = await fetch(api_url, {
                headers: this.GetHeader(),
            }).then(response => response.json()).then(data => { return data });

            // TODO: NEED TO FIGURE OUT HOW TO HANDLE THE CASE WHERE THERE ARE NO RESULTS
            // THE RESULTS SHOW UP ON APPLE MUSIC BUT NOT IN THE API RESPONSE
            // MAY NEED TO IMPROVE THE SEARCH QUERY
            if (response.results.songs && response.results.songs.data !== undefined) {
                songId = this.FindBestMatch(response.results.songs.data, { artistName: artist, songTitle: songTitle, albumTitle: albumTitle, contentRating: explicit ? "explicit" : "clean" })
            }
            else{
                console.log(response.results.songs)
                console.log(encodedQuery)
                console.log("Could not find song: " + songTitle + " by " + artist + " on Apple Music.");
            }

        } catch (error: any) {
            console.error(`Error: ${error.message}`);
        }

        console.log(songId)

        return songId;
    }

    FetchPlaylists = async (): Promise<any[]> => {
        const all_playlists: AppleMusicApi.Playlist[] = [];

        let api_url = this.baseUrl + '/v1/me/library/playlists?offset=0';

        // Fetch all playlists in the user's library
        while (api_url) {
            try {
                // Fetch the first 25 playlists in the user's library
                const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                all_playlists.push(...response.data);

                // Update url to include new offset
                api_url = response.next ? this.baseUrl + response.next : '';

            } catch (error: any) {
                console.error(`Error: ${error.message}`);
                break;
            }
        }

        return all_playlists;
    }

    GetPlaylistName = (playlist: any): string => {
        return playlist?.attributes?.name;
    }

    TransferPlaylistsToAppleMusic = async (destination: BaseProvider, playlists: any[]): Promise<void> => {
        throw new Error("Cannot transfer to Apple Music from Apple Music provider.");
    }

    /**
     * Transfers the playlists from Apple Music to Spotify
     * @param destination Spotify provider that the playlists will be transfered to
     * @param playlists playlists to transfer
     */
    TransferPlaylistsToSpotify = async (destination: BaseProvider, playlists: any[]): Promise<void> => {
        const appleMusicPlaylists: AppleMusicApi.Playlist[] = playlists as AppleMusicApi.Playlist[];

        for (const playlist of appleMusicPlaylists)
        {
            // Get all tracks in the playlist
            // Need to make sure that I get all of the tracks in the playlist, currently only gets the first 50 tracks
            const tracks = await this.FetchSongsFromPlaylist(playlist.id);

            // Search for each track in the playlist on Spotify
            const spotifyTracksIds: string[] = [];
            for (const track of tracks)
            {
                const songId = await destination.SearchForSong(track.attributes?.name, track.attributes?.artistName, track.attributes?.albumName, track.attributes?.contentRating === "explicit");

                // Push the song id to the array if it was found on Spotify
                if (songId)
                {
                    spotifyTracksIds.push(songId);
                }
            }

            // Create the playlist on Spotify
            const playlistId = await destination.CreatePlaylist(playlist.attributes?.name ?? "", spotifyTracksIds, playlist.attributes?.description?.short ?? "");
            console.log("Playlist successfully created: " + playlistId); // TODO: Remove this
        }
    }

    // Need to add this method to the interface, all providers should have this method
    CreatePlaylist = async (playlistName: string, tracks: string[], description: string = ""): Promise<string> => {
        let api_url = this.baseUrl + '/v1/me/library/playlists';

        const response: AppleMusicApi.PlaylistResponse = await fetch(api_url, {
            headers: this.GetHeader(),
            method: "POST",
            body: JSON.stringify(this.CreatePlaylistBody(playlistName, tracks, description)),
            mode: 'cors'
        }).then((response) => { return response.json()
        }).catch((error) => {
            console.log(error)
        })

        return response.data[0].id;
    }
}
