import {focusEvidence,mentionedCountries} from './focus.mjs';
import {normalizedHeadline} from './article-identity.mjs';

const stopWords=new Set('a an the and or for to of in on at as by with from into over after before amid through is are was were be been being has have had will would could should may might can says said say new latest live news update updates watch report reports reported more how what why who when where about this that these those it its their they them we us you your our not but than also'.split(' '));
export function headlineTokens(title) {
  return [...new Set((title.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(word=>word.length>2&&!stopWords.has(word)))];
}

function shared(a,b) { const set=new Set(b);return a.filter(value=>set.has(value)); }
function features(article) {
  return {tokens:headlineTokens(article.title),countries:mentionedCountries(article.title),time:Date.parse(article.publishedAt||''),headline:normalizedHeadline(article.title)};
}

export function relatedHeadlines(a,b) {
  return relatedFeatures(features(a),features(b));
}
function relatedFeatures(left,right) {
  if(!Number.isFinite(left.time)||!Number.isFinite(right.time)||Math.abs(left.time-right.time)>72*3600000) return false;
  if(left.headline===right.headline) return true;
  if(left.countries.length&&right.countries.length&&!shared(left.countries,right.countries).length) return false;
  const intersection=shared(left.tokens,right.tokens).length;
  const union=new Set([...left.tokens,...right.tokens]).size;
  return intersection>=3&&intersection/Math.max(union,1)>=0.4;
}

function hash(text) {let value=2166136261;for(const c of text)value=Math.imul(value^c.charCodeAt(0),16777619);return (value>>>0).toString(36);}

export function clusterEvents(articles) {
  const groups=[];
  const indexed=new Map(articles.map(article=>[article.url,features(article)]));
  const ordered=[...articles].sort((a,b)=>(Date.parse(a.publishedAt)||0)-(Date.parse(b.publishedAt)||0)||a.url.localeCompare(b.url));
  for(const article of ordered) {
    // Complete-link grouping prevents chains of vaguely related stories from merging.
    const group=groups.find(group=>group.every(member=>relatedFeatures(indexed.get(member.url),indexed.get(article.url))));
    if(group)group.push(article);else groups.push([article]);
  }
  return groups.map(members=>{
    const articles=[...members].sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0)||a.url.localeCompare(b.url));
    const common=members.map(article=>headlineTokens(article.title)).reduce((a,b)=>shared(a,b));
    return {
      id:`event-${hash(members[0].url)}`,
      title:articles[0].title,articles,
      publishers:[...new Set(articles.map(article=>article.source))],
      regions:[...new Set(articles.flatMap(article=>article.regions))],
      topics:[...new Set(articles.flatMap(article=>focusEvidence(article).map(item=>item.id)))],
      countries:[...new Set(articles.flatMap(article=>mentionedCountries(article.title)))],
      sharedTerms:members.length>1?common.slice(0,8):[],
      latestAt:articles[0].publishedAt,
    };
  }).sort((a,b)=>(Date.parse(b.latestAt)||0)-(Date.parse(a.latestAt)||0)||a.id.localeCompare(b.id));
}
