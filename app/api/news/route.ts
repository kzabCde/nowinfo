import { collectNews } from '@/lib/news.mjs';
export const runtime='nodejs';
export const maxDuration=30;
export async function GET() {
  const data=await collectNews();
  const available=data.sources.some(s=>s.status==='ok');
  return Response.json(data,{status:available?200:503,headers:{'Cache-Control':available?'public, s-maxage=300, stale-while-revalidate=60':'no-store'}});
}
