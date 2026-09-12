# NowInfo v0.2 — Global dashboard

## Shipped scope

- Dashboard with an interactive regional world map, news counts, source health, category distribution, and a publication activity histogram (12 two-hour bins).
- Dark/light themes cover all pages, dialogs and controls. Dark is the first-visit default; preferences persist in localStorage and the initial document applies the selected theme before hydration.
- Seventeen RSS feeds from BBC News, Federal Reserve, UN News, DW, France 24, Al Jazeera and CNA. BBC regional feeds cover Asia, Europe, Africa, Middle East, North America, Latin America and Australia/Oceania.
- Regions are approximated from feed scope and headline keywords. Multi-region stories count toward each relevant region; unspecified stories remain in Global / unspecified. Map markers select regions and are not event coordinates.
- Publisher, region, category, search and chronology controls work together. Headlines remain in the original language.

## Local data design

No application database, login, background scheduler or paid AI API. Vercel only retrieves public feeds and applies short-lived HTTP caching. It does not store user preferences or reading lists.

| localStorage key | Content |
| --- | --- |
| nowinfo:cache:v2 | Latest feed snapshot merged with recent cached articles: up to 500 headlines within 7 days |
| nowinfo:saved | Up to 100 bookmarks, separately retained; old v0.1 bookmarks are migrated on read |
| nowinfo:theme | dark or light |
| nowinfo:language | th or en |
| nowinfo:filters:v2 | Last topic, region, source and sort order |

A page first restores the cache, then requests an update. If a source fails, previously stored headlines remain within the retention window. The page checks for updates every 5 minutes while visible. There is no update while the browser is closed and no guarantee that the whole app shell can cold-start without a network connection.

If the storage quota is reached, the disposable cache attempts smaller limits (150, then 30). Bookmarks are never removed to make space. Storage errors are reported. JSON export/import supports explicit backup and device transfer; imported news and bookmarks are validated and merged with existing content. Import limit: 2 MB, at most 100 bookmarks. Browser/site data deletion may remove the local workspace.

## Geography attribution

World geometry: Natural Earth data via world-atlas 2.0.2, projected with d3-geo. The world-atlas license is included in public/world-atlas-LICENSE.txt. Use `npm run build:map` to regenerate lib/world-map.json. Geographic illustration does not imply endorsement of disputed boundaries. The map uses land geometry, not political country boundaries.

Sources: https://github.com/topojson/world-atlas and https://www.naturalearthdata.com/about/terms-of-use/

## Coverage limits

Feed availability varies by publisher and hosting location. English-language coverage remains incomplete; this is not every article from every country. Counts measure news available in this browser's cache, not global risk, severity, impact or total worldwide media output. Publication times come from publishers. Context prompts remain general questions, not generated analysis of specific events.
