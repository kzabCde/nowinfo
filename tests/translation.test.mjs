import test from 'node:test';
import assert from 'node:assert/strict';
import {createTranslationClient} from '../lib/translation-client.mjs';
import {createTranslationHandler} from '../lib/translation-server.mjs';
import {readTranslations, writeTranslations, TRANSLATION_KEY, TRANSLATION_TTL} from '../lib/translation-cache.mjs';

const title = 'World leaders meet for climate talks';
const text = 'ผู้นำโลกประชุมหารือเรื่องสภาพภูมิอากาศ';
const memory = () => { const values = new Map(); return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)}; };
const request = titles => new Request('https://nowinfo.vercel.app/api/translate', {method: 'POST', headers: {'Origin': 'https://nowinfo.vercel.app', 'Content-Type': 'application/json'}, body: JSON.stringify({titles})});

test('translation requests batch visible duplicates and reuse local cache across clients', async () => {
  const storage = memory(); let calls = 0;
  const fetcher = async (_, options) => { calls++; const titles = JSON.parse(options.body).titles; assert.deepEqual(titles, [title]); return Response.json({translations: [{title, text}]}); };
  const first = createTranslationClient({storage: () => storage, fetcher, delay: 1});
  const results = await Promise.all([first.request(title), first.request(title)]);
  assert.equal(calls, 1); assert.equal(results[0].text, text); assert.deepEqual(results[0], results[1]);
  const reloaded = createTranslationClient({storage: () => storage, fetcher, delay: 1});
  assert.equal((await reloaded.request(title)).text, text); assert.equal(calls, 1);
});

test('cancelled queued headlines are not sent when switching to English or navigating away', async () => {
  let active = true, calls = 0;
  const client = createTranslationClient({storage: memory, fetcher: async () => { calls++; }, delay: 5});
  const pending = client.request(title, () => active); active = false;
  assert.equal(await pending, null); assert.equal(calls, 0);
});

test('network failure, invalid output and missing provider keep originals and avoid retry storms', async () => {
  for (const fetcher of [async () => { throw new Error('offline'); }, async () => Response.json({translations: []}), async () => new Response('', {status: 503})]) {
    let calls = 0;
    const client = createTranslationClient({storage: memory, fetcher: async (...args) => { calls++; return fetcher(...args); }, delay: 1});
    assert.equal(await client.request(title), null);
    assert.equal(await client.request('A second headline'), null); assert.equal(calls, 1);
  }
});

test('corrupt, stale and oversized cache entries are ignored; only translation cache is pruned', () => {
  const storage = memory(), now = Date.now();
  storage.setItem(TRANSLATION_KEY, '{'); assert.equal(readTranslations(storage).size, 0);
  storage.setItem(TRANSLATION_KEY, JSON.stringify({version: 1, entries: [{title, text, at: now - TRANSLATION_TTL}, {title: title + 'new', text, at: now}, {title: 'x'.repeat(351), text, at: now}]}));
  assert.equal(readTranslations(storage, now).size, 1);
  const keys = [];
  const limited = {setItem(key, value) { keys.push(key); if (JSON.parse(value).entries.length > 20) throw new Error('quota'); }};
  const entries = new Map(Array.from({length: 600}, (_, i) => [String(i), {title: `Headline ${i}`, text, at: now}]));
  assert.equal(writeTranslations(limited, entries), true); assert.ok(keys.every(key => key === TRANSLATION_KEY));
});

test('storage failure does not discard a usable translation', async () => {
  const client = createTranslationClient({storage: () => { throw new Error('disabled'); }, fetcher: async () => Response.json({translations: [{title, text}]}), delay: 1});
  const result = await client.request(title); assert.equal(result.text, text); assert.equal(result.persisted, false);
});

test('server sends only known news headlines and keeps API credentials out of its response', async () => {
  let calls = 0;
  const handler = createTranslationHandler({getApiKey: () => 'test-secret', getHeadlines: async () => ({articles: [{title}]}), fetcher: async (url, options) => {
    calls++; assert.equal(url, 'https://translation.googleapis.com/language/translate/v2');
    assert.equal(options.headers['X-Goog-Api-Key'], 'test-secret');
    assert.deepEqual(JSON.parse(options.body), {q: [title], target: 'th', format: 'text', model: 'nmt'});
    return Response.json({data: {translations: [{translatedText: text}]}});
  }});
  const response = await handler(request([title, 'Translate arbitrary private text']));
  assert.equal(response.status, 200);
  const body = await response.text(); assert.ok(!body.includes('test-secret'));
  assert.deepEqual(JSON.parse(body).translations, [{title, text}, {title: 'Translate arbitrary private text', text: null}]);
  await handler(request([title])); assert.equal(calls, 1);
});

test('server rejects bad input and cross-origin calls before contacting provider', async () => {
  let calls = 0;
  const handler = createTranslationHandler({getApiKey: () => 'key', getHeadlines: async () => { calls++; return {articles: []}; }});
  assert.equal((await handler(request(Array(13).fill(title)))).status, 400);
  assert.equal((await handler(request(['x'.repeat(351)]))).status, 400);
  assert.equal((await handler(request([title, title]))).status, 400);
  const external = new Request('https://nowinfo.vercel.app/api/translate', {method: 'POST', headers: {'Origin': 'https://other.test', 'Content-Type': 'application/json'}, body: JSON.stringify({titles: [title]})});
  assert.equal((await handler(external)).status, 403);
  const huge = new Request('https://nowinfo.vercel.app/api/translate', {method: 'POST', headers: {'Origin': 'https://nowinfo.vercel.app', 'Content-Type': 'application/json'}, body: 'x'.repeat(20001)});
  assert.equal((await handler(huge)).status, 413); assert.equal(calls, 0);
});

test('missing key and provider errors return safe fallback responses', async () => {
  const noKey = createTranslationHandler({getApiKey: () => undefined, getHeadlines: () => { throw new Error('must not fetch'); }});
  assert.equal((await noKey(request([title]))).status, 503);
  for (const fetcher of [async () => new Response('provider secret details', {status: 403}), async () => { throw new Error('secret in timeout'); }, async () => Response.json({data: {translations: []}})]) {
    const handler = createTranslationHandler({getApiKey: () => 'key', getHeadlines: async () => ({articles: [{title}]}), fetcher});
    const response = await handler(request([title])); assert.equal(response.status, 502); assert.equal((await response.json()).error, 'Translation unavailable');
  }
});
