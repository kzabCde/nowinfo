export const regions=['asia','europe','africa','middle-east','north-america','latin-america','oceania','global'];
export const regionNames={th:{asia:'เอเชีย',europe:'ยุโรป',africa:'แอฟริกา','middle-east':'ตะวันออกกลาง','north-america':'อเมริกาเหนือ','latin-america':'ลาตินอเมริกา',oceania:'โอเชียเนีย',global:'ทั่วโลก / ไม่ระบุ'},en:{asia:'Asia',europe:'Europe',africa:'Africa','middle-east':'Middle East','north-america':'North America','latin-america':'Latin America',oceania:'Oceania',global:'Global / unspecified'}};
const patterns={
 asia:/\b(asia|china|chinese|japan|japanese|korea|taiwan|india|indian|pakistan|bangladesh|nepal|sri lanka|thailand|thai|singapore|malaysia|indonesia|philippines|vietnam|myanmar|cambodia|laos|hong kong|beijing|tokyo|delhi|bangkok)\b/i,
 europe:/\b(europe|european|eu|uk|britain|british|england|france|french|germany|german|ukraine|ukrainian|russia|russian|italy|spain|poland|sweden|norway|finland|greece|london|paris|berlin|moscow|kyiv)\b/i,
 africa:/\b(africa|african|sudan|congo|kenya|ethiopia|somalia|nigeria|nigerian|south africa|ghana|uganda|rwanda|senegal|mali|libya|tunisia|morocco|egypt|angola|zambia|zimbabwe|mozambique|madagascar)\b/i,
 'middle-east':/\b(middle east|israel|israeli|palestine|palestinian|gaza|iran|iranian|iraq|syria|lebanon|lebanese|yemen|houthi|saudi|qatar|uae|dubai|turkey|turkish|jordan|hormuz|red sea)\b/i,
 'north-america':/\b(united states|u\.s\.|american|canada|canadian|washington|white house|federal reserve|new york|california|texas|mississippi|ottawa|toronto)\b/i,
 'latin-america':/\b(latin america|south america|central america|brazil|brazilian|mexico|mexican|argentina|chile|peru|colombia|venezuela|ecuador|bolivia|uruguay|paraguay|cuba|haiti|caribbean|guatemala|honduras|panama|costa rica)\b/i,
 oceania:/\b(australia|australian|new zealand|pacific islands|fiji|samoa|tonga|vanuatu|solomon islands|papua new guinea|sydney|canberra|wellington|auckland)\b/i
};
export function inferRegions(title,fallback='global'){const matches=Object.entries(patterns).filter(([,pattern])=>pattern.test(title.replace(/\bUS\b/g,'United States'))).map(([region])=>region);if(fallback!=='global'&&regions.includes(fallback)&&!matches.includes(fallback))matches.push(fallback);return matches.length?matches:['global'];}
