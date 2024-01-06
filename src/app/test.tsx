{showOptions && !selectedOption && (
    <div>
        <button onClick={() => setSelectedOption('transfer')}>Transfer Playlists From Source</button>
        <button onClick={() => setSelectedOption('sync')}>Sync Libraries</button>
    </div>
)}

{selectedOption === 'transfer' && (
    <div>
        <Playlists source={selectedProvider} selectedPlaylists={selectedPlaylists} setSelectedPlaylists={setSelectedPlaylists} />
    </div>
)}

{selectedOption === 'sync' && (
    <div>
        You've decided to sync your libraries
    </div>
)}