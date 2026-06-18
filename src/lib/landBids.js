// Shared logic for fetching and parsing the URA "all sites" GeoJSON dataset
// from data.gov.sg. This runs SERVER-SIDE only (called from the API route),
// which avoids browser CORS restrictions that block direct client-side calls.

export const ALL_SITES_DATASET_ID = 'd_0e2b42f98535686282031a42c9c7b05a'

const EC_DEVT_TERMS = ['executive condominium', 'executive condo', ' ec ']
const RES_CODES = [
  'Residential (Non-Landed)',
  'Residential with Commercial at 1st Sty',
  'Residential & Residential with Commercial at 1st Sty',
  'Residential',
]

function parseDate(s) {
  if (!s) return ''
  const str = String(s)
  if (str.includes('-')) return str.slice(0, 10)
  const m = str.match(/(\d{4})(\d{2})(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
}

export function parseGeoJSON(text) {
  const geo = JSON.parse(text)
  const ec = [], priv = []
  ;(geo.features || []).forEach(f => {
    const p = f.properties || {}
    const code = (p.DEVT_CODE || '').trim()
    const devt = (p.DEVT_ALLOW || '').toLowerCase()
    const award = parseDate(p.DATE_AWARD)
    if (!award || !p.SUCCESS_TP) return

    const record = {
      location: p.LOCATION || '',
      planningArea: p.PLN_AREA_N || '',
      lease: parseInt(p.LEASE_YR) || 99,
      siteArea: parseFloat(p.SA_SQM) || 0,
      gfa: parseFloat(p.GFA) || 0,
      bids: parseInt(p.NO_OF_BIDS) || 0,
      tenderer: p.SUCCESS_TR || '',
      price: parseFloat(p.SUCCESS_TP) || 0,
      psmGfa: p.GFA && p.SUCCESS_TP ? Math.round(p.SUCCESS_TP / p.GFA) : 0,
      awardDate: award,
    }
    const isEC = EC_DEVT_TERMS.some(t => devt.includes(t))
    const isRes = RES_CODES.includes(code)
    if (isEC) ec.push(record)
    else if (isRes) priv.push(record)
  })
  return { ec, priv }
}

// Performs the data.gov.sg two-step download flow (initiate -> poll -> fetch file).
// Capped at ~24s of polling so it comfortably fits inside a 60s serverless timeout.
export async function fetchAllSitesFromDataGovSg() {
  const init = await fetch(
    `https://api-open.data.gov.sg/v1/public/api/datasets/${ALL_SITES_DATASET_ID}/initiate-download`,
    { method: 'GET' }
  )
  const initJson = await init.json()
  if (initJson.code !== 0) throw new Error(initJson.errMsg || 'initiate-download failed')

  for (let i = 0; i < 16; i++) {
    await new Promise(r => setTimeout(r, 1500))
    const poll = await fetch(
      `https://api-open.data.gov.sg/v1/public/api/datasets/${ALL_SITES_DATASET_ID}/poll-download`,
      { method: 'GET' }
    )
    const pollJson = await poll.json()
    if (pollJson.code === 0 && pollJson.data?.url) {
      const file = await fetch(pollJson.data.url)
      const text = await file.text()
      return parseGeoJSON(text)
    }
  }
  throw new Error('Poll timed out')
}
