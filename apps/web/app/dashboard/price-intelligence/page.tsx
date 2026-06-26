import { redirect } from 'next/navigation'

// Old route: /dashboard/price-intelligence
// → 301 permanent redirect to new dedicated forecast screen
export default function PriceIntelligenceRedirect() {
  redirect('/dashboard/price-intelligence/forecast')
}
