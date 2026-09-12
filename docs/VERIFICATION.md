# Verification — 2026-09-12

## Deployment

- Production URL: https://nowinfo.vercel.app/
- Vercel project: nowinfo, team NowhereDev
- Project ID: prj_iwdmQaH7PtDQp6FZl1d4tjDOGRrE
- Deployment ID: dpl_J4AuxviiwkaCJLDdoPR7hBPDWH6i
- Status: READY (verified through the connected Vercel app)
- Build duration: approximately 22 seconds
- Framework: Next.js 16.3.5
- Implementation source commit: d8ad1c0 (local commit; not pushed to GitHub)
- Vercel API reports deployment region iad1; source configuration requests sin1. Region alignment has not been verified for the function itself.

## Automated checks

`npm test`: 6/6 passing (unsafe RSS links and dates, malformed XML/entity declarations, deduplication, Atom links, partial source failure, total outage).

`npm run build`: passed, including TypeScript checking. Routes: `/` and `/api/news`.

## Production checks

- Public production URL opened without sign-in. The team alias may have different deployment protection; use the production URL above.
- `/api/news`: HTTP 200, all 6 feeds available in the checked response.
- Browser displayed 171 unique headlines at the time of verification; counts change over time.
- Keyword search for `oil` returned 3 matching stories.
- An unmatched search displayed an explicit empty state.
- Federal Reserve source filter returned 20 stories.
- Saved one story, navigated to saved list and reloaded: saved item persisted. Removed the test bookmark afterward.
- Opened story dialog: publisher URL and general category questions present; Escape closed it.
- Switched UI to English and checked the saved-list heading and source directory. Restored Thai.
- Desktop screenshot inspected; no horizontal overflow at observed viewport width 1363px.
- Browser extension emitted metadata errors unrelated to application source; this is not a claim of a full production error-log audit.
- Mobile breakpoints implemented in CSS; a separate mobile device/browser session was not exercised.

## GitHub connection follow-up

The user created `kzabCde/nowinfo` with an initial README. GitHub write access and Vercel linkage to that repository were verified on 2026-09-12. Application source is being imported on top of the existing initial commit, preserving the user-authored introduction. The direct deployment checks above predate this Git import; the Git-triggered deployment must be verified separately.

AI translation, event clustering, event-specific impact analysis, permanent storage and account synchronization are roadmap items, not shipped capabilities.

## v0.2 global dashboard — 2026-09-12 follow-up

- Git-triggered production deployment of `e0daa27` verified READY in Singapore (`sin1`).
- Live dashboard retrieved 17/17 feeds, 344 cached headlines and coverage in all 7 named regions at the time of inspection. Counts vary over time.
- `npm test`: 13/13 passed; `npm run build`: passed with TypeScript checks.
- Inspected dark and light desktop layouts. No horizontal overflow at 1363px viewport.
- Asia filter returned 54 stories; region selection and light theme persisted after reload.
- Saved a story, reloaded, and verified it remained in the reading list; removed the test bookmark afterward.
- Exported an actual JSON backup and imported it through the file chooser. The page confirmed a successful merge.
- Detected React hydration error #418. A separate DOM hydration reproduction traced it to multi-child SVG `<title>` text in the regional map. Changed the title to a single interpolated string; the same reproduction now reports zero recoverable hydration errors.
- Mobile layouts are implemented in CSS; this follow-up did not exercise a mobile browser viewport.
