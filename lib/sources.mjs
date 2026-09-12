const bbc=(id,name,category,path,region='global')=>({id,name:`BBC · ${name}`,publisher:'BBC News',category,region,url:`https://feeds.bbci.co.uk/news/${path}/rss.xml`,site:`https://www.bbc.com/news/${path}`});
export const sources=[
 bbc('bbc-world','World','world','world'),bbc('bbc-business','Business','economy','business'),bbc('bbc-tech','Technology','technology','technology'),bbc('bbc-science','Science','climate','science_and_environment'),
 bbc('bbc-asia','Asia','world','world/asia','asia'),bbc('bbc-europe','Europe','world','world/europe','europe'),bbc('bbc-africa','Africa','world','world/africa','africa'),bbc('bbc-middle-east','Middle East','world','world/middle_east','middle-east'),bbc('bbc-americas','US & Canada','world','world/us_and_canada','north-america'),bbc('bbc-latin','Latin America','world','world/latin_america','latin-america'),bbc('bbc-australia','Australia','world','world/australia','oceania'),
 {id:'fed',name:'Federal Reserve',publisher:'Federal Reserve',category:'economy',region:'north-america',url:'https://www.federalreserve.gov/feeds/press_all.xml',site:'https://www.federalreserve.gov/feeds/feeds.htm'},
 {id:'un',name:'UN News',publisher:'United Nations',category:'world',region:'global',url:'https://news.un.org/feed/subscribe/en/news/all/rss.xml',site:'https://news.un.org/en/'},
 {id:'dw',name:'DW · International',publisher:'DW',category:'world',region:'global',url:'https://rss.dw.com/rdf/rss-en-all',site:'https://www.dw.com/en/'},
 {id:'france24',name:'France 24 · World',publisher:'France 24',category:'world',region:'global',url:'https://www.france24.com/en/rss',site:'https://www.france24.com/en/'},
 {id:'aljazeera',name:'Al Jazeera · World',publisher:'Al Jazeera',category:'world',region:'global',url:'https://www.aljazeera.com/xml/rss/all.xml',site:'https://www.aljazeera.com/'},
 {id:'cna',name:'CNA · Asia',publisher:'CNA',category:'world',region:'asia',url:'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511',site:'https://www.channelnewsasia.com/asia'}
];
