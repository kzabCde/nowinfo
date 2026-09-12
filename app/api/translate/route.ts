import {collectNews} from '@/lib/news.mjs';
import {createTranslationHandler} from '@/lib/translation-server.mjs';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const POST = createTranslationHandler({
  getApiKey: () => process.env.GOOGLE_TRANSLATE_API_KEY,
  getHeadlines: collectNews
});
