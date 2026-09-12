import {focusTopics} from '@/lib/focus.mjs';
import type {Article} from '@/lib/types';
import {matchesFocus} from '@/lib/focus.mjs';

export default function FocusFilter({articles,value,onChange,lang}:{articles:Article[];value:string;onChange:(value:string)=>void;lang:'th'|'en'}) {
  const options=[{id:'all',th:'ข่าวทั้งหมด',en:'All headlines'},{id:'relevant',th:'ประเด็นที่คัดไว้',en:'Selected topics'},...focusTopics];
  return <div className="focus-filter"><div className="focus-options" aria-label={lang==='th'?'คัดข่าวตามประเด็น':'Filter by focus topic'}>{options.map(topic=><button type="button" key={topic.id} aria-pressed={value===topic.id} onClick={()=>onChange(topic.id)}>{topic[lang]}<span>{articles.filter(article=>matchesFocus(article,topic.id)).length}</span></button>)}</div><p>{lang==='th'?'คัดจากคำที่ปรากฏในหัวข่าว อาจคลาดเคลื่อน และไม่ได้วัดระดับผลกระทบ':'Selected by words in headlines. Matches can be imperfect and do not measure impact.'}</p></div>;
}
