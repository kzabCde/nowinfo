import {countryOptions,focusEvidence,focusTopics,mentionedCountries} from './focus.mjs';
export const WORKSPACE_KEY='nowinfo:workspace:v3';
export function emptyWorkspace(){return {version:3,interests:{topics:[],countries:[],keywords:[]}};}

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
  return {version:3,interests:{topics,countries,keywords}};
}
export function mergeWorkspace(current,incoming){
  const a=validateWorkspace(current),b=validateWorkspace(incoming);
  return validateWorkspace({version:3,interests:{topics:[...new Set([...a.interests.topics,...b.interests.topics])],countries:[...new Set([...a.interests.countries,...b.interests.countries])],keywords:[...new Map([...a.interests.keywords,...b.interests.keywords].map(term=>[term.toLowerCase(),term])).values()].slice(0,20)}});
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
