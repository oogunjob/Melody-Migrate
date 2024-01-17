import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BaseProvider } from '../types/sources';


interface Playlist {
  key: number;
  // Add other properties based on your actual playlist object structure
  // For example:
  name: string;
  // ... other properties
}

function Playlists({ provider, selectedPlaylists, setSelectedPlaylists }: { provider: BaseProvider, selectedPlaylists: Playlist[], setSelectedPlaylists: Dispatch<SetStateAction<Playlist[]>> }) {
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
  }, []);

  const handleToggleAll = () => {
    if (selectedPlaylists.length === playlists.length) {
      // All options are selected, clear selection
      setSelectedPlaylists([]);
    } else {
      // Not all options are selected, select all
      setSelectedPlaylists([...playlists]);
    }
  };

  const handleToggleOption = (playlist: Playlist) => {
    if (selectedPlaylists.find((selected) => selected.key === playlist.key)) {
      // Option is selected, unselect it
      setSelectedPlaylists(selectedPlaylists.filter((selected) => selected.key !== playlist.key));
    } else {
      // Option is not selected, select it
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  if (!isLoaded) {
    return (
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Select All section */}
      <div className="flex">
        <label className="flex items-center">
          <input className="text-black text-xl font-medium" type="checkbox" checked={selectedPlaylists.length === playlists.length} onChange={handleToggleAll} />
          <div className="text-black text-xl font-medium">Select All</div>
        </label>
      </div>

      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center">
          {playlists.map((playlist, index) => (
            <div key={index} onClick={() => handleToggleOption(playlist)} className={`w-40 h-40 flex flex-col items-center cursor-pointer ${selectedPlaylists.includes(playlist) ? 'border-4 border-indigo-500' : ''}`} >
              <div className={`w-20 h-20 bg-white rounded-[10px] shadow`}>
                <img src={`/icons/playlist_icon.svg`} alt={playlist.name} />
              </div>
              <label className="cursor-pointer">{provider.GetPlaylistName(playlist)}</label>
            </div>
          ))}
        </div>
      </div>






      {/* Continue section */}
      <div className="flex">
        <div className="text-black text-xl font-medium cursor-pointer">Continue</div>
      </div>
    </div>

  );
}

export default Playlists;