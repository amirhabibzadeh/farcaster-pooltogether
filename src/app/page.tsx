'use client'

import { useEffect, useState } from 'react'
import { GrandPrize } from '@components/GrandPrize'
import { Vault } from '@components/Vault'
import { VAULT_LIST } from '@constants/config'

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <GrandPrize className='my-12' />
      <div className='flex gap-8 flex-wrap'>
        {VAULT_LIST.tokens.map((vault) => (
          <div key={`${vault.chainId}-${vault.address}`} className={!isMounted ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
            <Vault {...vault} />
          </div>
        ))}
      </div>
    </div>
  )
}
