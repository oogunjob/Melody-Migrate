import { BaseProvider } from '@/app/types/sources'
import React from 'react'

function ProviderCard({ provider, isSelected, disabled, onClick }: { provider: BaseProvider, isSelected: Boolean, disabled: boolean, onClick: () => void }) {
  return (
    <div className={`flex flex-col items-center border-4 cursor-pointer ${isSelected ? 'border-indigo-600': ''}`} onClick={() => { if (!disabled) { onClick() } }}>
      <div className='h-[142px] w-[134px]'>
        <img src={`/icons/${provider.icon}`} alt="My Image" />
      </div>
      {provider.name}
    </div>
  )
}

export default ProviderCard