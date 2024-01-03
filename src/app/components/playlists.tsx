"use client"
import React, { useEffect } from 'react'
import { BaseSource } from '../types/sources';

function Playlists({ source}: { source: BaseSource }) {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [playlists, setPlaylists] = React.useState<any[]>([]);

    useEffect(() => {
        async function RetrievePlaylists() {
            const retrievedPlaylists = await source.FetchPlaylists();
            setPlaylists(retrievedPlaylists);
            setIsLoaded(true);
        }

        RetrievePlaylists()
    }, [])

    return (
        <div>
            {!isLoaded && <div>Loading...</div>}
            {isLoaded && playlists.map((playlist, index) => (
                <div key={index}>
                    <h1>{source.GetPlaylistName(playlist)}</h1>
                </div>
            ))}
        </div>
    )
}

export default Playlists