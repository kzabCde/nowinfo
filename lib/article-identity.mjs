export function normalizedHeadline(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
}

// Repeated regional feeds from the same publisher collapse. Different publishers stay available.
export function deduplicateArticles(items) {
  const byUrl=new Map(), byHeadline=new Map(), result=[];
  for(const article of items) {
    const key=`${article.source.toLowerCase()}::${normalizedHeadline(article.title)}`;
    const previous=byUrl.get(article.url)||byHeadline.get(key);
    if(previous) {
      const combined=[...new Set([...previous.regions,...article.regions])];
      previous.regions=combined.length>1?combined.filter(region=>region!=='global'):combined;
      byUrl.set(article.url,previous);byHeadline.set(key,previous);
    } else {
      const copy={...article,regions:[...(article.regions||['global'])]};
      result.push(copy);byUrl.set(article.url,copy);byHeadline.set(key,copy);
    }
  }
  return result;
}
