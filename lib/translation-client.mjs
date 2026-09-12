import {readTranslations, writeTranslations, validTitle, validTranslation, MAX_TRANSLATIONS, TRANSLATION_TTL} from './translation-cache.mjs';

export function createTranslationClient({fetcher = (...args) => fetch(...args), storage = () => localStorage, now = () => Date.now(), delay = 80} = {}) {
  let cache, timer, running = false, cooldown = 0;
  const jobs = new Map();
  const getCache = () => {
    if (!cache) { try { cache = readTranslations(storage(), now()); } catch { cache = new Map(); } }
    return cache;
  };
  function schedule() { if (!timer && !running && jobs.size) timer = setTimeout(flush, delay); }
  function finish(title, result) {
    const job = jobs.get(title);
    jobs.delete(title);
    job?.consumers.forEach(consumer => consumer.resolve(consumer.active() ? result : null));
  }
  async function flush() {
    timer = undefined;
    for (const [title, job] of jobs) if (!job.consumers.some(consumer => consumer.active())) finish(title, null);
    const titles = [...jobs.keys()].slice(0, 12);
    if (!titles.length) return;
    if (now() < cooldown) { for (const title of [...jobs.keys()]) finish(title, null); return; }
    running = true;
    try {
      const response = await fetcher('/api/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({titles}), signal: AbortSignal.timeout(22000)});
      if (!response.ok) {
        cooldown = now() + (response.status === 503 ? 300000 : 60000);
        throw new Error('Translation unavailable');
      }
      const data = await response.json();
      if (!Array.isArray(data.translations) || data.translations.length !== titles.length) throw new Error('Invalid translation response');
      const results = titles.map((title, index) => {
        const item = data.translations[index];
        return item?.title === title && validTranslation(item.text) && item.text !== title ? {title, text: item.text, at: now()} : null;
      });
      for (const item of results) if (item) getCache().set(item.title, item);
      while (getCache().size > MAX_TRANSLATIONS) getCache().delete(getCache().keys().next().value);
      let persisted = true;
      if (results.some(Boolean)) { try { persisted = writeTranslations(storage(), getCache(), now()); } catch { persisted = false; } }
      for (const item of results) if (item) getCache().set(item.title, {...item, persisted});
      titles.forEach((title, index) => finish(title, results[index] ? {...results[index], persisted} : null));
    } catch {
      cooldown = Math.max(cooldown, now() + 60000);
      titles.forEach(title => finish(title, null));
    } finally { running = false; schedule(); }
  }
  return {
    request(title, active = () => true) {
      if (!validTitle(title) || !active()) return Promise.resolve(null);
      const cached = getCache().get(title);
      if (cached && now() - cached.at < TRANSLATION_TTL) return Promise.resolve({...cached, persisted: cached.persisted !== false});
      if (now() < cooldown) return Promise.resolve(null);
      return new Promise(resolve => {
        const job = jobs.get(title) || {consumers: []};
        job.consumers.push({resolve, active});
        jobs.set(title, job);
        schedule();
      });
    }
  };
}

// No browser storage or network access during server rendering.
export const headlineTranslations = createTranslationClient();
