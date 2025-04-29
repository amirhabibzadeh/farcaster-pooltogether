'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/frame-sdk'

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Initialize Farcaster SDK and hide splash screen when app is ready
        const initFarcaster = async () => {
            try {
                // Wait for a small delay to ensure content is loaded
                await new Promise(resolve => setTimeout(resolve, 100))
                await sdk.actions.ready()
                setIsReady(true)
            } catch (error) {
                console.error('Error initializing Farcaster SDK:', error)
                // Even if there's an error, we should still show the content
                setIsReady(true)
            }
        }

        initFarcaster()
    }, [])

    // Show nothing until we're ready to prevent flash of unstyled content
    if (!isReady) {
        return null
    }

    return <>{children}</>
} 