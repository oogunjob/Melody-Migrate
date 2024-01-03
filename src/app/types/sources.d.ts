export interface BaseSource {
    name: string;
    icon: string;
    LogIn: () => Promise<void> | void;
    FetchPlaylists: () => Promise<any[]>;
    GetPlaylistName: (playlist: any) => string;
}