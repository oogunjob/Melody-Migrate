"use client"
import React, { useEffect, useState } from 'react';
import { AppleMusicAPI } from './apple';
import SpotifySDK from './spotify';
import { Scopes, SpotifyApi } from '@spotify/web-api-ts-sdk';

// TODO: Move this to a different file in types
interface Source {
  name: string;
  image: string;
  LogIn: () => Promise<void> | void;
}

function Home() {
  const [instance, setInstance] = useState<AppleMusicAPI>({} as AppleMusicAPI);
  const [spotifySDK, setSpotifySDK] = useState<SpotifySDK>({} as SpotifySDK);

  // Fetch the Apple Music MusicKit instance on initial page load
  useEffect(() => {
    window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
      icon: 'https://raw.githubusercontent.com/Musish/Musish/assets/misc/authIcon.png'
    });

    const musicKit = new AppleMusicAPI(window.MusicKit.getInstance());
    setInstance(musicKit);
  }, []);

  // TODO: Remove this and figure out a way to make it cleaner
  function LogInToSpotify()
  {
    return;
    // console.log("Got here")
    // const sdk = SpotifySDK.CreateSDK();
    // setSpotifySDK(new SpotifySDK(sdk))
  }

  // Available sources for playlist/library retrieval
  const sources: Source[] = [
    {
      name: "Apple Music",
      image: "",
      LogIn: () => instance.LogIn()
    },
    {
      name: "Spotify",
      image: "",
      LogIn: () => LogInToSpotify()
    },
  ];

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
              <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">Source</h1>
            </div>
            {
              sources.map((source, index) => (
                <div key={index} className='py-4'>
                  <button onClick={() => source.LogIn()}>{source.name}</button>
                </div>)
              )
            }
          </div>
          <div className="flex h-full w-full bg-gray-300 rounded-md">
            <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">Destination</h1>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home;