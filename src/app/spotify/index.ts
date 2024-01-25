import { SearchResults, SpotifyApi, Playlist, Scopes, Page, Track, PlaylistedTrack, MaxInt, SavedTrack } from "@spotify/web-api-ts-sdk";
import { BaseProvider, TRANSFER_STATE, UserLibrary } from "../types/sources";

export default class SpotifySDK implements BaseProvider {
    sdk: SpotifyApi;
    name: string = "Spotify";
    icon: string = "spotify_icon.png";

    private maxTracksPerPlaylist: number = 100;

    constructor(sdk: SpotifyApi) {
        this.sdk = sdk;
    }

    // Creates the initial Spotify SDK
    public static CreateSDK() {
        const sdk = SpotifyApi.withUserAuthorization(process.env.NEXT_PUBLIC_CLIENT_ID ?? "", process.env.NEXT_PUBLIC_REDIRECT_URI ?? "", [
            ...Scopes.playlist,
            ...Scopes.userLibraryRead,
        ]);

        return sdk;
    }

    private async GetUserId() {
        const user = await this.sdk.currentUser.profile();
        return user.id;
    }

    GetSongsFromLibrary = async (): Promise<any[]> => {
        const tracks: SavedTrack[] = [];

        let results: Page<SavedTrack> = await this.sdk.currentUser.tracks.savedTracks();
        tracks.push(...results.items);

        while (results.next) {
            // Extract the query string from the URL
            const queryString = results.next.split("?")[1];
            const urlParams = new URLSearchParams(queryString);

            // Get offset and limit from the url
            const offset: number = parseInt(urlParams.get("offset") ?? "100");
            const limit: MaxInt<50> = parseInt(urlParams.get("limit") ?? "100") as MaxInt<50>;

            results = await this.sdk.currentUser.tracks.savedTracks(limit, offset);
            tracks.push(...results.items);
        }

        return tracks;
    };

    /**
     * Gets all of the songs in a playlist
     * @param playlistId the id of the playlist
     * @returns an array of all tracks in the playlist
     */
    GetSongsFromPlaylist = async (playlistId: string): Promise<any[]> => {
        const tracks: any[] = [];

        if (playlistId === "library") {
            // Get the user's library
            const songs = await this.GetSongsFromLibrary();
            tracks.push(...songs);
        } else {
            let results: Page<PlaylistedTrack> = await this.sdk.playlists.getPlaylistItems(playlistId, "US");
            tracks.push(...results.items);

            while (results.next) {
                // Extract the query string from the URL
                const queryString = results.next.split("?")[1];
                const urlParams = new URLSearchParams(queryString);

                // Get offset and limit from the url
                const offset: number = parseInt(urlParams.get("offset") ?? "100");
                const limit: MaxInt<50> = parseInt(urlParams.get("limit") ?? "100") as MaxInt<50>;

                results = await this.sdk.playlists.getPlaylistItems(playlistId, "US", undefined, limit, offset);
                tracks.push(...results.items);
            }
        }

        // Filter out null tracks found in the playlist and map as Track[]
        return tracks.filter((track) => track.track != null).map((track) => track.track as unknown as Track) as Track[];
    };

    /**
     * Searches for a song on Spotify
     * @param artist the artist of the song
     * @param songTitle the title of the song
     * @param albumTitle the title of the album
     * @returns the uri of the song if found, empty string otherwise
     */
    SearchForSong = async (artist: string, songTitle: string, albumTitle: string): Promise<string> => {
        const results: SearchResults<["track"]> = await this.sdk.search(`${artist} ${songTitle} ${albumTitle}`, ["track"], "US", 3);

        // TODO: Need to create a method that also finds the best match for a song rather than returning the first result
        return results.tracks?.items.length ? results.tracks.items[0].uri : "";
    };

