export interface BaseProvider {
    name: string;
    icon: string;
    LogIn: () => Promise<Boolean>;
    FetchPlaylists: () => Promise<any[]>;
    GetPlaylistName: (playlist: any) => string;
    TransferPlaylistsToSpotify(destination: BaseProvider, playlists: any[]): Promise<void>;
    TransferPlaylistsToAppleMusic(destination: BaseProvider, playlists: any[]): Promise<void>;
    SearchForSong(songTitle: string, artist: string, albumTitle: string): Promise<string>;
}