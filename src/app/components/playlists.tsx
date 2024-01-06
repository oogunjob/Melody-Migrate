import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BaseProvider } from '../types/sources';

function Playlists({ source, selectedPlaylists, setSelectedPlaylists }: { source: BaseProvider, selectedPlaylists: any[], setSelectedPlaylists: Dispatch<SetStateAction<any[]>> }) {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [playlists, setPlaylists] = React.useState<any[]>([]);

    useEffect(() => {
        async function GetPlaylists() {
            const retrievedPlaylists = await source.GetPlaylists();
            const playlists = retrievedPlaylists.map((item, index) => ({ ...item, key: index + 1 }));

            // Set the playlists and selected playlists
            setPlaylists(playlists);
            setSelectedPlaylists(playlists.map((playlist) => playlist.key));

            // Set the loaded state
            setIsLoaded(true);
        }

        GetPlaylists();
    }, []);

    const handleToggleAll = () => {
        if (selectedPlaylists.length === playlists.length) {
            // All options are selected, clear selection
            setSelectedPlaylists([]);
        } else {
            // Not all options are selected, select all
            setSelectedPlaylists(playlists.map((playlist) => playlist.key));
        }
    };

    const handleToggleOption = (key: number) => {
        if (selectedPlaylists.includes(key)) {
            // Option is selected, unselect it
            setSelectedPlaylists(selectedPlaylists.filter((selectedId) => selectedId !== key));
        } else {
            // Option is not selected, select it
            setSelectedPlaylists([...selectedPlaylists, key]);
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
            <label>
                <input type="checkbox" checked={selectedPlaylists.length === playlists.length} onChange={handleToggleAll} />
                Select All
            </label>

            <div className="flex flex-wrap">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.key}
                        className={`m-2 w-32 h-32 border-2 cursor-pointer flex items-center justify-center ${selectedPlaylists.includes(playlist.key) ? 'bg-blue-300' : 'bg-white'}`}
                        onClick={() => handleToggleOption(playlist.key)}
                    >
                        <label className="cursor-pointer">
                            {source.GetPlaylistName(playlist)}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Playlists;
