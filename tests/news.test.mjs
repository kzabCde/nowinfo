import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeed,deduplicate,safeUrl,collectNews,sources} from '../lib/news.mjs';
const source=sources[0];
const rss=items=>`<rss><channel>${items}</channel></rss>`;
test('untrusted RSS: plain titles, valid URLs and honest dates',()=>{
 const xml=rss('<item><title><![CDATA[Oil &amp; gas <b>update</b>]]></title><link>https://example.com/news?utm_source=rss</link><pubDate>invalid</pubDate></item><item><title>Unsafe</title><link>javascript:alert(1)</link></item>');
 const result=parseFeed(xml,source);assert.equal(result.length,1);assert.equal(result[0].publishedAt,null);assert.equal(result[0].url,'https://example.com/news');assert.equal(result[0].category,'energy');assert.ok(!result[0].title.includes('<b>'));assert.equal(safeUrl('https://user:pass@example.com'),null);
});
test('reject invalid XML and entity declarations',()=>{assert.throws(()=>parseFeed('<rss>',source));assert.throws(()=>parseFeed('<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>',source));});
test('deduplicate URLs and normalized headlines across feeds',()=>{
 const items=parseFeed(rss('<item><title>Hello world</title><link>https://example.com/a</link></item><item><title>Hello, world!</title><link>https://example.com/b</link></item>'),source);assert.equal(deduplicate(items).length,1);
});
test('Atom links and future publication dates are handled',()=>{const a=parseFeed('<feed><entry><title>Report</title><link href="https://example.com/a"/><published>2100-01-01</published></entry></feed>',source);assert.equal(a[0].publishedAt,null);assert.equal(a[0].url,'https://example.com/a');});
test('one failed source does not erase successful feeds',async()=>{const result=await collectNews(async url=>{if(url.includes('federalreserve'))throw new Error('offline');return new Response(rss('<item><title>Headline</title><link>https://example.com/news</link></item>'));});assert.equal(result.articles.length,1);assert.equal(result.sources.filter(s=>s.status==='unavailable').length,1);});
test('all-source outage returns empty data with explicit statuses',async()=>{const result=await collectNews(async()=>{throw new Error('offline');});assert.deepEqual(result.articles,[]);assert.ok(result.sources.every(s=>s.status==='unavailable'));});
