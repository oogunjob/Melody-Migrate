import React from 'react'
import '../../loading_spinner.css';

function LoadingSpinner() {
    return (
        <div className='flex justify-center items-center h-full'>
            <div className='loader'>
                <span className='stroke'></span>
                <span className='stroke'></span>
                <span className='stroke'></span>
                <span className='stroke'></span>
                <span className='stroke'></span>
                <span className='stroke'></span>
                <span className='stroke'></span>
            </div>
        </div>
    )
}

export default LoadingSpinner