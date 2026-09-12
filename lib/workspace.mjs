import {countryOptions,focusEvidence,focusTopics,mentionedCountries} from './focus.mjs';
import {clusterEvents} from './events.mjs';
export const WORKSPACE_KEY='nowinfo:workspace:v3';
export function emptyWorkspace(){return {version:3,interests:{topics:[],countries:[],keywords:[]},history:[],trackedEvents:[],lastVisitAt:0};}

function validUrl(value){try{const url=new URL(value);if(typeof value!=='string'||value.length>2000||!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error();return url.href;}catch{throw new Error('Invalid history link');}}
const validTime=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;

function allowedList(values,allowed,limit){
  if(!Array.isArray(values)||values.length>limit||values.some(value=>typeof value!=='string'||!allowed.includes(value)))throw new Error('Invalid interests');
  return [...new Set(values)];
}
export function validateWorkspace(value){
  if(!value||value.version!==3||!value.interests)throw new Error('Invalid workspace');
  const topics=allowedList(value.interests.topics,focusTopics.map(topic=>topic.id),10);
  const countries=allowedList(value.interests.countries,countryOptions.map(country=>country.id),50);
  const raw=value.interests.keywords;
  if(!Array.isArray(raw)||raw.length>20||raw.some(term=>typeof term!=='string'||!term.trim()||term.length>60))throw new Error('Invalid keywords');
  const keywords=[...new Map(raw.map(term=>[term.trim().toLowerCase(),term.trim()])).values()];
  const rawHistory=value.history??[],rawTracked=value.trackedEvents??[];
  if(!Array.isArray(rawHistory)||rawHistory.length>2000||!Array.isArray(rawTracked)||rawTracked.length>30)throw new Error('Workspace too large');
  const history=rawHistory.map(record=>{
    if(!record||!validTime(record.firstSeenAt)||!validTime(record.changedAt)||(record.readAt!==null&&!validTime(record.readAt)))throw new Error('Invalid reading history');
    return {url:validUrl(record.url),firstSeenAt:record.firstSeenAt,readAt:record.readAt,changedAt:record.changedAt};
  });
  const trackedEvents=rawTracked.map(event=>{
    if(!event||typeof event.id!=='string'||event.id.length>100||typeof event.title!=='string'||event.title.length>350||!Array.isArray(event.urls)||!event.urls.length||event.urls.length>50||!validTime(event.followedAt))throw new Error('Invalid followed event');
    return {id:event.id,title:event.title,urls:[...new Set(event.urls.map(validUrl))],followedAt:event.followedAt};
  });
  if(!validTime(value.lastVisitAt??0))throw new Error('Invalid visit timestamp');
  return {version:3,interests:{topics,countries,keywords},history,trackedEvents,lastVisitAt:value.lastVisitAt??0};
}
export function mergeWorkspace(current,incoming){
  const a=validateWorkspace(current),b=validateWorkspace(incoming);
  const history=new Map(a.history.map(record=>[record.url,record]));
  for(const record of b.history){const old=history.get(record.url);history.set(record.url,old?{...(old.changedAt>=record.changedAt?old:record),firstSeenAt:Math.min(old.firstSeenAt,record.firstSeenAt)}:record);}
  const trackedEvents=[...a.trackedEvents];
  for(const event of b.trackedEvents){const old=trackedEvents.find(item=>item.id===event.id||item.urls.some(url=>event.urls.includes(url)));if(old){old.urls=[...new Set([...old.urls,...event.urls])].slice(0,50);}else if(trackedEvents.length<30)trackedEvents.push(event);}
  return validateWorkspace({version:3,interests:{topics:[...new Set([...a.interests.topics,...b.interests.topics])],countries:[...new Set([...a.interests.countries,...b.interests.countries])],keywords:[...new Map([...a.interests.keywords,...b.interests.keywords].map(term=>[term.toLowerCase(),term])).values()].slice(0,20)},history:boundHistory([...history.values()]),trackedEvents,lastVisitAt:a.lastVisitAt});
}
function boundHistory(history){return [...history].sort((a,b)=>Math.max(b.changedAt,b.firstSeenAt)-Math.max(a.changedAt,a.firstSeenAt)||a.url.localeCompare(b.url)).slice(0,2000);}
export function isTrackedEvent(event,trackedEvents){return trackedEvents.some(item=>event.articles.some(article=>item.urls.includes(article.url)));}
export function toggleTrackedEvent(workspace,event,now=Date.now()){
  if(isTrackedEvent(event,workspace.trackedEvents))return {...workspace,trackedEvents:workspace.trackedEvents.filter(item=>!event.articles.some(article=>item.urls.includes(article.url)))};
  if(workspace.trackedEvents.length>=30)return workspace;
  return {...workspace,trackedEvents:[{id:event.id,title:event.title,urls:event.articles.map(article=>article.url).slice(0,50),followedAt:now},...workspace.trackedEvents]};
}
export function observeWorkspace(workspace,articles,now=Date.now()){
  const known=new Set(workspace.history.map(record=>record.url));
  const additions=articles.filter(article=>!known.has(article.url)).map(article=>({url:article.url,firstSeenAt:now,readAt:null,changedAt:0}));
  const events=workspace.trackedEvents.length?clusterEvents(articles):[];
  let changed=additions.length>0;
  const trackedEvents=workspace.trackedEvents.map(tracked=>{
    const matching=events.filter(event=>event.articles.some(article=>tracked.urls.includes(article.url)));
    const urls=[...new Set([...matching.flatMap(event=>event.articles.map(article=>article.url)),...tracked.urls])].slice(0,50);
    if(urls.join('\n')===tracked.urls.join('\n'))return tracked;
    changed=true;return {...tracked,urls};
  });
  return changed||workspace.lastVisitAt!==now?{...workspace,history:boundHistory([...workspace.history,...additions]),trackedEvents,lastVisitAt:now}:workspace;
}
export function setArticleRead(workspace,article,read,now=Date.now()){
  const old=workspace.history.find(record=>record.url===article.url);
  const record={url:article.url,firstSeenAt:old?.firstSeenAt??now,readAt:read?now:null,changedAt:now};
  return {...workspace,history:boundHistory([record,...workspace.history.filter(item=>item.url!==article.url)])};
}
export function articleState(article,history,baseline){
  const record=history.find(item=>item.url===article.url);
  return {read:record?.readAt!=null,isNew:baseline>0&&record?.readAt==null&&(record?.firstSeenAt??0)>baseline};
}
export function hasInterests(interests){return interests.topics.length+interests.countries.length+interests.keywords.length>0;}
export function interestMatches(article,interests){
  const topics=focusEvidence(article).filter(item=>interests.topics.includes(item.id)).map(item=>item.id);
  const countries=mentionedCountries(article.title).filter(id=>interests.countries.includes(id));
  const keywords=interests.keywords.filter(term=>{
    // Literal, boundary-aware matching: "oil" does not match "spoiler" and "AI" does not match "said".
    const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,'iu').test(article.title);
  });
  return {topics,countries,keywords,matched:topics.length+countries.length+keywords.length>0};
}
