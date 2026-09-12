import test from 'node:test';
import assert from 'node:assert/strict';
import {clusterEvents,relatedHeadlines} from '../lib/events.mjs';
import {deduplicate} from '../lib/news.mjs';
import {mergeNews} from '../lib/storage.mjs';
const story=(id,title,source='BBC News',date='2026-09-12T06:00:00Z')=>({id,title,source,sourceId:'feed',url:`https://example.com/${id}`,publishedAt:date,category:'world',regions:['asia']});
test('cross-publisher copies remain available while repeated publisher feeds collapse',()=>{
 const a=story('a','Japan earthquake triggers tsunami warning');const b=story('b',a.title,'DW');const c=story('c',a.title);
 assert.equal(deduplicate([a,b,c]).length,2);
 assert.equal(mergeNews({articles:[a,b],sources:[],fetchedAt:a.publishedAt},null,Date.parse(a.publishedAt)).articles.length,2);
 assert.equal(clusterEvents([a,b])[0].publishers.length,2);
});
test('similar headlines group but unrelated same-country stories and old events stay separate',()=>{
 const a=story('a','Japan earthquake triggers tsunami warning');const b=story('b','Japan earthquake triggers major tsunami warning','DW');
 assert.equal(relatedHeadlines(a,b),true);
 assert.equal(relatedHeadlines(a,story('c','Japan central bank raises interest rates')),false);
 assert.equal(relatedHeadlines(a,story('d',a.title,'DW','2026-09-01T00:00:00Z')),false);
 assert.equal(relatedHeadlines(a,story('e',a.title,'DW',null)),false);
 assert.equal(relatedHeadlines(a,story('f','Chile earthquake triggers tsunami warning')),false);
 assert.deepEqual(clusterEvents([a,b]),clusterEvents([b,a]));
});
