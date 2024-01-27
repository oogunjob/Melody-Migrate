import React, { Dispatch, SetStateAction, useEffect } from "react";
import { BaseProvider } from "../types/sources";
import LoadingSpinner from "./animations/loadingSpinner";
import DefaultButton from "./buttons/defaultButton";

interface Playlist {
    key: number;
    name: string;
}

function Playlists({
    provider,
    selectedPlaylists,
    setSelectedPlaylists,
    handleSync,
}: {
    provider: BaseProvider;
    selectedPlaylists: Playlist[];
    setSelectedPlaylists: Dispatch<SetStateAction<Playlist[]>>;
    handleSync?: () => void;
}) {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);

    useEffect(() => {
        async function GetPlaylists() {
            const retrievedPlaylists = await provider.GetPlaylists();
            const playlists = retrievedPlaylists.map((item, index) => ({ ...item, key: index + 1 }));

            // Set the playlists and selected playlists
            setPlaylists(playlists);
            setSelectedPlaylists(playlists);

            // Set the loaded state
            setIsLoaded(true);
        }

        GetPlaylists();
    });

    const handleToggleAll = () => {
        if (selectedPlaylists.length === playlists.length) {
            // All options are selected, clear selection
            setSelectedPlaylists([]);
        } else {
            // Not all options are selected, select all
            setSelectedPlaylists([...playlists]);
        }
    };

    // Toggle the playlist option to be selected or not
    const handleToggleOption = (playlist: Playlist) => {
        // Select the option if it hasn't been selected yet
        if (!isSelected(playlist)) {
            setSelectedPlaylists([...selectedPlaylists, playlist]);
        }
        // Deselect the option if it has been selected
        else {
            setSelectedPlaylists(selectedPlaylists.filter((selected) => selected.key !== playlist.key));
        }

        console.log(selectedPlaylists);
    };

    // Check if the playlist is selected
    const isSelected = (playlist: Playlist) => {
        return selectedPlaylists.map(selected => selected.key).includes(playlist.key);
    };

    if (!isLoaded) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col h-full p-8">
            {/* Select All section */}
            <div className="flex">
                <label className="flex items-center mb-5">
                    <input
                        className="w-5 h-5 mr-3 cursor-pointer"
                        type="checkbox"
                        checked={selectedPlaylists.length === playlists.length}
                        onChange={handleToggleAll}
                    />
                    <div className="text-black text-xl font-medium">Select All</div>
                </label>
            </div>

            {/* Playlists */}
            <div className="flex justify-center overflow-auto h-[full] px-2">
                <div className="grid grid-cols-4">
                    {playlists.map((playlist, index) => (
                        <div
                            key={index}
                            className={`w-[120px] h-[120px] rounded-lg hover:bg-blue-200 flex items-center justify-center ${isSelected(playlist) ? "bg-blue-200" : ""}`}
                        >
                            <div onClick={() => handleToggleOption(playlist)} className={`flex flex-col items-center justify-center cursor-pointer `}>
                                <div className={`flex items-center justify-center w-20 h-20 bg-white rounded-[10px] shadow`}>
                                    <img src={`./icons/playlist_icon.svg`} alt={playlist.name} />
                                </div>
                                <div className="flex items-center justify-center">
                                    <label
                                        className="max-w-[100px] cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap"
                                        title={provider.GetPlaylistName(playlist)}
                                    >
                                        {provider.GetPlaylistName(playlist)}
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sync Button */}
            {handleSync && (
                <div className="flex items-center justify-center">
                    <DefaultButton onClick={handleSync} disabled={false} text="Sync" />
                </div>
            )}
        </div>
    );
}

export default Playlists;
