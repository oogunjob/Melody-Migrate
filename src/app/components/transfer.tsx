import React, { useEffect, useState } from 'react'
import { BaseProvider } from '../types/sources';

function Transfer({ source, destination, playlists }: { source: BaseProvider, destination: BaseProvider, playlists: any[] }) {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [isTransfered, setIsTransfered] = useState<boolean>(false);
    const [transferStates, setTransferStates] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const transferPlaylists = async () => {
            switch (destination.name) {
                case 'Spotify':
                    await source.TransferPlaylistsToSpotify(destination, playlists, updateTransferState);
                    break;
                case 'Apple Music':
                    await source.TransferPlaylistsToSpotify(destination, playlists, updateTransferState);
                    break;
            }
        };

        transferPlaylists();
    }, []);

    // Might need to use an id here instead of the name
    function updateTransferState(playlistName: string, state: string) {
        setTransferStates(prevState => ({ ...prevState, [playlistName]: state }));
    }

    if (!isTransfered) {
        return (
            <div className='flex flex-col h-full'>
                <div className='mb-4'>Tosin</div>
                <div className='flex flex-col overflow-auto'>
                    {playlists?.map((playlist, index) => (
                        <div key={index} className='flex justify-center'>
                            <div className="w-[245px] h-20 flex items-center bg-white rounded-[10px] shadow mr-5 mb-5">
                                <div className="mx-6">
                                    <img src={`/icons/playlist_icon.svg`} alt={playlist.name} />
                                </div>
                                {source.GetPlaylistName(playlist)}
                            </div>
                            <div className="w-[125px] h-20 flex items-center justify-center bg-white rounded-[10px] shadow">
                                {transferStates[source.GetPlaylistName(playlist)] || '----'}
                            </div>
                        </div>))}
                </div>
            </div>
        )
    }

    return (
        <div>Transfered</div>
    )
}

export default Transfer