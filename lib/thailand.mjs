import {matchesFocus,thailandEvidence} from './focus.mjs';

export const thailandLenses=[
  {id:'direct',th:'กล่าวถึงไทยโดยตรง',en:'Direct Thailand mentions',question:{th:'หัวข่าวกล่าวถึง Thailand, Thai หรือ Bangkok เปิดต้นทางเพื่อตรวจสอบบริบท',en:'The headline mentions Thailand, Thai or Bangkok. Check the source for context.'}},
  {id:'trade',th:'จับตาการค้า',en:'Watch trade',question:{th:'นโยบายหรือเส้นทางการค้าที่เปลี่ยนไปเกี่ยวข้องกับสินค้านำเข้าและส่งออกของไทยหรือไม่?',en:'Do changes in trade policy or routes involve Thai imports or exports?'}},
  {id:'energy',th:'จับตาพลังงาน',en:'Watch energy',question:{th:'ข่าวนี้ระบุการเปลี่ยนแปลงของราคาหรืออุปทานที่ไทยพึ่งพาหรือไม่?',en:'Does the reporting identify a price or supply change relevant to energy Thailand uses?'}},
  {id:'tourism',th:'จับตาท่องเที่ยว',en:'Watch tourism',question:{th:'ข้อจำกัดการเดินทางหรือเที่ยวบินที่เปลี่ยนไปเชื่อมโยงกับไทยหรือไม่?',en:'Do changes in travel restrictions or flights connect to Thailand?'}},
];
export function matchesThailandLens(article,lens){
  if(lens==='direct')return thailandEvidence(article).length>0;
  if(lens==='trade')return matchesFocus(article,'economy');
  if(lens==='energy')return matchesFocus(article,'energy');
  if(lens==='tourism')return /\b(tourism|tourists?|travel restrictions?|visas?|aviation|airlines?|air travel|border closures?)\b/i.test(article.title);
  return false;
}
