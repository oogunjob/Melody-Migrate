"use client"
import React, { useEffect, useState } from 'react';
import { AppleMusicAPI } from './apple';
import SpotifySDK from './spotify';
import Playlists from './components/playlists';
import { BaseProvider } from './types/sources';
import Provider from './components/buttons/providerCard';
import Footer from './components/footer';
import DefaultButton from './components/buttons/defaultButton';
import DisplayBox from './components/displaybox';
import MusicProviderSelection from './components/musicProviderSelection';
import Transfer from './components/transfer';

type OPTION = "NONE" | "TRANSFER" | "SYNC";

// TODO: Once this is deployed, will need to make sure that the source cannot be accessed
// from regular browser.
function Home() {
  const [source, setSource] = useState<BaseProvider | null | undefined>(null);
  const [destination, setDestination] = useState<BaseProvider | null | undefined>(null);
  const [selectedSource, setSelectedSource] = useState<BaseProvider | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BaseProvider | null>(null);
  const [selectedSourcePlaylists, setSelectedSourcePlaylists] = useState<any[]>([]);

  const [selectedDestinationPlaylists, setSelectedDestinationPlaylists] = useState<any[]>([]);

  const [providers, setProviders] = useState<BaseProvider[]>([]);
  const [isTransfered, setIsTransfered] = useState<Boolean>(false);
  const [showOptions, setShowOptions] = useState<Boolean>(false);
  const [selectedOption, setSelectedOption] = useState<OPTION>("NONE");

  // Fetch the Apple Music MusicKit instance on initial page load
  // TODO: Whenever the user refreshes the browser, the user music token is lost
  // and the user needs to reauthenticate. This is a bug that needs to be fixed.
  // Currently throws a 403 error when trying to fetch the user's library
  useEffect(() => {
    // @ts-ignore
    window.MusicKit?.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
      icon: 'https://raw.githubusercontent.com/Musish/Musish/assets/misc/authIcon.png'
    });

    // @ts-ignore
    const musicKit = new AppleMusicAPI(window.MusicKit?.getInstance());
    const spotifySDK = new SpotifySDK(SpotifySDK.CreateSDK());
    setProviders([spotifySDK, musicKit]);
  }, []);

  // const [loading, setLoading] = useState(true); // Use this to show the loading of the providers

  /**
   * Handles the selection of the source provider
   * @param source The source provider
   */
  const handleSourceSelection = (source: BaseProvider) => {
    setSelectedSource(prevSource => prevSource && prevSource.name === source.name ? null : source);
  };

  /**
   * Handles the selection of the destination provider
   * @param destination The destination provider
   */
  const handleDestinationSelection = (destination: BaseProvider) => {
    setSelectedDestination(prevDestination => prevDestination && prevDestination.name === destination.name ? null : destination);
  };

  /**
   * Handles logging in to the source provider
   */
  const handleContinueSource = async () => {
    const loggedIn = await selectedSource?.LogIn();
    if (loggedIn) {
      setSource(selectedSource);
    }
  }

  /**
   * Handles logging in to the destination provider
   */
  const handleContinueDestination = async () => {
    const loggedIn = await selectedDestination?.LogIn();
    if (loggedIn) {
      setDestination(selectedDestination);
      setShowOptions(true);
    }
  }

  /**
   * Handles the transfer of the playlists from the source to the destination
   */
  const HandleTransfer = async (option: string) => {
    if (option === 'sync') {
      const source1 = new Set(selectedSourcePlaylists.map((playlist) => source?.GetPlaylistName(playlist) ?? ""));
      const destination1 = new Set(selectedDestinationPlaylists.map((playlist) => destination?.GetPlaylistName(playlist) ?? ""));

      const missingInSource: string[] = [...new Set([...destination1].filter(x => !source1.has(x)))];
      const missingInDestination: string[] = [...new Set([...source1].filter(x => !destination1.has(x)))];

      console.log("The following are missing in the source: ", missingInSource);
      console.log("The following are missing in the destination: ", missingInDestination);
    }

    if (option === 'transfer') {

      if (selectedSourcePlaylists.length === 0) {
        alert('Please select at least one playlist to transfer');
        return;
      }

      console.log(selectedSourcePlaylists);

      setSelectedOption("TRANSFER");

      switch (destination?.name) {
        case "Spotify":
          // await source?.TransferPlaylistsToSpotify(destination, selectedSourcePlaylists);
          break;
        case "Apple Music":
          // await source?.TransferPlaylistsToAppleMusic(destination, selectedSourcePlaylists);
          break;
        default:
          break;
      }
    }

    // TODO: TransferPlaylistsToSpotify and TransferPlaylistsToAppleMusic should return a boolean
    setIsTransfered(true);
  }

  return (
    <div className="flex h-screen bg-[#f8f8f8] flex-col items-center">
      <section className="w-full tails-selected-element">
        <div className="px-10 py-20 mx-auto max-w-7xl">
          <div className="w-full mx-auto text-left md:text-center">
            <h1 className="mb-6 text-5xl font-extrabold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl md:tracking-tight"> Open Source <span className="w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 lg:inline">Universal Music Library Transfer</span><br className="lg:block hidden" /></h1>
            <p className="px-0 mb-6 text-gray-600 text-lg lg:px-24">Transfer your music library from one platform to another and vice versa with <span className='font-bold'>NO SONG LIMIT.</span> Currently supports Apple Music, Spotify, and more to come! Begin by selecting your source music streaming service.</p>
          </div>
        </div>
      </section>
      <section className="bg-[#f8f8f8] h-full w-full pb-14 tails-selected-element flex items-center justify-center space-x-10">
        <div className="relative">
          <DisplayBox title={!source ? "Select Your Source" : "Select Playlists"}>
            {
              !source ?
                // If no source is selected, show the source providers
                <MusicProviderSelection
                  selectedProvider={selectedSource}
                  providers={providers}
                  handleSelection={handleSourceSelection}
                  handleContinue={handleContinueSource}
                /> :
                // If a source is selected, show the playlists from the source
                <Playlists
                  provider={source}
                  selectedPlaylists={selectedSourcePlaylists}
                  setSelectedPlaylists={setSelectedSourcePlaylists} />
            }
          </DisplayBox>
        </div>
        <div className="sm:relative bg-[#f8f8f8] sm:flex sm:flex-col">
          <DisplayBox title={!showOptions ? "Select Your Destination" : "Select an Option"}>
            {!showOptions ?
              <MusicProviderSelection
                selectedProvider={selectedDestination}
                // Remove the source provider from the list of providers
                providers={providers.filter((provider) => provider.name !== source?.name)}
                handleSelection={handleDestinationSelection}
                handleContinue={handleContinueDestination}
              /> :
              selectedOption == "NONE" ?
                <div>
                  <DefaultButton onClick={() => HandleTransfer('transfer')} disabled={false} text="Transfer" />
                  <DefaultButton onClick={() => HandleTransfer('sync')} disabled={false} text="Sync" />
                </div>
                :
                selectedOption == "TRANSFER" ?
                  <Transfer
                    source={source!}
                    destination={destination!}
                    playlists={selectedSourcePlaylists}
                  />
                  :
                  <div>Synced</div>
            }
          </DisplayBox>
        </div>
      </section>
      <Footer />
    </div >
  )
}

export default Home;