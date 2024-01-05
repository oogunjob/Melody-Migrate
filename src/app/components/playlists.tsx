import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { BaseProvider } from '../types/sources';

function Playlists({ source, selectedPlaylists, setSelectedPlaylists }: { source: BaseProvider, selectedPlaylists: any[], setSelectedPlaylists: Dispatch<SetStateAction<any[]>> }) {
    const [playlists, setPlaylists] = React.useState<any[]>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    useEffect(() => {
        async function GetPlaylists() {
            const retrievedPlaylists = await source.GetPlaylists();
            setPlaylists(retrievedPlaylists);
            setIsLoaded(true);
        }

        GetPlaylists();
    }, []);

    const HandleSelectPlaylist = (playlist: any) => {
        if (selectedPlaylists.includes(playlist)) {
            setSelectedPlaylists(selectedPlaylists.filter((p) => p !== playlist));
        } else {
            setSelectedPlaylists([...selectedPlaylists, playlist]);
        }
    };

    if (!isLoaded) {
        return (
            <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
        )
    }

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