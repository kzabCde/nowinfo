export type Category='world'|'economy'|'technology'|'energy'|'climate';
export type Article={id:string;title:string;url:string;publishedAt:string|null;sourceId:string;source:string;category:Category};
export type FeedSource={id:string;name:string;publisher:string;category:Category;url:string;site:string;status:'ok'|'unavailable';checkedAt:string;count:number};
export type NewsData={articles:Article[];sources:FeedSource[];fetchedAt:string};
