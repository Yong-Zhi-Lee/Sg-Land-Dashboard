import { NextResponse } from 'next/server'
import { fetchAllSitesFromDataGovSg } from '@/lib/landBids'

// Allow this function up to 60s on Vercel (the data.gov.sg download flow can
// take 15-25s to become ready). Without this, the default timeout would cut
// the request off before data.gov.sg responds.
export const maxDuration = 60

export async function GET() {
  try {
    const { ec, priv } = await fetchAllSitesFromDataGovSg()
    if (!ec.length && !priv.length) {
      return NextResponse.json({ error: 'No data returned from data.gov.sg' }, { status: 502 })
    }
    return NextResponse.json({
      ec,
      priv,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 502 })
  }
}
