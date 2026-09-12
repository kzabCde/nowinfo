# GitHub and Vercel

## Connected project

- Repository: https://github.com/kzabCde/nowinfo
- Branch: `main`
- Vercel project: `nowinfo` in team `NowhereDev`
- Production: https://nowinfo.vercel.app/

The GitHub connection was verified on 2026-09-12. The Vercel project is linked to `kzabCde/nowinfo`. Use this existing project; do not create a duplicate to deploy updates.

## Local workflow

```bash
git clone https://github.com/kzabCde/nowinfo.git
cd nowinfo
npm ci
npm run dev
```

Create a feature branch and submit a pull request for subsequent changes. Merging into `main` lets Vercel's Git integration build and deploy production. Check that the resulting deployment is READY before reporting success.

Framework: Next.js. Root directory: repository root. Build command: `npm run build`. No environment variables are required for v0.1. No cron or paid data API is enabled. The RSS API fetches on demand and caches responses at the CDN.

Do not commit .env files, tokens, node_modules, .next or .vercel.

## Verification

- `/` must render the news desk.
- `/api/news` returns articles, source statuses and fetchedAt; 503 indicates all feeds failed.
- Check source timestamps and available source counts, not just HTTP 200.
- Verify search, filters, saved stories after reload, language switch, dialog Escape close and a narrow viewport.
- Roll back through the Vercel deployment history if a production change fails.

Official reference: https://vercel.com/docs/deployments/git/vercel-for-github
