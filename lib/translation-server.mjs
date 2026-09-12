import {validTitle, validTranslation} from './translation-cache.mjs';

export function createTranslationHandler({getApiKey, getHeadlines, fetcher = fetch, now = () => Date.now()}) {
  let allowed, allowedUntil = 0, allowedRequest, windowStart = 0, requests = 0;
  const translated = new Map();
  const reply = (data, status = 200) => Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
  async function headlines() {
    if (allowed && now() < allowedUntil) return allowed;
    if (!allowedRequest) allowedRequest = Promise.resolve().then(getHeadlines).then(data => {
      allowed = new Set(data.articles.map(article => article.title));
      allowedUntil = now() + 300000;
      return allowed;
    }).finally(() => { allowedRequest = undefined; });
    return allowedRequest;
  }
  return async function POST(request) {
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) return reply({error: 'Forbidden'}, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({error: 'Expected JSON'}, 415);
    const key = getApiKey();
    if (!key) return reply({error: 'Translation unavailable'}, 503);
    // A bounded stream prevents untrusted bodies from using unlimited memory.
    let raw = '', size = 0;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply({error: 'Invalid request'}, 400);
      const decoder = new TextDecoder();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 20000) { await reader.cancel(); return reply({error: 'Request too large'}, 413); }
        raw += decoder.decode(value, {stream: true});
      }
      raw += decoder.decode();
    } catch { return reply({error: 'Invalid request'}, 400); }
    let titles;
    try { titles = JSON.parse(raw).titles; } catch { return reply({error: 'Invalid JSON'}, 400); }
    if (!Array.isArray(titles) || !titles.length || titles.length > 12 || !titles.every(validTitle) || new Set(titles).size !== titles.length) return reply({error: 'Invalid headlines'}, 400);
    if (now() - windowStart >= 60000) { windowStart = now(); requests = 0; }
    if (++requests > 30) return reply({error: 'Please try later'}, 429);
    try {
      // Restrict paid translation to actual current feed headlines, not arbitrary text.
      const known = await headlines();
      const missing = titles.filter(title => known.has(title) && !translated.has(title));
      if (missing.length) {
        const response = await fetcher('https://translation.googleapis.com/language/translate/v2', {
          method: 'POST', headers: {'Content-Type': 'application/json', 'X-Goog-Api-Key': key},
          body: JSON.stringify({q: missing, target: 'th', format: 'text', model: 'nmt'}), signal: AbortSignal.timeout(10000), cache: 'no-store'
        });
        if (!response.ok) return reply({error: 'Translation unavailable'}, 502);
        const data = await response.json();
        const output = data?.data?.translations;
        if (!Array.isArray(output) || output.length !== missing.length) return reply({error: 'Translation unavailable'}, 502);
        output.forEach((item, i) => { if (validTranslation(item?.translatedText)) translated.set(missing[i], item.translatedText); });
        while (translated.size > 500) translated.delete(translated.keys().next().value);
      }
      return reply({translations: titles.map(title => ({title, text: translated.get(title) || null}))});
    } catch { return reply({error: 'Translation unavailable'}, 502); }
  };
}
