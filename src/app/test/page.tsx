<section className="h-[676px] w-full bg-white tails-selected-element">
{/* <div className="max-w-7xl px-5 flex space-x-5 w-full h-full items-center justify-center mx-auto"> */}
<div className="h-[607px] w-[554px] drop-shadow-xl bg-gray-300 rounded-3xl">
  <div>
    <h1 className="mb-6 text-4xl font-bold leading-none max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl md:tracking-tight">
      Source
    </h1>
  </div>
  {
    source ?
      // Display playlists to select and transfer
      <Playlists
        provider={source}
        selectedPlaylists={selectedSourcePlaylists}
        setSelectedPlaylists={setSelectedSourcePlaylists} />
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
      </div>
  }

</div>
{/* <div className="h-full w-full bg-gray-300 rounded-md">
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
              <Playlists
                provider={destination}
                selectedPlaylists={selectedDestinationPlaylists}
                setSelectedPlaylists={setSelectedDestinationPlaylists} />
                <button onClick={() => HandleTransfer('sync')}>Sync</button>
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
  </div> */}
{/* </div> */}
</section>