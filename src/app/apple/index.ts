import { AppleMusicApi } from "../types/apple-music-api";
import { BaseSource } from "../types/sources";

export class AppleMusicAPI implements BaseSource{

    name = "Apple Music";
    icon = "apple";
    instance: MusicKit.MusicKitInstance | null;
    baseUrl: string = 'https://api.music.apple.com/v1';
    musicKitToken: string | null = null;

    constructor(instance: MusicKit.MusicKitInstance) {
      this.instance = instance;
      this.musicKitToken = instance.musicUserToken;
      this.LogIn = this.LogIn.bind(this);
      this.LogOut = this.LogOut.bind(this);
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
        const all_songs: any[] = [];

        let api_url = this.baseUrl + `/me/library/playlists/${id}/tracks`

        // Time how long it takes to retrieve all songs in the selected playlist
        var startTime = performance.now();
        console.log(`Fetching all songs in playlist ${id}.`);

        // Fetch all songs in the selected playlist
        while (api_url) {
            try {
                // Fetch the first 25 songs in the playlist
                const response: AppleMusicApi.Relationship<AppleMusicApi.Playlist> = await fetch(api_url, {
                    headers: this.GetHeader()
                }).then(response => response.json()).then(data => { return data });

                all_songs.push(...response.data);

                // Update url to include new offset
                api_url = response.next ? this.baseUrl + response.next : '';

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

    /**
     * Fetch all songs in the user's library
     * @returns array of songs
     */
    public async FetchSongsFromLibrary(): Promise<AppleMusicApi.Song[]> {
        const all_songs: AppleMusicApi.Song[] = [];

        let api_url = this.baseUrl + '/me/library/songs?offset=0';

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

        var endTime = performance.now();
        console.log(`It took ${endTime - startTime} milliseconds to fetch ${all_songs.length} songs.`);

        return all_songs;
    }

    LogIn = async (): Promise<void> => {
        await this.instance?.unauthorize();
        await this.instance?.authorize().then((token: any) => this.musicKitToken = token);
    };

    FetchPlaylists = async (): Promise<any[]> => {
        const all_playlists: AppleMusicApi.Playlist[] = [];

        let api_url = this.baseUrl + '/me/library/playlists?offset=0';

        // Time how long it takes to retrieve all songs in user library
        var startTime = performance.now();
        console.log(`Fetching all playlists in user library.`);

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

        var endTime = performance.now();
        console.log(`It took ${endTime - startTime} milliseconds to fetch ${all_playlists.length} playlists.`);

        return all_playlists;
    };

    GetPlaylistName = (playlist: any): string => {
        // Get Apple Music playlist name logic here
        return playlist.attributes?.name;
    };
}
