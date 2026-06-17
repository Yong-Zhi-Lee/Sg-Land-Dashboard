# SG Residential Land Bids Dashboard

Live dashboard showing EC and Private Residential GLS land bids from URA.
Auto-fetches from data.gov.sg every 24 hours. No API key needed.

## Deploy to Vercel (5 minutes)

1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import your GitHub repo
3. Leave all settings as default → click Deploy
4. Vercel gives you a URL like `your-project.vercel.app`

## Local development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Data sources

- **URA Sale Sites GeoJSON** — `data.gov.sg/datasets/d_0e2b42f98535686282031a42c9c7b05a`
  - All sites sold by URA from 1967, updated regularly
  - No API key required — fully public
- **Fallback data** — embedded in `src/app/page.js` from URA PDF + Excel uploads
  - Used when API is unreachable or returns incomplete EC data
