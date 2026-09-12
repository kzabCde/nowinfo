import {deduplicateArticles} from './article-identity.mjs';
import {regions,inferRegions} from './regions.mjs';
const categories=['world','economy','technology','energy','climate'];
export const CACHE_KEY='nowinfo:cache:v2';
export function validArticle(a){
 if(!a||typeof a!=='object'||!['id','title','url','sourceId','source'].every(k=>typeof a[k]==='string'&&a[k].trim().length>0)||!categories.includes(a.category))return null;
 let canonical;try{const url=new URL(a.url);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;url.hash='';for(const key of [...url.searchParams.keys()])if(key.startsWith('utm_')||['at_medium','at_campaign'].includes(key))url.searchParams.delete(key);canonical=url.href;}catch{return null;}
 return {id:a.id.slice(0,100),title:a.title.slice(0,350),url:canonical.slice(0,2000),sourceId:a.sourceId.slice(0,100),source:a.source.slice(0,100),category:a.category,publishedAt:typeof a.publishedAt==='string'&&Number.isFinite(Date.parse(a.publishedAt))?a.publishedAt:null,regions:Array.isArray(a.regions)&&a.regions.some(r=>regions.includes(r))?[...new Set(a.regions.filter(r=>regions.includes(r)))]:inferRegions(a.title)};
}
export function validData(input){
 if(!input||!Array.isArray(input.articles)||!Array.isArray(input.sources)||!Number.isFinite(Date.parse(input.fetchedAt)))return null;
 const sources=input.sources.filter(s=>s&&['id','name','publisher','site','url','checkedAt'].every(k=>typeof s[k]==='string')&&['ok','unavailable'].includes(s.status)&&categories.includes(s.category)&&Number.isFinite(s.count)&&s.count>=0&&/^https?:\/\//.test(s.site)&&/^https?:\/\//.test(s.url)).slice(0,50).map(s=>({...s,region:regions.includes(s.region)?s.region:'global'}));
 return {articles:input.articles.slice(0,2000).map(validArticle).filter(Boolean),sources,fetchedAt:new Date(input.fetchedAt).toISOString()};
}
export function mergeNews(fresh,previous,now=Date.now()){
 const articles=deduplicateArticles([...fresh.articles,...(previous?.articles||[])]).filter(a=>!a.publishedAt||Date.parse(a.publishedAt)>=now-7*86400000);
 articles.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
 return {...fresh,articles:articles.slice(0,500)};
}
// Never remove saved stories to make room for a disposable news cache.
export function persistCache(storage,data){
 for(const max of [500,150,30]){try{storage.setItem(CACHE_KEY,JSON.stringify({...data,articles:data.articles.slice(0,max)}));return true;}catch{}}
 return false;
}
export function loadCache(storage,now=Date.now()){
 try{const data=validData(JSON.parse(storage.getItem(CACHE_KEY)||'null'));if(!data||Date.parse(data.fetchedAt)<now-7*86400000)return null;return mergeNews(data,null,now);}catch{return null;}
}
