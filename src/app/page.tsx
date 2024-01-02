"use client"
import React, { useEffect, useState } from 'react'
import { FetchLibrary, FetchPlaylists, FetchSongsFromPlaylist } from './apple';
import { AppleMusicApi } from './types/apple-music-api';
import { Page, Scopes, SpotifyApi, Track, Tracks } from '@spotify/web-api-ts-sdk';
import { AddSongsToPlaylist, SearchForSong } from './spotify';

function Home() {
  const [instance, setInstance] = useState<any>(null);
  const [playlists, setPlaylists] = useState<AppleMusicApi.Playlist[]>([]);

  // Fetch the Apple Music MusicKit instance on initial page load
  useEffect(() => {
    window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN,
      icon: 'https://raw.githubusercontent.com/Musish/Musish/assets/misc/authIcon.png'
    });

    setInstance(window.MusicKit.getInstance())
  }, []);

  // TODO: Need to move this to a different location
  // Need to make sure to make the instance a part of a class that can be accessed there
  const AppleMusicLogin = async () => {
    await instance.unauthorize();
    await instance.authorize().then((res: any) => console.log(res));

    // TODO: Once the user is logged in, the token needs to be stored somewhere
  }

  // TODO: Need to move this to a different location
  // Need to make sure to make the instance a part of a class that can be accessed there
  // SearchForSong()

  // TODO: Move this to a different location
  // Reference Musish
  const FetchAppleMusicLibrary = async () => {
    const apple_playlists = await FetchPlaylists();
    console.log(apple_playlists);
    setPlaylists(apple_playlists);
    // await FetchSongsFromPlaylist(apple_playlists[0].id)
  }

  const SearchForSongInSpotify = async () => {
    const songs: AppleMusicApi.Song[] = [];

    // Search for each song that was in Apple Music on Spotify
    for (const playlist of playlists) {
      const songsFromPlaylist = await FetchSongsFromPlaylist(playlist.id);
      songs.push(...songsFromPlaylist);
    }

    console.log("Fetched a total of " + songs.length + " songs.");

    const searchedSongs: Track[] = [];

    // Search for songs in Spotify
    for (const song of songs) {
      // console.log("Searching for " + song.attributes?.name + " by " + song.attributes?.artistName + '...');

      // TODO: Need to add try catch to catch 401, 403, 400, and 429
      const results: Tracks = await SearchForSong(
        song.attributes?.artistName ?? "",
        song.attributes?.name ?? "",
        song.attributes?.albumName ?? ""
      );

      // Add the found track from Spotify to the array
      let result = (results.tracks as unknown) as Page<Track>
      if (result?.items?.length) {
        searchedSongs.push(result.items[0])
      }
      else {
        console.log(`Could not find ${song.attributes?.name} by ${song.attributes?.artistName} on Spotify.`)
      }
    }

    const trackIds: string[] = searchedSongs.slice(0, 2).map(track => track.id);

    console.log("Adding songs to playlist")
    await AddSongsToPlaylist(trackIds);
    console.log("Created new playlist.");
  };

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
          <div className="flex h-full w-full bg-gray-300 rounded-md">
            <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">Source</h1>
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