import { BaseProvider } from '@/app/types/sources'
import React from 'react'

function ProviderCard({ provider, isSelected, disabled, onClick }: { provider: BaseProvider, isSelected: Boolean, disabled: boolean, onClick: () => void }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg w-[200px] h-[200px] cursor-pointer hover:bg-blue-200 ${isSelected ? 'bg-blue-200' : ''}`} onClick={() => { if (!disabled) { onClick() } }}>
      <div className='h-[142px] w-[134px]'>
        <img src={`/icons/${provider.icon}`} alt="My Image" />
      </div>
      <span className='text-lg'>{provider.name}</span>
    </div>
  )
}

export default ProviderCard