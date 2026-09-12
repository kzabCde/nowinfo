import test from 'node:test';
import assert from 'node:assert/strict';
import {focusEvidence,matchesFocus,mentionedCountries,thailandEvidence} from '../lib/focus.mjs';
test('focus selection exposes exact headline evidence without treating every world story as important',()=>{
  const story={title:'Central bank warns tariffs may raise inflation'};
  assert.deepEqual(focusEvidence(story)[0].terms,['Central bank','tariffs','inflation']);
  assert.equal(matchesFocus(story,'economy'),true);
  assert.equal(matchesFocus({title:'Football star wins tournament'},'relevant'),false);
  assert.equal(matchesFocus({title:'Energy drinks reviewed'},'energy'),false);
  assert.deepEqual(focusEvidence(story),focusEvidence(story));
});
test('Thailand is based on explicit mention, not an assumed economic impact',()=>{
  assert.deepEqual(thailandEvidence({title:'Oil prices rise globally'}),[]);
  assert.deepEqual(thailandEvidence({title:'Thai exports increase'}),['Thai']);
  assert.deepEqual(mentionedCountries('US and Thailand agree a trade deal'),['th','us']);
  assert.deepEqual(mentionedCountries('A question for us'),[]);
});

test('Thailand lenses separate explicit mentions from global topics to monitor',async()=>{
 const {matchesThailandLens}=await import('../lib/thailand.mjs');
 const globalOil={title:'Oil prices rise as OPEC cuts production'};
 assert.equal(matchesThailandLens(globalOil,'direct'),false);
 assert.equal(matchesThailandLens(globalOil,'energy'),true);
 assert.equal(matchesThailandLens({title:'Thailand reopens border crossing'},'direct'),true);
 assert.equal(matchesThailandLens({title:'Airlines cancel flights after travel restrictions'},'tourism'),true);
});
