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

Open http://localhost:3000. No API keys or database required.

```bash
npm test
npm run build
npm start
```

## What is implemented

- Six RSS feeds: BBC World, Business, Technology, Science & Environment, Federal Reserve, UN News.
- Safe XML parsing, bounded upstream requests, independent source failure handling.
- URL/headline deduplication, publication timestamps, keyword-based categories.
- Search, category/source filters, newest/oldest order, incremental listing.
- Native accessible story dialog linking to the publisher with general topic questions.
- Up to 100 saved stories in browser localStorage, UI language preference.
- Source status page, transparent methodology, responsive layout.
- `/api/news` with 5-minute CDN caching; client refresh while visible.

## Honest limitations

Headlines remain in the publisher's language. Context prompts are general category questions, **not AI-generated analysis of the story**. No event clustering, translation, impact scores, accounts, cross-device sync or permanent article archive yet. Source coverage is limited. Partial/all-source outages are shown explicitly; no fake headlines are used.

This project only displays feed headlines and links, not article bodies or publisher images. Review each provider's terms before commercial expansion.

## Documentation

- [Product plan / แผนโครงการ](docs/PROJECT-PLAN.th.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Verification report](docs/VERIFICATION.md)

## Stack

Next.js App Router, React, TypeScript, fast-xml-parser and Lucide. Vercel deployment configuration is included. Dependency versions are pinned by package-lock.json.

## Repository and deployment

Repository: https://github.com/kzabCde/nowinfo

The existing Vercel project `nowinfo` in team `NowhereDev` is connected to this repository. Production branch: `main`. The initial direct deployment is live; subsequent source updates use the Git integration.
