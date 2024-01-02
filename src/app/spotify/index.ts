import { SearchResults, SpotifyApi, Playlist } from "@spotify/web-api-ts-sdk";

// TODO: One of the things that I'll have to explore in the future with making a class like this is if I'll be able to
// track the status of uploads. For example, if a playlist has 500 tracks, but only 100 uploads are allowed at a time,
// I would want to alert the user that the first 100 were completed, and move on to the next 100, and so on.

export class SpotifySDK {
    sdk: SpotifyApi;

    constructor(sdk: SpotifyApi) {
      this.sdk = sdk;
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
}