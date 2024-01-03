import { SearchResults, SpotifyApi, Playlist, Scopes } from "@spotify/web-api-ts-sdk";
import { BaseSource } from "../types/sources";

// TODO: One of the things that I'll have to explore in the future with making a class like this is if I'll be able to
// track the status of uploads. For example, if a playlist has 500 tracks, but only 100 uploads are allowed at a time,
// I would want to alert the user that the first 100 were completed, and move on to the next 100, and so on.
export default class SpotifySDK implements BaseSource {
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
    public async SearchForSong(artist: string, songTitle: string, albumTitle: string)
    {
        const results: SearchResults<["track"]> = await this.sdk.search(`${artist} ${songTitle} ${albumTitle}`, ["track"], "US", 3)
        return results;
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
        const userId = await this.GetUserId();
        const playlists = await this.sdk.playlists.getUsersPlaylists(userId);
        return playlists.items;
    };

    GetPlaylistName = (playlist: any): string => {
        return playlist.name;
    };
}