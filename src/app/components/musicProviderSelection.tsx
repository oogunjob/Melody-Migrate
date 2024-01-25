import React from "react";
import DefaultButton from "./buttons/defaultButton";
import ProviderCard from "./buttons/providerCard";
import { BaseProvider } from "../types/sources";
import LoadingSpinner from "./animations/loadingSpinner";

function MusicProviderSelection({
    selectedProvider,
    providers,
    handleSelection,
    handleContinue,
}: {
    selectedProvider: any;
    providers: BaseProvider[];
    handleSelection: any;
    handleContinue: () => void;
}) {
    return (
        <div className="flex flex-col justify-between h-full p-8">
            <div className="flex justify-evenly">
                {providers.length === 0 ? (
                    <LoadingSpinner />
                ) : (
                    providers.map((source, index) => (
                        <div key={index}>
                            <ProviderCard
                                disabled={false}
                                provider={source}
                                isSelected={source.name === selectedProvider?.name}
                                onClick={() => handleSelection(source)}
                            />
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center mt-4">
                <DefaultButton onClick={handleContinue} disabled={selectedProvider === null} text="Continue" />
            </div>
        </div>
    );
}

export default MusicProviderSelection;
