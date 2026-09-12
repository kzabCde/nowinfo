// Headline evidence only. Matching a topic does not measure severity or verify a claim.
export const focusTopics = [
  {id:'conflict',th:'ความขัดแย้ง',en:'Conflict',pattern:/\b(war|wars|ceasefire|invasion|missiles?|airstrikes?|military|nuclear|sanctions?|peace talks|armed conflict|defen[cs]e pact)\b/gi},
  {id:'economy',th:'เศรษฐกิจโลก',en:'Global economy',pattern:/\b(tariffs?|trade deal|trade war|inflation|interest rates?|central bank|federal reserve|recession|supply chains?|exports?|imports?|gdp|debt crisis|brics|g20|g7|wto)\b/gi},
  {id:'energy',th:'พลังงาน',en:'Energy',pattern:/\b(crude oil|oil prices?|oil supply|oil production|oil exports?|opec|natural gas|lng|energy crisis|energy supply|power grid|electricity|renewable energy|fuel prices?|hormuz)\b/gi},
  {id:'disaster',th:'ภัยพิบัติ',en:'Disasters',pattern:/\b(earthquakes?|tsunami|hurricanes?|typhoons?|floods?|flooding|wildfires?|drought|famine|volcanic eruption|heatwave|humanitarian crisis)\b/gi},
  {id:'technology',th:'เทคโนโลยีสำคัญ',en:'Technology',pattern:/\b(artificial intelligence|AI|semiconductors?|chip export|chips act|cyberattacks?|cybersecurity|data breach|quantum|AI regulation|AI safety|satellites?)\b/gi},
  {id:'climate',th:'ภูมิอากาศ',en:'Climate',pattern:/\b(climate change|global warming|carbon emissions?|greenhouse|climate summit|net zero|sea level|deforestation)\b/gi},
];

export function focusEvidence(article) {
  return focusTopics.flatMap(topic => {
    // A new RegExp avoids stateful global-regex lastIndex leaking between stories.
    const terms = [...new Set(article.title.match(new RegExp(topic.pattern.source, topic.pattern.flags)) || [])];
    return terms.length ? [{id:topic.id,terms}] : [];
  });
}

export function matchesFocus(article, selected='all') {
  if (selected === 'all') return true;
  const evidence = focusEvidence(article);
  return selected === 'relevant' ? evidence.length > 0 : evidence.some(item => item.id === selected);
}

export const countryOptions = [
  ['th','ไทย','Thailand','thailand|thai|bangkok'],
  ['us','สหรัฐฯ','United States','united states|u\\.s\\.|american|washington|white house'],
  ['cn','จีน','China','china|chinese|beijing'],['jp','ญี่ปุ่น','Japan','japan|japanese|tokyo'],
  ['in','อินเดีย','India','india|indian|new delhi'],['kr','เกาหลีใต้','South Korea','south korea|south korean|seoul'],
  ['kp','เกาหลีเหนือ','North Korea','north korea|north korean|pyongyang'],['tw','ไต้หวัน','Taiwan','taiwan|taiwanese|taipei'],
  ['gb','สหราชอาณาจักร','United Kingdom','united kingdom|britain|british|england|london'],
  ['fr','ฝรั่งเศส','France','france|french|paris'],['de','เยอรมนี','Germany','germany|german|berlin'],
  ['ua','ยูเครน','Ukraine','ukraine|ukrainian|kyiv'],['ru','รัสเซีย','Russia','russia|russian|moscow'],
  ['il','อิสราเอล','Israel','israel|israeli'],['ps','ปาเลสไตน์','Palestine','palestine|palestinian|gaza'],
  ['ir','อิหร่าน','Iran','iran|iranian|tehran'],['sa','ซาอุดีอาระเบีย','Saudi Arabia','saudi|riyadh'],
  ['ae','สหรัฐอาหรับเอมิเรตส์','UAE','united arab emirates|uae|dubai|abu dhabi'],
  ['tr','ตุรกี','Turkey','turkey|turkish|ankara'],['lb','เลบานอน','Lebanon','lebanon|lebanese|beirut'],
  ['sg','สิงคโปร์','Singapore','singapore|singaporean'],['my','มาเลเซีย','Malaysia','malaysia|malaysian'],
  ['id','อินโดนีเซีย','Indonesia','indonesia|indonesian|jakarta'],['vn','เวียดนาม','Vietnam','vietnam|vietnamese'],
  ['mm','เมียนมา','Myanmar','myanmar|burma|burmese'],['kh','กัมพูชา','Cambodia','cambodia|cambodian'],
  ['la','ลาว','Laos','laos|laotian'],['ph','ฟิลิปปินส์','Philippines','philippines|philippine|filipino'],
  ['pk','ปากีสถาน','Pakistan','pakistan|pakistani'],['bd','บังกลาเทศ','Bangladesh','bangladesh|bangladeshi'],
  ['au','ออสเตรเลีย','Australia','australia|australian|sydney|canberra'],['nz','นิวซีแลนด์','New Zealand','new zealand|wellington|auckland'],
  ['ca','แคนาดา','Canada','canada|canadian|ottawa|toronto'],['mx','เม็กซิโก','Mexico','mexico|mexican'],
  ['cl','ชิลี','Chile','chile|chilean'],['br','บราซิล','Brazil','brazil|brazilian'],['ar','อาร์เจนตินา','Argentina','argentina|argentine'],
  ['za','แอฟริกาใต้','South Africa','south africa|south african'],['eg','อียิปต์','Egypt','egypt|egyptian|cairo'],
  ['sd','ซูดาน','Sudan','sudan|sudanese'],['ng','ไนจีเรีย','Nigeria','nigeria|nigerian'],
].map(([id,th,en,aliases])=>({id,th,en,pattern:new RegExp(`\\b(?:${aliases})(?=\\W|$)`,'i')}));

export function mentionedCountries(title) {
  const text = title.replace(/\bUS\b/g,'United States').replace(/\bUK\b/g,'United Kingdom');
  return countryOptions.filter(country=>country.pattern.test(text)).map(country=>country.id);
}

export function thailandEvidence(article) {
  return article.title.match(/\b(thailand|thai|bangkok)\b/gi) || [];
}
