"use client"
import React, { useEffect, useState } from 'react';
import { AppleMusicAPI } from './apple';
import SpotifySDK from './spotify';
import Playlists from './components/playlists';
import { BaseProvider } from './types/sources';
import Provider from './components/buttons/provider';
import Footer from './components/footer';
import DefaultButton from './components/buttons/defaultButton';

// TODO: Once this is deployed, will need to make sure that the source cannot be accessed
// from regular browser.
function Home() {
  const [source, setSource] = useState<BaseProvider | null | undefined>(null);
  const [destination, setDestination] = useState<BaseProvider | null | undefined>(null);
  const [selectedSource, setSelectedSource] = useState<BaseProvider | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BaseProvider | null>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<any[]>([]);
  const [providers, setProviders] = useState<BaseProvider[]>([]);
  const [isTransfered, setIsTransfered] = useState<Boolean>(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch the Apple Music MusicKit instance on initial page load
  // TODO: Whenever the user refreshes the browser, the user music token is lost
  // and the user needs to reauthenticate. This is a bug that needs to be fixed.
  // Currently throws a 403 error when trying to fetch the user's library
  useEffect(() => {
    window.MusicKit?.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
      icon: 'https://raw.githubusercontent.com/Musish/Musish/assets/misc/authIcon.png'
    });

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

    }

    if (option === 'transfer') {

      if (selectedPlaylists.length === 0) {
        alert('Please select at least one playlist to transfer');
        return;
      }

      console.log(selectedPlaylists);

      setSelectedOption('transfer');

      switch (destination?.name) {
        case "Spotify":
          await source?.TransferPlaylistsToSpotify(destination, selectedPlaylists);
          break;
        case "Apple Music":
          await source?.TransferPlaylistsToAppleMusic(destination, selectedPlaylists);
          break;
        default:
          break;
      }
    }

    // TODO: TransferPlaylistsToSpotify and TransferPlaylistsToAppleMusic should return a boolean
    setIsTransfered(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section className="h-auto w-full bg-white tails-selected-element">
        <div className="px-10 py-24 mx-auto max-w-7xl">
          <div className="w-full mx-auto text-left md:text-center">
            <h1 className="mb-6 text-5xl font-extrabold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl md:tracking-tight"> Open Source <span className="w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 lg:inline">Universal Music Library Transfer</span><br className="lg:block hidden" /></h1>
            <p className="px-0 mb-6 text-gray-600 text-lg lg:px-24">Transfer your music library from one platform to another and vice versa with <span className='font-bold'>NO SONG LIMIT.</span> Currently supports Apple Music, Spotify, and more to come! Begin by selecting your source music streaming service.</p>
          </div>
        </div>
      </section>
      <section className="h-[640px] w-full bg-white tails-selected-element">
        <div className="max-w-7xl px-5 flex space-x-5 w-full h-full items-center justify-center mx-auto">
          <div className="h-full w-full bg-gray-300 rounded-md">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">
                Source
              </h1>
            </div>
            {
              source ?
                // Display playlists to select and transfer
                <Playlists source={source} selectedPlaylists={selectedPlaylists} setSelectedPlaylists={setSelectedPlaylists} />
                :
                // Display sources to select
                <div>
                  {
                    providers.map((source, index) => (
                      <div key={index}>
                        <Provider
                          disabled={false}
                          provider={source}
                          isSelected={source.name === selectedSource?.name}
                          onClick={() => handleSourceSelection(source)}
                        />
                      </div>
                    ))
                  }
                  <DefaultButton
                    onClick={handleContinueSource}
                    disabled={selectedSource === null}
                    text='Continue'
                  />
                </div>
            }
          </div>
          <div className="h-full w-full bg-gray-300 rounded-md">
            <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">Destination</h1>
            {
              destination ?
                <div>
                  {showOptions && !selectedOption && (
                    <div>
                      <div>
                        <DefaultButton
                          onClick={() => HandleTransfer('transfer')}
                          disabled={false}
                          text='Transfer Playlists From Source'
                        />
                      </div>
                      <DefaultButton
                          onClick={() => setSelectedOption('sync')}
                          disabled={false}
                          text='Sync Libraries'
                        />
                    </div>
                  )}

                  {selectedOption === 'transfer' && (
                    <div>
                      Transferring
                    </div>
                  )}

                  {selectedOption === 'sync' && (
                    <div>
                      You've decided to sync your libraries
                    </div>
                  )}

                </div>
                :
                // Display destination to select
                <div>
                  {
                    providers.filter((provider) => provider.name !== source?.name).map((destination, index) => (
                      <div key={index}>
                        <Provider
                          disabled={source === null}
                          provider={destination}
                          isSelected={destination.name === selectedDestination?.name}
                          onClick={() => handleDestinationSelection(destination)}
                        />
                      </div>
                    )
                    )
                  }
                  <DefaultButton
                    onClick={handleContinueDestination}
                    disabled={(source !== null && selectedDestination === null) || source === null}
                    text='Continue'
                  />
                </div>
            }
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default Home;