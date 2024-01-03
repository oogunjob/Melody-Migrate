export interface BaseSource {
    name: string;
    icon: string;
    LogIn: () => Promise<Boolean>;
    FetchPlaylists: () => Promise<any[]>;
    GetPlaylistName: (playlist: any) => string;
}