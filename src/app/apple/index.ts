import { AppleMusicApi } from "../types/apple-music-api";
import { BaseProvider, UserLibrary } from "../types/sources";

interface SongCriteria {
    artistName: string;
    songTitle: string;
    albumTitle: string;
    contentRating: string;
}

export class AppleMusicAPI implements BaseProvider {
    name = "Apple Music";
    icon = "apple_music_icon.png";
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
        // @ts-ignore
        await this.instance?.authorize().then((token: any) => { this.musicKitToken = token; success = true });

        console.log("Logged in to Apple Music")
        console.log(success)

        return success;
    };

    /**
     * Logs user out of Apple Music
     */
    public async LogOut(): Promise<void> {
        // @ts-ignore
        await this.instance?.unauthorize();
    }

    /**
     * Fetch all songs from the given playlist
     * @param id Apple Music playlist id
     * @returns array of songs
     */
    GetSongsFromPlaylist = async (playlistId: string): Promise<any[]> =>
    {
        const songs: AppleMusicApi.Song[] = [];

        if (playlistId === "library")
        {
            const library = await this.GetSongsFromLibrary();
            songs.push(...library);
            console.log(songs.length);
        }
        else
        {
            let api_url = this.baseUrl + `/v1/me/library/playlists/${playlistId}/tracks?limit=100`

            // Fetch all songs in the selected playlist
            while (api_url) {
                try {
                    // Get songs in the playlist
                    const response: AppleMusicApi.Relationship<AppleMusicApi.Song> = await fetch(api_url, {
                        headers: this.GetHeader()
                    }).then(response => response.json()).then(data => { return data });

                    songs.push(...response.data);

                    // Update url to include new offset
                    api_url = response.next ? this.baseUrl + response.next + '&limit=100' : '';

                } catch (error: any) {
                    console.error(`Error: ${error.message}`);
                    break;
                }
            }
        }

        return songs;
    }

    /**
     * Fetch all songs in the user's library
     * @returns array of songs
     */
    public async GetSongsFromLibrary(): Promise<AppleMusicApi.Song[]> {
        const songs: AppleMusicApi.Song[] = [];

        let api_url = this.baseUrl + '/v1/me/library/songs?limit=100';

        // Fetch all songs in the user's library
        while (api_url) {
            try {
                // Fetch the first 25 songs in the user's library
                const response: AppleMusicApi.Relationship<AppleMusicApi.Song> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                songs.push(...response.data);

                // Update url to include new offset
                api_url = response.next ? this.baseUrl + response.next + '&limit=100' : '';

            } catch (error: any) {
                console.error(`Error: ${error.message}`);
                break;
            }
        }

        return songs;
    }

    /**
     * Finds the best match for the song based on the criteria
     * @param songs array of songs to search through
     * @param criteria criteria to match against
     * @returns the id of the best match
     */
    private FindBestMatch(songs: AppleMusicApi.Song[], criteria: SongCriteria): string {
        let bestMatchId: string = "";
        let bestMatchScore = -1;

        for (const song of songs)
        {
            let currentScore = 0;

            // Score the matched song based on comparison to the criteria
            if (song.attributes?.name === criteria.songTitle) {
                currentScore += 4;
            }
            if (song.attributes?.artistName === criteria.artistName) {
                currentScore += 3;
            }
            if (song.attributes?.contentRating === criteria.contentRating) {
                currentScore += 2;
            }
            if (song.attributes?.albumName === criteria.albumTitle) {
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
    /**
     * Searches for a song on Apple Music
     * @param songTitle the title of the song
     * @param artist the artist of the song
     * @param albumTitle the title of the album
     * @param explicit whether or not the song is explicit
     * @returns the id of the song if found, empty string otherwise
     */
    SearchForSong = async (songTitle: string, artist: string, albumTitle: string, explicit: boolean = true): Promise<string> => {
        const encodedQuery = encodeURIComponent(`${songTitle} ${artist} ${albumTitle}`);
        let api_url = this.baseUrl + `/v1/catalog/us/search?types=songs&term=${encodedQuery}&limit=3`;

        let songId: string = "";

        try {
            // Fetch the first 25 playlists in the user's library
            const response: AppleMusicApi.AppleMusicSearchResult = await fetch(api_url, {
                headers: this.GetHeader(),
            }).then(response => response.json()).then(data => { return data });

            // Find the best match for the song if it exists
            if (response.results.songs && response.results.songs.data !== undefined) {
                songId = this.FindBestMatch(response.results.songs.data, { artistName: artist, songTitle: songTitle, albumTitle: albumTitle, contentRating: explicit ? "explicit" : "clean" })
            }
            else{
                console.log("Could not find song: " + songTitle + " by " + artist + " on Apple Music.");
            }

        } catch (error: any) {
            console.error(`Error: ${error.message}`);
        }

        return songId;
    }

    /**
     * Gets all the playlists from the user's Apple Music account
     * @returns an array of playlists
     */
    GetPlaylists = async (): Promise<any[]> => {
        const playlists: (AppleMusicApi.Playlist | UserLibrary)[] = [];
        playlists.push({ id: "library", name: "Your Library", description: "Apple Music library" });

        let api_url = this.baseUrl + '/v1/me/library/playlists?offset=0';

        // Fetch all playlists in the user's library
        while (api_url) {
            try {
                // Fetch the first 25 playlists in the user's library
                const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                playlists.push(...response.data);

                // Update url to include new offset
                api_url = response.next ? this.baseUrl + response.next : '';

            } catch (error: any) {
                console.error(`Error: ${error.message}`);
                break;
            }
        }

        return playlists;
    }

    /**
     * Gets the name of the playlist from Apple Music provider
     * @param playlist the playlist
     * @returns the name of the playlist
     */
    GetPlaylistName = (playlist: any): string => {
        if (playlist.id === "library") {
            return "Your Library";
        }

        return playlist?.attributes?.name;
    }

    /**
     * Transfers the playlists from Apple Music to Apple Music
     * @param destination Apple Music provider that the playlists will be transfered to
     * @param playlists playlists to transfer
     */
    TransferPlaylistsToAppleMusic = async (destination: BaseProvider, playlists: any[], updateTransferState: (playlistName: string, state: string) => void): Promise<void> => {
        throw new Error("Cannot transfer to Apple Music from Apple Music provider.");
    }

    /**
     * Transfers the playlists from Apple Music to Spotify
     * @param destination Spotify provider that the playlists will be transfered to
     * @param playlists playlists to transfer
     */
    TransferPlaylistsToSpotify = async (destination: BaseProvider, playlists: any[], updateTransferState: (playlistName: string, state: string) => void): Promise<void> => {
        const appleMusicPlaylists: AppleMusicApi.Playlist[] = playlists as AppleMusicApi.Playlist[];

        for (const playlist of appleMusicPlaylists)
        {
            updateTransferState(playlist.attributes?.name ?? "Your Library", 'Transferring...');

            // Get all tracks in the playlist
            // Need to make sure that I get all of the tracks in the playlist, currently only gets the first 50 tracks
            const tracks = await this.GetSongsFromPlaylist(playlist.id);

            // Search for each track in the playlist on Spotify
            const spotifyTracksIds: string[] = [];
            for (const track of tracks)
            {
                const isExplicit = track.attributes?.contentRating === "explicit";
                const songId = await destination.SearchForSong(track.attributes?.name ?? "", track.attributes?.artistName ?? "", track.attributes?.albumName ?? "", isExplicit);

                // Push the song id to the array if it was found on Spotify
                if (songId)
                {
                    spotifyTracksIds.push(songId);
                }
            }

            // Create the playlist on Spotify
            const playlistName = playlist.id === "library" ? "Apple Music Library" : playlist.attributes?.name ?? "";
            const description = playlist.id === "library" ? "Apple Music Library" : playlist.attributes?.description?.standard ?? "";

            // const playlistId = await destination.CreatePlaylist(playlistName, spotifyTracksIds, description);
            const playlistId = "tosin";
            console.log("Playlist successfully created: " + playlistId); // TODO: Remove this
            updateTransferState(playlistName, 'Done ✅');
        }
    }

    /**
     * Creates a playlist on Apple Music
     * @param playlistName the name of the playlist
     * @param tracks the tracks to add to the playlist
     * @param description the description of the playlist
     * @returns the id of the playlist
     */
    CreatePlaylist = async (playlistName: string, tracks: string[], description: string = ""): Promise<string> => {
        const api_url = this.baseUrl + '/v1/me/library/playlists';

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