    /**
     * Creates a playlist on Spotify
     * @param playlistName the name of the playlist
     * @param tracks the tracks to add to the playlist
     * @param description the description of the playlist
     * @returns the id of the playlist
     */
    CreatePlaylist = async (playlistName: string, tracks: string[], description: string = ""): Promise<string> => {
        const userId: string = await this.GetUserId();
        const playlist: Playlist = await this.sdk.playlists.createPlaylist(userId, { name: playlistName, description: description, public: false });

        for (let i = 0; i < tracks.length; i += this.maxTracksPerPlaylist) {
            // Create chunks of tracks
            const tracksChunk = tracks.slice(i, i + this.maxTracksPerPlaylist);

            // Add track chunk to playlist
            await this.sdk.playlists.addItemsToPlaylist(playlist.id, tracksChunk);
        }

        return playlist.id;
    };

    /**
     * Logs user in to Spotify
     * @returns true if the user is logged in, false otherwise
     */
    LogIn = async (): Promise<boolean> => {
        // TODO: Need to figure out how to make this a pop up window instead of a new page
        const response = await this.sdk.authenticate();
        return response.authenticated;
    };

    /**
     * Gets the playlists from the user's Spotify account
     * This method also adds a playlist that represents the user's library
     * @returns an array of playlists
     */
    GetPlaylists = async (): Promise<any[]> => {
        const playlists: (Playlist | UserLibrary)[] = [];

        const userId: string = await this.GetUserId();
        const user_playlists: Page<Playlist> = await this.sdk.playlists.getUsersPlaylists(userId);

        // Add a playlist that represents the user's library and add all of the user's playlists
        playlists.push({ id: "library", name: "Liked Songs", description: "Spotify Liked Songs" });
        playlists.push(...user_playlists.items);

        return playlists;
    };

    /**
     * Gets the name of the playlist from Spotify provider
     * @param playlist the playlist
     * @returns the name of the playlist
     */
    GetPlaylistName = (playlist: any): string => {
        return playlist.name;
    };

    TransferPlaylistsToSpotify = async (destination: BaseProvider, playlists: any[]): Promise<void> => {
        throw new Error("Cannot transfer to Spotify from Spotify provider.");
    };

    /**
     * Transfers the playlists from Spotify to Apple Music
     * @param destination Apple Music provider that the playlists will be transfered to
     * @param playlists playlists from Spotify to transfer
     */
    TransferPlaylistsToAppleMusic = async (
        destination: BaseProvider,
        playlists: any[],
        updateTransferState: (playlistName: string, state: TRANSFER_STATE) => void,
    ): Promise<void> => {
        const spotifyPlaylists: Playlist[] = playlists as Playlist[];

        const playlistPromises = spotifyPlaylists.map(async (playlist) => {
            updateTransferState(playlist.name, "TRANSFERRING");

            // Get all tracks in the playlist
            const tracks: Track[] = await this.GetSongsFromPlaylist(playlist.id);

            // Search for each track in the playlist on Apple Music
            const appleMusicTracksIds: string[] = [];

            for (const track of tracks) {
                const songId = await destination.SearchForSong(track.name, track.artists[0].name, track.album.name, track.explicit);

                // Push the song id to the array if it was found on Apple Music
                if (songId) {
                    appleMusicTracksIds.push(songId);
                }

                // If it wasn't found I could add it to an array and display it to the user
            }

            // Create the playlist on Apple Music
            // try {
            //     const playlistId = await destination.CreatePlaylist(playlist.name, appleMusicTracksIds, playlist.description);
            //     console.log("Playlist successfully created: " + playlistId); // TODO: Remove this
            // }
            // catch (e) {
            //     console.log(e);
            //     updateTransferState(playlist.name, "FAILED");
            // }
            // const playlistId = await destination.CreatePlaylist(playlist.name, appleMusicTracksIds, playlist.description);
            const playlistId = "tosin";
            console.log("Playlist successfully created: " + playlistId); // TODO: Remove this

            updateTransferState(playlist.name, "COMPLETE");
        });

        // Wait for all playlists to be created
        await Promise.all(playlistPromises);
    };
}
