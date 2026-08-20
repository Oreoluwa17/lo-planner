import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Fetches live rates relative to ZAR from open.er-api.com (free, no key needed)
// To convert X currency to ZAR: amount / rates[currency]
// e.g. $100 USD → 100 / rates.USD = ~R1,800
export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/ZAR', { cache: 'no-store' })
    const data = await res.json()
    if (data.result !== 'success') throw new Error('Rate fetch failed')
    return NextResponse.json({
      rates: {
        ZAR: 1,
        USD: data.rates.USD,
        NGN: data.rates.NGN,
        GBP: data.rates.GBP,
      },
      updated: data.time_last_update_utc,
    })
  } catch {
    // Fallback rates if API is unavailable
    return NextResponse.json({
      rates: { ZAR: 1, USD: 0.054, NGN: 88.5, GBP: 0.043 },
      updated: null,
      fallback: true,
    })
  }
}
