# NowInfo

NowInfo คือศูนย์รวมข่าวที่ช่วยตอบ 3 คำถาม: เกิดอะไรขึ้น → เกี่ยวข้องกับใคร → ควรติดตามอะไรต่อ มุ่งให้ผู้อ่านภาษาไทยเข้าใจความเชื่อมโยงของเหตุการณ์ระดับโลกกับชีวิต เศรษฐกิจ เทคโนโลยี พลังงาน สิ่งแวดล้อม และประเทศไทย

กลุ่มผู้ใช้เริ่มต้น: ผู้ติดตามสถานการณ์โลก นักศึกษา คนทำงาน และผู้ประกอบการที่ต้องการเปิดอ่านข่าวจากหลายหมวดในที่เดียว

Live: https://nowinfo.vercel.app/

A source-first world news desk by NowhereDev. Thai/English interface, live RSS headlines, topic filters, search, source health and browser-local reading lists.

## Run

Requires Node.js 22+.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. No database is required. The news desk works without API keys; optional Thai headline translation requires `GOOGLE_TRANSLATE_API_KEY` in `.env.local`.

```bash
npm test
npm run build
npm start
```

## What is implemented — v0.3 (review branch)

- Headline-evidence topic filters, conservative event grouping with publisher links and timelines.
- Local interests (topics, countries, literal keywords), followed events, reading status and newly discovered articles.
- Thailand view separates direct mentions from global trade, energy and tourism watch topics.
- Version 3 JSON backups include the local workspace and accept version 2 backups.
- Seventeen RSS feeds, including seven regional BBC feeds plus DW, France 24, Al Jazeera, CNA, Federal Reserve and UN News.
- Interactive world map with regional filters and a 24-hour publication activity chart.
- Dark/light themes, remembered across visits without an initial theme flash.
- Optional automatic Thai headline translation for visible stories, with original-title toggles, failure fallback and a 30-day local translation cache.
- Local news cache (up to 500 headlines / 7 days), persistent filters and JSON backup export/import.
- Safe XML parsing, bounded upstream requests, independent source failure handling.
- URL/headline deduplication, publication timestamps, keyword-based categories.
- Search, category/source filters, newest/oldest order, incremental listing.
- Native accessible story dialog linking to the publisher with general topic questions.
- Up to 100 saved stories in browser localStorage, UI language preference.
- Source status page, transparent methodology, responsive layout.
- `/api/news` with 5-minute CDN caching; client refresh while visible.

## Honest limitations

When Cloud Translation is configured, selecting TH requests automatic translations for visible headlines. Original titles remain available and are always used when translation is unavailable. Machine translation can be inaccurate, especially for names and ambiguous short text. Context prompts are general category questions, **not AI-generated analysis of the story**. There are no impact scores, accounts, automatic cross-device sync or server-side article archives. Event groups use headline similarity and can be imperfect. Source coverage is limited. Partial/all-source outages are shown explicitly; no fake headlines are used.

This project only displays feed headlines and links, not article bodies or publisher images. Review each provider's terms before commercial expansion.

## Documentation

- [Product plan / แผนโครงการ](docs/PROJECT-PLAN.th.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Verification report](docs/VERIFICATION.md)
- [Global dashboard and local storage design](docs/DASHBOARD-v0.2.md)

- [v0.3 scope, acceptance checks and limits](docs/PHASE-3.md)
- [Thai headline translation setup and limits](docs/TRANSLATION.md)

## Stack

Next.js App Router, React, TypeScript, fast-xml-parser and Lucide. Vercel deployment configuration is included. Dependency versions are pinned by package-lock.json.

## Repository and deployment

Repository: https://github.com/kzabCde/nowinfo

The existing Vercel project `nowinfo` in team `NowhereDev` is connected to this repository. Production branch: `main`. The initial direct deployment is live; subsequent source updates use the Git integration.
