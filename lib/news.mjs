import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createHash } from 'node:crypto';

import {sources} from './sources.mjs';
import {deduplicateArticles} from './article-identity.mjs';
import {inferRegions} from './regions.mjs';
export {sources};
export function safeUrl(value) {
  try { const u=new URL(String(value)); if(!['https:','http:'].includes(u.protocol)||u.username||u.password) return null; u.hash=''; for(const key of [...u.searchParams.keys()]) if(key.startsWith('utm_')||['at_medium','at_campaign'].includes(key)) u.searchParams.delete(key); return u.href; } catch { return null; }
}
export function plain(value) { return String(value ?? '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }
export function categorize(title, fallback) {
  if(/\b(oil|gas|opec|energy|petroleum|fuel|electricity)\b/i.test(title)||/(น้ำมัน|ก๊าซ|พลังงาน|ไฟฟ้า|เชื้อเพลิง)/.test(title)) return 'energy';
  if(/\b(climate|flood|hurricane|wildfire|emission|warming|drought|earthquake|pollution)\b/i.test(title)||/(น้ำท่วม|พายุ|ไฟป่า|ภัยแล้ง|แผ่นดินไหว|โลกร้อน|สิ่งแวดล้อม|มลพิษ|ฝุ่น|พีเอ็ม\s?2\.5|PM\s?2\.5)/i.test(title)) return 'climate';
  if(/\b(ai|artificial intelligence|semiconductor|cyber|chip|technology|digital)\b/i.test(title)||/(เอไอ|ปัญญาประดิษฐ์|เซมิคอนดักเตอร์|ไซเบอร์|ชิป|เทคโนโลยี|ดิจิทัล)/.test(title)) return 'technology';
  if(/\b(economy|economic|inflation|interest rates?|gdp|trade|markets?|stocks?|banking|finance)\b/i.test(title)||/(เศรษฐกิจ|เงินเฟ้อ|ดอกเบี้ย|จีดีพี|การค้า|ตลาดหุ้น|หุ้น|ธนาคาร|การเงิน)/.test(title)) return 'economy';
  return fallback;
}
export function parseFeed(xml, source, now=Date.now()) {
  if(/<!DOCTYPE|<!ENTITY/i.test(xml)||XMLValidator.validate(xml)!==true) throw new Error('Invalid XML');
  const tree=new XMLParser({ignoreAttributes:false,processEntities:true,parseTagValue:false,trimValues:true}).parse(xml);
  const entries=tree.rss?.channel?.item ?? tree.feed?.entry ?? tree['rdf:RDF']?.item;
  if (!entries) { if(tree.rss?.channel || tree.feed || tree['rdf:RDF']) return []; throw new Error('Unsupported feed'); }
  return (Array.isArray(entries)?entries:[entries]).slice(0,60).flatMap(item=>{
    const links=Array.isArray(item.link)?item.link:[item.link];
    const raw=links.find(l=>typeof l==='string'||!l?.['@_rel']||l?.['@_rel']==='alternate');
    const url=safeUrl(typeof raw==='object'?raw?.['@_href']:raw);
    const title=plain(typeof item.title==='object'?item.title['#text']:item.title).slice(0,350);
    const timestamp=Date.parse(item.pubDate??item.published??item.updated??item['dc:date']??'');
    if(!url||!title) return [];
    // Unknown/future dates stay unknown: never manufacture freshness.
    const publishedAt=Number.isFinite(timestamp)&&timestamp<=now+300000?new Date(timestamp).toISOString():null;
    const language=source.language==='th'||source.language==='en'?source.language:(/[ก-๙]/.test(title)?'th':'en');
    const market=source.market==='thailand'?'thailand':'global';
    return [{id:createHash('sha256').update(url).digest('hex').slice(0,20),title,url,publishedAt,sourceId:source.id,source:source.publisher,category:categorize(title,source.category),regions:inferRegions(title,source.region),language,market}];
  });
}
export function deduplicate(items) {
  return deduplicateArticles(items).sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
}
export async function collectNews(fetcher=fetch) {
  const results=await Promise.all(sources.map(async source=>{
    const checkedAt=new Date().toISOString();
    try {
      const response=await fetcher(source.url,{signal:AbortSignal.timeout(8500),cache:'no-store',headers:{'User-Agent':'NowInfo/0.3 RSS reader','Accept':'application/rss+xml, application/xml, text/xml'}});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader=response.body?.getReader();
      if(!reader) throw new Error('Empty body');
      const chunks=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000){await reader.cancel();throw new Error('Feed exceeds limit');}chunks.push(value);}
      const xml=Buffer.concat(chunks).toString('utf8');
      const items=parseFeed(xml,source);
      return {source:{...source,status:'ok',checkedAt,count:items.length},items};
    } catch { return {source:{...source,status:'unavailable',checkedAt,count:0},items:[]}; }
  }));
  return {articles:deduplicate(results.flatMap(x=>x.items)),sources:results.map(x=>x.source),fetchedAt:new Date().toISOString()};
}
