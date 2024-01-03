import { SearchResults, SpotifyApi, Playlist, Scopes, Page, Track } from "@spotify/web-api-ts-sdk";
import { BaseProvider } from "../types/sources";

// TODO: One of the things that I'll have to explore in the future with making a class like this is if I'll be able to
// track the status of uploads. For example, if a playlist has 500 tracks, but only 100 uploads are allowed at a time,
// I would want to alert the user that the first 100 were completed, and move on to the next 100, and so on.
export default class SpotifySDK implements BaseProvider {
    sdk: SpotifyApi;
    name: string = "Spotify";
    icon: string = "";

    constructor(sdk: SpotifyApi) {
        this.sdk = sdk;
    }

    // Creates the initial Spotify SDK
    public static CreateSDK()
    {
        const sdk = SpotifyApi.withUserAuthorization(process.env.NEXT_PUBLIC_CLIENT_ID ?? "", "http://localhost:3000", Scopes.all);
        return sdk;
    }

    private async GetUserId()
    {
        const user = await this.sdk.currentUser.profile();
        return user.id;
    }

    // TODO: Come back and make the documentation for this look better
    SearchForSong = async (artist: string, songTitle: string, albumTitle: string): Promise<string> =>
    {
        const results: SearchResults<["track"]> = await this.sdk.search(`${artist} ${songTitle} ${albumTitle}`, ["track"], "US", 3)

        // TODO: Need to change this to return the uri of the song
        return results.tracks?.items.length ? results.tracks.items[0].id : "";
    }

    // TODO: Make the documentation here look better
    // Create the playlist
    public async CreatePlaylist(name: string, uris: string[])
    {
        const userId: string = await this.GetUserId();
        const playlist: Playlist = await this.sdk.playlists.createPlaylist(userId, { name: name, description: "Created by Universal Music Library Transfer", public: false });

        // Add track to playlist
        // TODO: Check if there is a limit on the number of tracks that can be added at one time
        await this.sdk.playlists.addItemsToPlaylist(playlist.id, uris)

        return null;
    }

    // TODO: Need to figure out how to add logic to log in to Spotify from here
    // and make this a pop up window instead of a new page
    LogIn = async () => {
        console.log("Logging in to Spotify");
        return true;
    };

    FetchPlaylists = async (): Promise<any[]> => {
        const userId: string = await this.GetUserId();
        const playlists: Page<Playlist> = await this.sdk.playlists.getUsersPlaylists(userId);
        return playlists.items;
    };

    GetPlaylistName = (playlist: any): string => {
        return playlist.name;
    };

    TransferPlaylistsToSpotify = async (destination: BaseProvider, playlists: any[]): Promise<void> => {
        throw new Error("Cannot transfer to Spotify from Spotify provider.");
    }

    /**
     * Transfers the playlists from Spotify to Apple Music
     * @param destination Apple Music provider that the playlists will be transfered to
     * @param playlists playlists from Spotify to transfer
     */
    TransferPlaylistsToAppleMusic = async (destination: BaseProvider, playlists: any[]): Promise<void> => {
        const spotifyPlaylists: Playlist[] = playlists as Playlist[];
        console.log(spotifyPlaylists);

        for (const playlist of spotifyPlaylists)
        {
            // Get all tracks in the playlist
            // Need to make sure that I get all of the tracks in the playlist, currently only gets the first 50 tracks
            const tracks = await this.sdk.playlists.getPlaylistItems(playlist.id, "US",)

            // Search for each track in the playlist on Apple Music
            const appleMusicTracksIds: string[] = [];
            for (const track of tracks.items)
            {
                const trackDetails = (track.track as unknown) as Track;
                const songId = await destination.SearchForSong(trackDetails.name, trackDetails.artists[0].name, trackDetails.album.name);
                console.log(songId);
            }
        }
    }
}