"use client"
import React, { useEffect, useState } from 'react'
import { FetchLibrary, FetchPlaylists, FetchSongsFromPlaylist } from './apple/utils';
import { AppleMusicApi } from './types/apple-music-api';
import { Page, Scopes, SpotifyApi, Track, Tracks } from '@spotify/web-api-ts-sdk';
import { AddSongsToPlaylist, SearchForSong } from './spotify/utils';

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
      if (result?.items?.length)
      {
        searchedSongs.push(result.items[0])
      }
      else{
        console.log(`Could not find ${song.attributes?.name} by ${song.attributes?.artistName} on Spotify.`)
      }
    }

    const trackIds: string[] = searchedSongs.slice(0, 2).map(track => track.id);

    console.log("Adding songs to playlist")
    await AddSongsToPlaylist(trackIds);
    console.log("Created new playlist.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div>
          <button onClick={AppleMusicLogin}> Log In To Apple Music</button>
        </div>

        <button onClick={FetchAppleMusicLibrary}>Fetch Apple Music Playlists</button>

        {/* Playlists */}
        <div>
          Playlists
          Your Library
          {playlists.map((playlist, index) => {
            return (
              <div key={index}>
                {playlist.attributes?.name}
              </div>
            )
          })}

          {/* Search for Songs in Playlist */}
          <button onClick={SearchForSongInSpotify}>Search For Songs In Spotify</button>
        </div>
      </div>
    </main >
  )
}

export default Home;