'use client'
import { EntitlementsProvider } from '@/lib/plans/useEntitlements'

export function EntitlementsWrapper({ children }: { children: React.ReactNode }) {
  return <EntitlementsProvider>{children}</EntitlementsProvider>
}
