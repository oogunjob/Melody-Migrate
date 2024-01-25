import React, { useEffect, useState } from "react";
import { BaseProvider, TRANSFER_STATE } from "../types/sources";
import Typing from "./animations/typing";

function Transfer({ source, destination, playlists }: { source: BaseProvider; destination: BaseProvider; playlists: any[] }) {
    const [isTransfered, setIsTransfered] = useState<boolean>(false);
    const [transferStates, setTransferStates] = useState<{ [key: string]: TRANSFER_STATE }>({});

    useEffect(() => {
        const transferPlaylists = async () => {
            switch (destination.name) {
                case "Spotify":
                    await source.TransferPlaylistsToSpotify(destination, playlists, updateTransferState);
                    break;
                case "Apple Music":
                    await source.TransferPlaylistsToAppleMusic(destination, playlists, updateTransferState);
                    break;
            }

            setIsTransfered(true);
        };

        transferPlaylists();
    }, []);

    // Might need to use an id here instead of the name
    function updateTransferState(playlistName: string, state: TRANSFER_STATE) {
        setTransferStates((prevState) => ({ ...prevState, [playlistName]: state }));
    }

    function ReturnTransferState(playlist: any) {
        switch (transferStates[source.GetPlaylistName(playlist)]) {
            case "TRANSFERRING":
                return (
                    <div>
                        <div className="flex w-full justify-center">
                            Transferring
                            <span className="inline-block w-5">
                                <Typing />
                            </span>
                        </div>
                    </div>
                );

            case "COMPLETE":
                return "Done ✅";

            case "FAILED":
                return "Failed ❌";

            default:
                return "Not Started";
        }
    }

    return (
        <div className="flex flex-col items-center h-full p-8">
            <div className="mb-4 text-black text-xl font-medium">{!isTransfered ? `Transferring to ${destination.name}` : "Transfer Complete"}</div>
            <div className="flex w-full mb-4 justify-center text-gray text-xl font-normal">Do not refresh or close until completion</div>{" "}
            {/* Should have an option after completition, try again. */}
            <div className="flex flex-col overflow-auto">
                {playlists?.map((playlist, index) => (
                    <div key={index} className="flex justify-center mx-3">
                        <div className="w-[315px] h-20 flex items-center font-normal bg-white rounded-[10px] shadow mr-5 mb-5 overflow-hidden overflow-ellipsis whitespace-nowrap">
                            <div className="mx-2 ">
                                <img src={`/icons/playlist_icon.svg`} alt={playlist.name} />
                            </div>
                            {source.GetPlaylistName(playlist)}
                        </div>
                        <div className="w-[140px] h-20 flex items-center font-semibold justify-center bg-white rounded-[10px] shadow">
                            {ReturnTransferState(playlist)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Transfer;
