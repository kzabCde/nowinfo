# Thai headline translation

Selecting TH translates headline text when it enters the viewport. Original text stays visible during loading and on any error. Successful results show “แปลอัตโนมัติ · Google” and an independent original/Thai toggle. Switching to EN displays the original and cancels queued requests for unmounted Thai components. Already submitted requests may finish and warm the cache.

This applies to event titles, followed stories, expanded timelines, feed/bookmark cards and the story dialog. Original source data stays unchanged: grouping, keyword filters and search still use original headline text. Translation does not summarize or infer impacts.

## Enable the service

1. Enable Google Cloud Translation Basic for your Google Cloud project.
2. Create an API key restricted to Cloud Translation, with provider quotas appropriate for your budget. The endpoint is public; the instance request cap below is not an account-wide spending limit.
3. Add `GOOGLE_TRANSLATE_API_KEY` as a server-only Vercel environment variable for Preview and/or Production, then redeploy the desired environment. Never use `NEXT_PUBLIC_` or store the key in localStorage. Local development uses `.env.local`.
4. Check a TH headline on that deployment. Confirm a real Thai result, original toggle, and cache reuse after reload.

Without the key the API returns 503; the UI keeps the original and says the translation is not ready. No demo translations are served. A key is not included in this repository.

Provider reference: https://docs.cloud.google.com/translate/docs/translate-text

## Data and limits

- Only public headline text is sent to Google via the Vercel API; user interests, bookmarks and reading history are not sent.
- Browser cache: `nowinfo:translations:th:v1`, exact original text as identity, up to 500 successful translations, 30 days. Cache is disposable and not included in JSON workspace backups. Quota fallback only reduces this translation cache; it never deletes saved news.
- Client batches at most 12 visible unique titles, deduplicates concurrent requests across components, uses a 22-second timeout, and pauses requests after errors (one minute, five minutes for missing configuration).
- Server validates same-origin JSON requests, caps request bodies at 20 KB and titles at 350 characters, and only sends current RSS headline text to the provider. Previously cached server translations can still be reused. Older saved or imported headlines absent from current feeds may stay in their original language unless a translation was cached previously.
- Server has a 30-request/minute cap per function instance, bounded ephemeral caches, and a 10-second provider timeout. This is best effort, not a distributed rate limit; use Google quotas to cap usage across instances. No database is required.
- All translated content is rendered as React text, never raw HTML. Names, abbreviations and short ambiguous headlines can be mistranslated; retain the source link and original text.

## Verification boundary

Automated tests use mock provider responses to check behavior and failure handling. A live provider translation must be verified after configuring the API key; passing mocks is not evidence of provider access or translation quality.
