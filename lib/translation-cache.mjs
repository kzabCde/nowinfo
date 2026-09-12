export const TRANSLATION_KEY = 'nowinfo:translations:th:v1';
export const MAX_TRANSLATIONS = 500;
export const TRANSLATION_TTL = 30 * 86400000;
export const validTitle = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 350;
export const validTranslation = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1500 && /[\u0E00-\u0E7F]/u.test(value);

export function readTranslations(storage, now = Date.now()) {
  try {
    const raw = JSON.parse(storage.getItem(TRANSLATION_KEY) || 'null');
    if (raw?.version !== 1 || !Array.isArray(raw.entries)) return new Map();
    return new Map(raw.entries.filter(item => validTitle(item?.title) && validTranslation(item?.text) && Number.isFinite(item.at) && item.at <= now && now - item.at < TRANSLATION_TTL)
      .sort((a, b) => a.at - b.at).slice(-MAX_TRANSLATIONS).map(item => [item.title, item]));
  } catch { return new Map(); }
}

export function writeTranslations(storage, entries, now = Date.now()) {
  const recent = [...entries.values()].filter(item => now - item.at < TRANSLATION_TTL).sort((a, b) => b.at - a.at).slice(0, MAX_TRANSLATIONS);
  // Only shrink the translation cache. Never evict bookmarks or the workspace.
  for (const count of [MAX_TRANSLATIONS, 100, 20]) {
    try { storage.setItem(TRANSLATION_KEY, JSON.stringify({version: 1, entries: recent.slice(0, count)})); return true; } catch { /* Try a smaller cache. */ }
  }
  return false;
}
