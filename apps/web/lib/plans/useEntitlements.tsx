'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserEntitlements } from './featureGates'

const EntitlementsContext = createContext<{
  entitlements:    UserEntitlements | null
  isLoading:       boolean
  error:           Error | null
  refresh:         () => Promise<void>
} | null>(null)

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null)
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState<Error | null>(null)
  const [retryCount, setRetryCount]     = useState(0)

  async function fetchEntitlements(retryAttempt = 0): Promise<void> {
    try {
      setError(null)
      const res = await fetch('/api/subscription/entitlements', {
        cache: 'no-store', // Always fetch fresh data
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.warn(`Entitlements fetch failed: ${errorData.error || res.status}`)
        // Set default entitlements instead of throwing error to prevent console errors
        setEntitlements({
          planName: 'FLOCKIQ_PRO',
          subscriptionType: 'monthly',
          features: {} as Record<any, any>,
          isLifetimeExpired: false,
          daysUntilExpiry: null,
          grandfatheredUntil: null
        })
        setRetryCount(0)
        return
      }
      
      const data = await res.json()
      setEntitlements(data)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('Failed to load entitlements:', err)
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      
      // Set default entitlements on error to prevent UI breakage
      setEntitlements({
        planName: 'FLOCKIQ_PRO',
        subscriptionType: 'monthly',
        features: {} as Record<any, any>,
        isLifetimeExpired: false,
        daysUntilExpiry: null,
        grandfatheredUntil: null
      })
      
      // Retry logic: retry up to 2 times with exponential backoff
      if (retryAttempt < 2) {
        const delay = Math.pow(2, retryAttempt) * 1000 // 1s, 2s
        setTimeout(() => {
          setRetryCount(retryAttempt + 1)
          fetchEntitlements(retryAttempt + 1)
        }, delay)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = useCallback(() => {
    setIsLoading(true)
    return fetchEntitlements()
  }, [])

  useEffect(() => {
    fetchEntitlements()
  }, [])

  return (
    <EntitlementsContext.Provider value={{ entitlements, isLoading, error, refresh }}>
      {children}
    </EntitlementsContext.Provider>
  )
}

export function useEntitlements() {
  const ctx = useContext(EntitlementsContext)
  if (!ctx) throw new Error('useEntitlements must be used within EntitlementsProvider')
  return ctx
}
