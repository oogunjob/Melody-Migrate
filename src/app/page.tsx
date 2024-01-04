"use client"
import React, { useEffect, useState } from 'react';
import { AppleMusicAPI } from './apple';
import SpotifySDK from './spotify';
import Playlists from './components/playlists';
import { BaseProvider } from './types/sources';

// TODO: Once this is deployed, will need to make sure that the source cannot be accessed
// from regular browser.

function Home() {
  const [musicKitInstance, setMusicKitInstance] = useState<AppleMusicAPI>({} as AppleMusicAPI);
  const [source, setSource] = React.useState<BaseProvider | null | undefined>(null);
  const [destination, setDestination] = React.useState<BaseProvider | null | undefined>(null);
  const [selectedSource, setSelectedSource] = React.useState<BaseProvider | null>(null);
  const [selectedDestination, setSelectedDestination] = React.useState<BaseProvider | null>(null);

  const [selectedPlaylists, setSelectedPlaylists] = React.useState<any[]>([]);

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
    setMusicKitInstance(musicKit);
  }, []);

  // Available sources/destinations for playlist/library retrieval and transfer
  const providers: BaseProvider[] = [
    new SpotifySDK(SpotifySDK.CreateSDK()),
    musicKitInstance,
  ];

  const HandleSourceSelection = (source: BaseProvider) => {
    console.log("Selected Source: ", source?.name);
    setSelectedSource(prevSource => prevSource === source ? null : source);
  };

  const HandleDestinationSelection = (destination: BaseProvider) => {
    console.log("Selected Destination: ", destination?.name);
    setSelectedDestination(prevDestination => prevDestination === destination ? null : destination);
  };

    const HandleContinueSource = async () => {
        const loggedIn = await selectedSource?.LogIn();
        if (loggedIn) {
            setSource(selectedSource);
        }
    }

  const HandleContinueDestination = async () => {
    const loggedIn = await selectedDestination?.LogIn();
    if (loggedIn) {
      setDestination(selectedDestination);
    }
  }

  // TODO: Need to handle Spotify Liked Songs Library and Apple Music Added Songs Library

  const HandleTransfer = async () => {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section className="h-auto w-full bg-white tails-selected-element">
        <div className="px-10 py-24 mx-auto max-w-7xl">
          <div className="w-full mx-auto text-left md:text-center">
            <h1 className="mb-6 text-5xl font-extrabold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl md:tracking-tight"> Open Source <span className="w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 lg:inline">Universal Music Library Transfer</span><br className="lg:block hidden" /></h1>
            <p className="px-0 mb-6 text-lg text-gray-600 md:text-xl lg:px-24">Transfer your music library from one platform to another and vice versa. Currently supports Apple Music, Spotify, and more to come!</p>
          </div>
        </div>
      </section>
      <section className="h-[640px] w-full bg-white tails-selected-element">
        <div className="max-w-7xl px-5 flex space-x-5 w-full h-full items-center justify-center mx-auto">
          <div className="h-full w-full bg-gray-300 rounded-md">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">
                Select Source Platform
              </h1>
            </div>
            {
              source ?
                // Display playlists to select and transfer
                <Playlists source={source} selectedPlaylists={selectedPlaylists} setSelectedPlaylists={setSelectedPlaylists}/>
                :
                // Display sources to select
                <div>
                  {
                    providers.map((source, index) => (
                      <div key={index} className='py-4'>
                        <button onClick={() => HandleSourceSelection(source)}>{source.name}</button>
                      </div>)
                    )
                  }
                  <button onClick={HandleContinueSource} disabled={selectedSource === null}>Continue</button>
                </div>
            }
          </div>
          <div className="h-full w-full bg-gray-300 rounded-md">
            <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">Destination</h1>
            {
              destination ?
                // Transfer button
                <button onClick={HandleTransfer}>Transfer</button>
                :
                // Display destination to select
              <div>
                {
                  providers.filter((provider) => provider.name !== source?.name).map((destination, index) => (
                    <div key={index} className='py-4'>
                      <button onClick={() => HandleDestinationSelection(destination)}>{destination.name}</button>
                    </div>)
                  )
                }
                <button onClick={HandleContinueDestination} disabled={selectedDestination === null}>Continue</button>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home;