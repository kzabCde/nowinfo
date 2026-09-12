import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWorkspace,validateWorkspace,mergeWorkspace,interestMatches,observeWorkspace,setArticleRead,articleState,toggleTrackedEvent,isTrackedEvent} from '../lib/workspace.mjs';
import {clusterEvents} from '../lib/events.mjs';
test('interests use literal keyword boundaries and explicit country mentions',()=>{
 const interests={topics:[],countries:['th'],keywords:['AI','oil','C++']};
 assert.equal(interestMatches({title:'Officials said spoiler ahead'},interests).matched,false);
 assert.deepEqual(interestMatches({title:'Thailand announces AI plan'},interests).countries,['th']);
 assert.deepEqual(interestMatches({title:'C++ standard update'},interests).keywords,['C++']);
});
const article=(id,title='Japan earthquake triggers tsunami warning')=>({id,url:`https://example.com/${id}`,title,source:'BBC',regions:['asia'],publishedAt:'2026-09-12T01:00:00Z'});
test('reading status survives refresh, supports unread, and distinguishes newly discovered articles',()=>{
 const a=article('a'),b=article('b');let state=observeWorkspace(emptyWorkspace(),[a],100);
 state=setArticleRead(state,a,true,120);state=observeWorkspace(state,[a,b],200);
 assert.deepEqual(articleState(a,state.history,150),{read:true,isNew:false});
 assert.deepEqual(articleState(b,state.history,150),{read:false,isNew:true});
 state=setArticleRead(state,a,false,220);
 assert.equal(articleState(a,mergeWorkspace(state,setArticleRead(state,a,true,120)).history,150).read,false);
 assert.equal(articleState(b,state.history,0).isNew,false);
});
test('followed events survive representative changes and absorb new matching article links',()=>{
 const a=article('a'),b=article('b','Japan earthquake triggers major tsunami warning');
 let state=toggleTrackedEvent(emptyWorkspace(),clusterEvents([a])[0],100);
 state=observeWorkspace(state,[a,b],200);
 assert.equal(state.trackedEvents[0].urls.length,2);
 assert.equal(isTrackedEvent(clusterEvents([b])[0],state.trackedEvents),true);
 assert.equal(toggleTrackedEvent(state,clusterEvents([b])[0]).trackedEvents.length,0);
});
test('workspace validates imported interests and merges backups without wiping current choices',()=>{
 assert.throws(()=>validateWorkspace({version:3,interests:{topics:['invented'],countries:[],keywords:[]}}));
 assert.throws(()=>validateWorkspace({version:3,interests:{topics:[],countries:[],keywords:['x'.repeat(61)]}}));
 const a=emptyWorkspace(),b=emptyWorkspace();a.interests.keywords=['AI'];b.interests.keywords=['ai','oil'];
 assert.equal(mergeWorkspace(a,b).interests.keywords.length,2);
 assert.equal(mergeWorkspace(a,b).interests.keywords.includes('oil'),true);
});
