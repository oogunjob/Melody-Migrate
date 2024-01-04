import React,{ useEffect, Dispatch, SetStateAction } from 'react';
import { BaseProvider } from '../types/sources';

function Playlists({ source, selectedPlaylists, setSelectedPlaylists }: { source: BaseProvider, selectedPlaylists: any[], setSelectedPlaylists: Dispatch<SetStateAction<any[]>> }) {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [playlists, setPlaylists] = React.useState<any[]>([]);

    useEffect(() => {
        async function RetrievePlaylists() {
            const retrievedPlaylists = await source.GetPlaylists();
            setPlaylists(retrievedPlaylists);
            setIsLoaded(true);
        }

        RetrievePlaylists();
    }, []);

    const HandleSelectPlaylist = (playlist: any) => {
        if (selectedPlaylists.includes(playlist)) {
            setSelectedPlaylists(selectedPlaylists.filter((p) => p !== playlist));
        } else {
            setSelectedPlaylists([...selectedPlaylists, playlist]);
        }
    };

    return (
        <div>
            {!isLoaded && <div>Loading...</div>}
            {isLoaded &&
                playlists.map((playlist, index) => (
                    <div
                        key={index}
                        onClick={() => HandleSelectPlaylist(playlist)}
                        style={{
                            border: '1px solid black',
                            padding: '10px',
                            margin: '10px',
                            backgroundColor: selectedPlaylists.includes(playlist) ? 'lightblue' : 'white',
                        }}
                        className='cursor-pointer'
                    >
                        <h1>{source.GetPlaylistName(playlist)}</h1>
                    </div>
                ))}
        </div>
    );
}

export default Playlists;