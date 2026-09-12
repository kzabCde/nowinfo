'use client';
import {useMemo,useState} from 'react';
import {ArrowUpRight,Bookmark,Layers3,Search} from 'lucide-react';
import type {Article,NewsEvent} from '@/lib/types';
import {clusterEvents} from '@/lib/events.mjs';
import {focusTopics,matchesFocus} from '@/lib/focus.mjs';
import {regionNames,regions} from '@/lib/regions.mjs';
import FocusFilter from './focus-filter';

type Props={articles:Article[];lang:'th'|'en';loading:boolean;saved:Article[];onBookmark:(article:Article)=>void;onOpen:(article:Article)=>void};
export default function EventDesk({articles,lang,loading,saved,onBookmark,onOpen}:Props) {
  const [focus,setFocus]=useState('relevant');
  const [region,setRegion]=useState('all');
  const [query,setQuery]=useState('');
  const [limit,setLimit]=useState(18);
  const t=(th:string,en:string)=>lang==='th'?th:en;
  const events=useMemo(()=>clusterEvents(articles) as NewsEvent[],[articles]);
  const filtered=useMemo(()=>events.filter(event=>event.articles.some(article=>matchesFocus(article,focus))&&(region==='all'||event.regions.includes(region))&&event.articles.some(article=>`${article.title} ${article.source}`.toLowerCase().includes(query.trim().toLowerCase()))),[events,focus,region,query]);
  const date=(value:string|null)=>value?new Intl.DateTimeFormat(lang==='th'?'th-TH':'en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Bangkok'}).format(new Date(value)):t('ไม่ระบุเวลา','Time unavailable');
  return <section className="event-desk" aria-label={t('เหตุการณ์สำคัญ','Event desk')}>
    <div className="event-intro panel"><div><Layers3 size={23}/><h2>{t('หลายแหล่งข่าว เรื่องเดียวกัน','More sources. One story.')}</h2></div><p>{t('จัดกลุ่มจากคำในหัวข่าวและเวลาเผยแพร่ภายใน 72 ชั่วโมง ชื่อกลุ่มใช้หัวข่าวล่าสุด ไม่มีการสร้างข้อสรุปแทนสำนักข่าว','Grouped by headline similarity within 72 hours. Each group uses its latest headline, without generating a new factual summary.')}</p><span>{t('การจัดกลุ่มอัตโนมัติอาจคลาดเคลื่อน หลายสำนักข่าวอาจใช้รายงานต้นทางเดียวกัน','Automatic grouping can be imperfect. Different publishers may share the same original reporting.')}</span></div>
    <FocusFilter articles={articles} value={focus} onChange={value=>{setFocus(value);setLimit(18);}} lang={lang}/>
    <div className="event-controls"><label className="searchbox"><Search size={18}/><input aria-label={t('ค้นหาเหตุการณ์','Search events')} placeholder={t('ค้นหาเหตุการณ์หรือสำนักข่าว','Search headlines or publishers')} value={query} onChange={e=>{setQuery(e.target.value);setLimit(18);}}/></label><select aria-label={t('ภูมิภาคของเหตุการณ์','Event region')} value={region} onChange={e=>{setRegion(e.target.value);setLimit(18);}}><option value="all">{t('ทุกภูมิภาค','All regions')}</option>{regions.map(r=><option value={r} key={r}>{regionNames[lang][r as keyof typeof regionNames.th]}</option>)}</select></div>
    <div className="section-top event-result-count"><h2>{t('เหตุการณ์ที่พบ','Matching stories')}</h2><span>{filtered.length} {t('กลุ่ม','groups')} · {filtered.reduce((sum,event)=>sum+event.articles.length,0)} {t('บทความ','articles')}</span></div>
    {!filtered.length?<div className="empty-state"><h3>{loading&&!articles.length?t('กำลังรวบรวมข่าว','Gathering headlines'):t('ยังไม่พบเหตุการณ์ตามตัวกรอง','No matching stories')}</h3><p>{t('ลองเปลี่ยนประเด็น ภูมิภาค หรือคำค้น','Try another topic, region or search.')}</p><button className="text-button" onClick={()=>{setFocus('all');setRegion('all');setQuery('');}}>{t('ดูข่าวทั้งหมด','Show all headlines')}</button></div>:<div className="event-grid">{filtered.slice(0,limit).map(event=><article className="event-card panel" key={event.id}>
      <div className="event-card-top"><span>{event.publishers.length} {t('สำนักข่าว','publishers')} · {event.articles.length} {t('บทความ','articles')}</span><time>{date(event.latestAt)}</time></div>
      <button className="event-title" onClick={()=>onOpen(event.articles[0])}>{event.title}</button>
      <div className="event-tags">{event.topics.map(id=><span key={id}>{focusTopics.find(topic=>topic.id===id)?.[lang]}</span>)}</div>
      <p className="event-publishers">{event.publishers.join(' / ')}</p>
      {event.articles.length>1&&<p className="group-reason">{t('คำร่วมในหัวข่าว','Shared headline words')}: {event.sharedTerms.join(', ')}</p>}
      <details className="event-timeline"><summary>{t('ดูแหล่งข่าวและลำดับเวลา','Sources & timeline')} <ArrowUpRight size={15}/></summary><ol>{[...event.articles].reverse().map(article=><li key={article.url}><div><time>{date(article.publishedAt)} · {t('เวลาไทย','Bangkok')}</time><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}<ArrowUpRight size={14}/></a><span>{article.source}</span></div><button className={`bookmark ${saved.some(item=>item.url===article.url)?'bookmarked':''}`} aria-label={t('บันทึกบทความ: ','Save article: ')+article.title} aria-pressed={saved.some(item=>item.url===article.url)} onClick={()=>onBookmark(article)}><Bookmark size={17}/></button></li>)}</ol></details>
    </article>)}</div>}
    {filtered.length>limit&&<button className="load-more" onClick={()=>setLimit(limit+18)}>{t('ดูเหตุการณ์เพิ่มเติม','Load more stories')}</button>}
  </section>;
}
