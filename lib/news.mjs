import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createHash } from 'node:crypto';

import {sources} from './sources.mjs';
import {inferRegions} from './regions.mjs';
export {sources};
export function safeUrl(value) {
  try { const u=new URL(String(value)); if(!['https:','http:'].includes(u.protocol)||u.username||u.password) return null; u.hash=''; for(const key of [...u.searchParams.keys()]) if(key.startsWith('utm_')||['at_medium','at_campaign'].includes(key)) u.searchParams.delete(key); return u.href; } catch { return null; }
}
export function plain(value) { return String(value ?? '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }
export function categorize(title, fallback) {
  if(/\b(oil|gas|opec|energy|petroleum|fuel|electricity)\b/i.test(title)) return 'energy';
  if(/\b(climate|flood|hurricane|wildfire|emission|warming|drought|earthquake)\b/i.test(title)) return 'climate';
  if(/\b(ai|artificial intelligence|semiconductor|cyber|chip|technology)\b/i.test(title)) return 'technology';
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
    return [{id:createHash('sha256').update(url).digest('hex').slice(0,20),title,url,publishedAt,sourceId:source.id,source:source.publisher,category:categorize(title,source.category),regions:inferRegions(title,source.region)}];
  });
}
export function deduplicate(items) {
  const byUrl=new Map(),byTitle=new Map(),result=[];
  for(const item of items){
    const key=item.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
    const previous=byUrl.get(item.url)||byTitle.get(key);
    if(previous){const merged=[...new Set([...(previous.regions||['global']),...(item.regions||['global'])])];previous.regions=merged.length>1?merged.filter(r=>r!=='global'):merged;byUrl.set(item.url,previous);byTitle.set(key,previous);}
    else{const copy={...item};result.push(copy);byUrl.set(item.url,copy);byTitle.set(key,copy);}
  }
  return result.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
}
export async function collectNews(fetcher=fetch) {
  const results=await Promise.all(sources.map(async source=>{
    const checkedAt=new Date().toISOString();
    try {
      const response=await fetcher(source.url,{signal:AbortSignal.timeout(8500),cache:'no-store',headers:{'User-Agent':'NowInfo/0.2 RSS reader','Accept':'application/rss+xml, application/xml, text/xml'}});
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
