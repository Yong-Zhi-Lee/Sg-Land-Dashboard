// Maps GLS land-bid sites to their eventual launched marketing/project name,
// for easier consumer reference (e.g. "Tampines St 95" -> "Rivelle").
// data.gov.sg's dataset only has the tender location, not the project name
// (that's only assigned once a developer markets the launch), so this is
// maintained by hand from public news sources and updated as new launches
// are confirmed. Anything not in this table shows "Not yet launched".
//
// Some streets have hosted more than one GLS tender (e.g. two separate EC
// parcels both called "Plantation Close"), so a few entries need the award
// date as well as the street name to disambiguate -- see
// PROJECT_NAMES_BY_DATE below.

// Simple substring match: works when the street name alone is unique.
// Both abbreviated ("St", "Ave") and full ("Street", "Avenue") forms are
// included since fallback data uses abbreviations but live API data may not.
export const PROJECT_NAMES = {
  // ── Executive Condominiums ──
  'Tampines St 95': 'Rivelle',
  'Tampines Street 95': 'Rivelle',
  'Jalan Loyang Besar': 'Coastal Cabana',
  'Tampines St 62B': 'Aurelle of Tampines',
  'Tampines Street 62B': 'Aurelle of Tampines',
  'Bukit Batok West Ave 5': 'Lumina Grand',
  'Bukit Batok West Avenue 5': 'Lumina Grand',
  'Bukit Batok West Ave 8': 'Altura',
  'Bukit Batok West Avenue 8': 'Altura',
  'Tampines St 62A': 'Tenet',
  'Tampines Street 62A': 'Tenet',
  'Tengah Garden Walk': 'Copen Grand',
  'Yishun Avenue 9': 'North Gaia',
  'Yishun Ave 9': 'North Gaia',
  'Fernvale Lane': 'Parc Greenwich',
  'Tampines Avenue 10': 'Parc Central Residences',
  'Tampines Ave 10': 'Parc Central Residences',
  'Anchorvale Crescent': 'OLA EC',
  'Sumang Walk': 'Piermont Grand',

  // ── Private residential ──
  'Cuscaden Road': 'Cuscaden Reserve',
  'Lentor Hills Road': 'Lentor Hills Residences', // Parcel A; Parcel B is disambiguated by date below
};

// Sites where the street name alone is ambiguous (multiple separate tenders
// share the same street name) -- keyed by `${streetSubstring}@${awardDate}`.
export const PROJECT_NAMES_BY_DATE = {
  // Two EC parcels at Plantation Close, Tengah (Hoi Hup/Sunway both times)
  'Plantation Close@2023-09-11': 'Novo Place',
  'Plantation Close@2024-02-14': 'Otto Place',

  // Two EC parcels at Canberra Link, Sembawang
  'Canberra Link@2018-09-10': 'Parc Canberra',
  'Canberra Link@2019-10-11': 'Provence Residence',

  // Lentor Hills Road has two GLS parcels (Parcel A vs Parcel B)
  'Lentor Hills Road@2022-01-26': 'Lentor Hills Residences',
  'Lentor Hills Road@2022-09-19': 'Lentoria',

  // Lentor Central has had four separate tenders over the years
  'Lentor Central@2021-07-29': 'Lentor Modern',
  'Lentor Central@2022-09-19': 'Hillock Green',
  'Lentor Central@2023-09-18': 'Lentor Central Residences',
  // 2026-03-06 GuocoLand tender not yet launched -- omitted on purpose

  // Lentor Gardens has had two tenders
  'Lentor Gardens@2023-04-13': 'Lentor Mansion',
  'Lentor Gardens@2025-04-09': 'Lentor Gardens Residences',
};

/**
 * Look up the marketing/project name for a GLS land-bid site.
 * @param {string} location - the tender location string, e.g.
 *   "Tampines E18 / Tampines St 95" (fallback format) or "Tampines St 95"
 *   (live API format) -- substring matching handles both.
 * @param {string} [awardDate] - 'YYYY-MM-DD' award date, used to disambiguate
 *   streets that have hosted more than one separate tender.
 * @returns {string|null} the project name, or null if not yet launched /
 *   not yet known.
 */
export function lookupProjectName(location, awardDate) {
  if (!location) return null

  if (awardDate) {
    for (const [key, name] of Object.entries(PROJECT_NAMES_BY_DATE)) {
      const at = key.lastIndexOf('@')
      const substr = key.slice(0, at)
      const date = key.slice(at + 1)
      if (awardDate === date && location.includes(substr)) return name
    }
  }

  for (const [substr, name] of Object.entries(PROJECT_NAMES)) {
    if (location.includes(substr)) return name
  }

  return null
}
