'use client';
import {useState} from 'react';
import {Plus,X} from 'lucide-react';
import {countryOptions,focusTopics} from '@/lib/focus.mjs';
import type {Interests} from '@/lib/types';

export default function InterestsEditor({value,onChange,lang}:{value:Interests;onChange:(value:Interests)=>void;lang:'th'|'en'}){
  const [term,setTerm]=useState('');
  const [message,setMessage]=useState('');
  const t=(th:string,en:string)=>lang==='th'?th:en;
  function toggle(key:'topics'|'countries',id:string){onChange({...value,[key]:value[key].includes(id)?value[key].filter(item=>item!==id):[...value[key],id]});}
  function addKeyword(e:React.FormEvent){
    e.preventDefault();const keyword=term.trim();
    if(!keyword)return;
    if(value.keywords.length>=20){setMessage(t('ติดตามคำสำคัญได้สูงสุด 20 คำ','Follow up to 20 keywords.'));return;}
    if(value.keywords.some(item=>item.toLowerCase()===keyword.toLowerCase())){setMessage(t('ติดตามคำนี้อยู่แล้ว','You already follow this keyword.'));return;}
    onChange({...value,keywords:[...value.keywords,keyword]});setTerm('');setMessage('');
  }
  return <details className="interests-editor panel" open>
    <summary>{t('เลือกเรื่องที่คุณสนใจ','Choose your interests')} <span>{value.topics.length+value.countries.length+value.keywords.length} {t('รายการ','selected')}</span></summary>
    <p>{t('ตรงกับข้อใดข้อหนึ่งก็จะแสดงในหน้าสำหรับคุณ คำสำคัญค้นจากหัวข่าวภาษาต้นฉบับ','A match with any selection appears in For you. Keywords search original-language headlines.')}</p>
    <fieldset><legend>{t('ประเด็น','Topics')}</legend><div className="interest-options">{focusTopics.map(topic=><label key={topic.id}><input type="checkbox" checked={value.topics.includes(topic.id)} onChange={()=>toggle('topics',topic.id)}/>{topic[lang]}</label>)}</div></fieldset>
    <fieldset><legend>{t('ประเทศที่กล่าวถึงในหัวข่าว','Countries mentioned in headlines')}</legend><div className="interest-options countries">{countryOptions.map(country=><label key={country.id}><input type="checkbox" checked={value.countries.includes(country.id)} onChange={()=>toggle('countries',country.id)}/>{country[lang]}</label>)}</div></fieldset>
    <form onSubmit={addKeyword}><label htmlFor="interest-keyword">{t('คำสำคัญ เช่น AI, oil, Thailand','Keywords, e.g. AI, oil, Thailand')}</label><div className="keyword-form"><input id="interest-keyword" value={term} maxLength={60} onChange={e=>setTerm(e.target.value)}/><button className="refresh" type="submit"><Plus size={16}/>{t('เพิ่ม','Add')}</button></div></form>
    <div className="keyword-tags">{value.keywords.map(keyword=><button type="button" key={keyword} onClick={()=>onChange({...value,keywords:value.keywords.filter(item=>item!==keyword)})} aria-label={t('เลิกติดตามคำ: ','Unfollow keyword: ')+keyword}>{keyword}<X size={14}/></button>)}</div>
    {message&&<p role="status">{message}</p>}
  </details>;
}
