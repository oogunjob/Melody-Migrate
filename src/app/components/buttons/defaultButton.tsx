import React from 'react'

function DefaultButton({ onClick, disabled, text }: { onClick: () => void, disabled: boolean, text: string }) {
    if (disabled) {
        return (
            <button onClick={onClick} className="w-[369px] h-[59px] bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
                {text}
            </button>
        )
    }

    return (
        <button onClick={onClick} className="w-[369px] h-[59px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">
            {text}
        </button>
    )
}

export default DefaultButton