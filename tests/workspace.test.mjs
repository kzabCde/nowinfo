import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWorkspace,validateWorkspace,mergeWorkspace,interestMatches} from '../lib/workspace.mjs';
test('interests use literal keyword boundaries and explicit country mentions',()=>{
 const interests={topics:[],countries:['th'],keywords:['AI','oil','C++']};
 assert.equal(interestMatches({title:'Officials said spoiler ahead'},interests).matched,false);
 assert.deepEqual(interestMatches({title:'Thailand announces AI plan'},interests).countries,['th']);
 assert.deepEqual(interestMatches({title:'C++ standard update'},interests).keywords,['C++']);
});
test('workspace validates imported interests and merges backups without wiping current choices',()=>{
 assert.throws(()=>validateWorkspace({version:3,interests:{topics:['invented'],countries:[],keywords:[]}}));
 assert.throws(()=>validateWorkspace({version:3,interests:{topics:[],countries:[],keywords:['x'.repeat(61)]}}));
 const a=emptyWorkspace(),b=emptyWorkspace();a.interests.keywords=['AI'];b.interests.keywords=['ai','oil'];
 assert.equal(mergeWorkspace(a,b).interests.keywords.length,2);
 assert.equal(mergeWorkspace(a,b).interests.keywords.includes('oil'),true);
});
