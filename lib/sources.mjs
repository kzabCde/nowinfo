const feed=(id,name,publisher,category,region,url,site,market='global',language='en')=>({id,name,publisher,category,region,url,site,market,language});
const bbc=(id,name,category,path,region='global')=>feed(id,`BBC · ${name}`,'BBC News',category,region,`https://feeds.bbci.co.uk/news/${path}/rss.xml`,`https://www.bbc.com/news/${path}`);
const thai=(id,name,publisher,category,url,site,language='th')=>feed(id,name,publisher,category,'asia',url,site,'thailand',language);

export const sources=[
 bbc('bbc-world','World','world','world'),bbc('bbc-business','Business','economy','business'),bbc('bbc-tech','Technology','technology','technology'),bbc('bbc-science','Science','climate','science_and_environment'),
 bbc('bbc-asia','Asia','world','world/asia','asia'),bbc('bbc-europe','Europe','world','world/europe','europe'),bbc('bbc-africa','Africa','world','world/africa','africa'),bbc('bbc-middle-east','Middle East','world','world/middle_east','middle-east'),bbc('bbc-americas','US & Canada','world','world/us_and_canada','north-america'),bbc('bbc-latin','Latin America','world','world/latin_america','latin-america'),bbc('bbc-australia','Australia','world','world/australia','oceania'),
 feed('fed','Federal Reserve','Federal Reserve','economy','north-america','https://www.federalreserve.gov/feeds/press_all.xml','https://www.federalreserve.gov/feeds/feeds.htm'),
 feed('un','UN News','United Nations','world','global','https://news.un.org/feed/subscribe/en/news/all/rss.xml','https://news.un.org/en/'),
 feed('dw','DW · International','DW','world','global','https://rss.dw.com/rdf/rss-en-all','https://www.dw.com/en/'),
 feed('france24','France 24 · World','France 24','world','global','https://www.france24.com/en/rss','https://www.france24.com/en/'),
 feed('aljazeera','Al Jazeera · World','Al Jazeera','world','global','https://www.aljazeera.com/xml/rss/all.xml','https://www.aljazeera.com/'),
 feed('cna','CNA · Asia','CNA','world','asia','https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511','https://www.channelnewsasia.com/asia'),
 thai('matichon','Matichon · Latest','Matichon','world','https://www.matichon.co.th/feed','https://www.matichon.co.th','th'),
 thai('thaiger','Thaiger · Thailand','Thaiger','world','https://thethaiger.com/th/feed/','https://thethaiger.com/th','th'),
 thai('khaosod','Khaosod · Latest','Khaosod','world','https://www.khaosod.co.th/feed','https://www.khaosod.co.th','th'),
 thai('mgronline','MGR Online · Latest','MGR Online','world','https://mgronline.com/store/rss/index.xml','https://mgronline.com','th'),
 thai('innnews','INN News · Latest','INN News','world','https://www.innnews.co.th/feed/','https://www.innnews.co.th','th'),
 thai('khaosod-en','Khaosod English · Latest','Khaosod English','world','https://www.khaosodenglish.com/feed/','https://www.khaosodenglish.com','en')
];
