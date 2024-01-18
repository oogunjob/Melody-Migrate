import React from 'react'
import DefaultButton from './buttons/defaultButton'
import ProviderCard from './buttons/providerCard';
import { BaseProvider } from '../types/sources';

function MusicProviderSelection({ selectedProvider, providers, handleSelection, handleContinue }: { selectedProvider: any, providers: BaseProvider[], handleSelection: any, handleContinue: () => void }) {
    return (
        <>
            <div className="flex-1 border-b-2 border-blue-500 text-center [font-family:'Poppins-Medium',Helvetica] font-medium text-black text-[20px]">Select Source</div>
            <div className="flex-1 border-b-2 border-blue-500 flex-wrap flex justify-evenly">
                {
                    providers?.map((source, index) => (
                        <div key={index}>
                            <ProviderCard
                                disabled={false}
                                provider={source}
                                isSelected={source.name === selectedProvider?.name}
                                onClick={() => handleSelection(source)}
                            />
                        </div>
                    ))
                }
            </div>
            <div className="flex-1 flex justify-center items-center">
                <DefaultButton
                    onClick={handleContinue}
                    disabled={selectedProvider === null}
                    text='Continue'
                />
            </div>
        </>
    )
}

export default MusicProviderSelection;