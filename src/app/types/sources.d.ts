export interface BaseProvider {
    name: string;
    icon: string;
    LogIn: () => Promise<Boolean>;
    GetPlaylists: () => Promise<any[]>;
    GetSongsFromPlaylist(playlistId: string): Promise<any[]>;
    GetPlaylistName: (playlist: any) => string;
    TransferPlaylistsToSpotify(destination: BaseProvider, playlists: any[], updateTransferState: (playlistName: string, state: TRANSFER_STATE) => void): Promise<void>;
    TransferPlaylistsToAppleMusic(destination: BaseProvider, playlists: any[], updateTransferState: (playlistName: string, state: TRANSFER_STATE) => void): Promise<void>;
    SearchForSong(songTitle: string, artist: string, albumTitle: string, explicit: boolean): Promise<string>;
    CreatePlaylist(name: string, tracks: string[], description?: string): Promise<string>;
}

export type UserLibrary = {
    id: string;
    name: string;
    description: string;
}

export type TRANSFER_STATE = "TRANSFERRING" | "COMPLETE" | "FAILED";