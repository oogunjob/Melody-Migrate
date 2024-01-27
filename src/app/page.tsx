"use client";
import React, { useEffect, useState } from "react";
import { AppleMusicAPI } from "./apple";
import SpotifySDK from "./spotify";
import Playlists from "./components/playlists";
import { BaseProvider } from "./types/sources";
import Footer from "./components/footer";
import DefaultButton from "./components/buttons/defaultButton";
import DisplayBox from "./components/displaybox";
import MusicProviderSelection from "./components/musicProviderSelection";
import Transfer from "./components/transfer";

type OPTION = "NONE" | "TRANSFER" | "SYNC";

function Home() {
    const [source, setSource] = useState<BaseProvider | null | undefined>(null);
    const [destination, setDestination] = useState<BaseProvider | null | undefined>(null);
    const [selectedSource, setSelectedSource] = useState<BaseProvider | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<BaseProvider | null>(null);
    const [selectedSourcePlaylists, setSelectedSourcePlaylists] = useState<any[]>([]);
    const [selectedDestinationPlaylists, setSelectedDestinationPlaylists] = useState<any[]>([]);
    const [providers, setProviders] = useState<BaseProvider[]>([]);
    const [showOptions, setShowOptions] = useState<Boolean>(false);
    const [selectedOption, setSelectedOption] = useState<OPTION>("NONE");
    const [displaySync, setDisplaySync] = useState<Boolean>(false);
    const [playlistsToTransferToDestination, setPlaylistsToTransferToDestination] = useState<any[]>([]);
    const [playlistsToTransferToSource, setPlaylistsToTransferToSource] = useState<any[]>([]);

    // Fetch the Apple Music MusicKit instance on initial page load
    // TODO: Whenever the user refreshes the browser, the user music token is lost
    // and the user needs to reauthenticate. This is a bug that needs to be fixed.
    // Currently throws a 403 error when trying to fetch the user's library
    useEffect(() => {

        // @ts-ignore
        window.MusicKit?.configure({
            developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN ?? "",
            icon: "https://raw.githubusercontent.com/Musish/Musish/assets/misc/authIcon.png",
        });

        // @ts-ignore
        const musicKit = new AppleMusicAPI(window.MusicKit?.getInstance());
        const spotifySDK = new SpotifySDK(SpotifySDK.CreateSDK());

        setProviders([spotifySDK, musicKit]);
    }, []);

    /**
     * Handles the selection of the source provider
     * @param source The source provider
     */
    const handleSourceSelection = (source: BaseProvider) => {
        setSelectedSource((prevSource) => (prevSource && prevSource.name === source.name ? null : source));
    };

    /**
     * Handles the selection of the destination provider
     * @param destination The destination provider
     */
    const handleDestinationSelection = (destination: BaseProvider) => {
        setSelectedDestination((prevDestination) => (prevDestination && prevDestination.name === destination.name ? null : destination));
    };

    /**
     * Handles logging in to the source provider
     */
    const handleContinueSource = async () => {
        const loggedIn = await selectedSource?.LogIn();
        if (loggedIn) {
            setSource(selectedSource);
        }
    };

    /**
     * Handles logging in to the destination provider
     */
    const handleContinueDestination = async () => {
        const loggedIn = await selectedDestination?.LogIn();
        if (loggedIn) {
            setDestination(selectedDestination);
            setShowOptions(true);
        }
    };

    /**
     * Handles the transfer of the playlists from the source to the destination
     */
    const HandleDisplaySync = () => {
        const source1 = new Set(selectedSourcePlaylists.map((playlist) => source?.GetPlaylistName(playlist) ?? ""));
        const destination1 = new Set(selectedDestinationPlaylists.map((playlist) => destination?.GetPlaylistName(playlist) ?? ""));

        const missingInSource: string[] = [...new Set([...destination1].filter((x) => !source1.has(x)))];
        const missingInDestination: string[] = [...new Set([...source1].filter((x) => !destination1.has(x)))];

        const playlistsToTransferToDestination_ = selectedSourcePlaylists.filter((playlist) =>
            missingInDestination.includes(source?.GetPlaylistName(playlist) ?? ""),
        );
        const playlistsToTransferToSource_ = selectedDestinationPlaylists.filter((playlist) =>
            missingInSource.includes(destination?.GetPlaylistName(playlist) ?? ""),
        );

        setPlaylistsToTransferToDestination(playlistsToTransferToDestination_);
        setPlaylistsToTransferToSource(playlistsToTransferToSource_);

        setDisplaySync(true);
    };

    return (
        <div className="flex h-screen bg-[#f8f8f8] flex-col items-center">
            <section className="w-full tails-selected-element">
                <div className="px-10 py-20 mx-auto max-w-7xl">
                    <div className="w-full mx-auto text-left md:text-center">
                        <h1 className="mb-6 text-5xl font-extrabold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl md:tracking-tight">
                            {" "}
                            Open Source{" "}
                            <span className="w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 lg:inline">
                                Universal Music Library Transfer
                            </span>
                            <br className="lg:block hidden" />
                        </h1>
                        <p className="px-0 mb-6 text-gray-600 text-lg lg:px-24">
                            Transfer your music library from one platform to another and vice versa with{" "}
                            <span className="font-bold">NO SONG LIMIT.</span> Currently supports Apple Music, Spotify, and more to come! Begin by
                            selecting your source music streaming service.
                        </p>
                    </div>
                </div>
            </section>
            <section className="bg-[#f8f8f8] h-full w-full pb-14 tails-selected-element flex items-center justify-center space-x-10">
                <div className="relative">
                    <DisplayBox
                        title={
                            !source
                                ? "Select Your Source"
                                : `Select Playlists To ${selectedOption === "NONE" ? "Transfer/Sync" : selectedOption === "TRANSFER" ? "Transfer" : "Sync"}`
                        }
                    >
                        {!source ? (
                            // If no source is selected, show the source providers
                            <MusicProviderSelection
                                selectedProvider={selectedSource}
                                providers={providers}
                                handleSelection={handleSourceSelection}
                                handleContinue={handleContinueSource}
                            />
                        ) : !displaySync ? (
                            // If a source is selected, show the playlists from the source
                            <Playlists
                                provider={source}
                                selectedPlaylists={selectedSourcePlaylists}
                                setSelectedPlaylists={setSelectedSourcePlaylists}
                            />
                        ) : (
                            // If the sync is displayed, show the sync component
                            <Transfer source={source!} destination={destination!} playlists={playlistsToTransferToDestination} />
                        )}
                    </DisplayBox>
                </div>
                <div className="sm:relative bg-[#f8f8f8] sm:flex sm:flex-col">
                    <DisplayBox
                        title={
                            !showOptions
                                ? "Select Your Destination"
                                : selectedOption == "NONE"
                                  ? "Select An Option"
                                  : selectedOption == "TRANSFER"
                                    ? "Transfer"
                                    : "Select Playlists To Sync"
                        }
                    >
                        {!showOptions ? (
                            <MusicProviderSelection
                                selectedProvider={selectedDestination}
                                // Remove the source provider from the list of providers
                                providers={providers.filter((provider) => provider.name !== source?.name)}
                                handleSelection={handleDestinationSelection}
                                handleContinue={handleContinueDestination}
                            />
                        ) : selectedOption == "NONE" ? (
                            // If no option is selected, show the options
                            <div className="h-full space-y-10 flex flex-col justify-center items-center">
                                <DefaultButton
                                    onClick={() => setSelectedOption("TRANSFER")}
                                    disabled={false}
                                    text="Transfer From Source to Destination"
                                />
                                <DefaultButton onClick={() => setSelectedOption("SYNC")} disabled={false} text="Sync With Source" />
                            </div>
                        ) : // If the option is transfer, show the transfer component
                        selectedOption == "TRANSFER" ? (
                            <Transfer source={source!} destination={destination!} playlists={selectedSourcePlaylists} />
                        ) : !displaySync ? (
                            // If the option is sync, show the playlists from the destination
                            <Playlists
                                provider={destination!}
                                selectedPlaylists={selectedDestinationPlaylists}
                                setSelectedPlaylists={setSelectedDestinationPlaylists}
                                handleSync={HandleDisplaySync}
                            />
                        ) : (
                            // If the sync is displayed, show the sync component
                            <Transfer source={destination!} destination={source!} playlists={playlistsToTransferToSource} />
                        )}
                    </DisplayBox>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default Home;
