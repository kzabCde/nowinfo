# NowInfo v0.3 — ordered implementation, review only

This branch implements the five requested steps. Do not merge to main or promote to Production without a subsequent user instruction. GitHub may generate a Vercel Preview for this non-production branch.

## 1. Headline topic selection

Six focus topics: conflict, global economy, energy, disasters, technology, climate. Each match exposes the exact terms in the headline. All headlines remain accessible. Topics are rules, not importance rankings, verified facts or impact estimates. Original headline language is retained.

## 2. Related event groups

Stories need three shared meaningful tokens and at least 0.4 Jaccard similarity, with no more than 72 hours between publication times. Conflicting recognized countries prevent a merge. Every member must match every other member; topic chains do not merge into a single broad story. Unknown publication dates remain standalone. Different publisher links are retained even for identical headlines; repeats from the same publisher collapse. The latest original headline names the group. Groups show publisher count, all links, shared terms and a chronological list.

Conservative matching can miss paraphrases and can still group different events with similar wording. Country detection is a bounded headline dictionary, not geographic entity recognition. A publisher count does not establish independent corroboration. The 500-headline, 7-day cache still bounds coverage.

## 3. Local interests

Users choose topics, country mentions or up to 20 literal keywords (60 characters each). A match with any choice qualifies for For you, which states the matching choices. Keywords use word boundaries, so AI does not match said. Searches use the publisher's original language. Followed events also appear in For you.

## 4. Reading progress and followed event updates

Users mark articles read/unread. Opening an original publisher link also marks that article read. Opening the general context dialog alone does not. This is UI state, not proof of completed reading.

New means a previously unseen article URL discovered after the previous session's last feed observation. The first visit does not label the whole feed as new. Publication recency alone does not make an article new. Read articles do not retain the new badge.

Up to 30 followed events retain up to 50 article URL anchors each. Anchors expand when related articles appear, so a representative headline change does not immediately lose a follow. If all anchors disappear from the 7-day cache, the followed item stays visible with a no-current-articles message; it cannot guarantee matching wholly new coverage without a retained anchor. Reading/first-seen history is bounded to 2,000 entries; older history may be pruned. Bookmarks remain separate and are not pruned by these features.

## 5. Thailand perspective

The default list requires explicit Thailand, Thai or Bangkok mentions in a headline. Separate trade, energy and tourism lenses show global topics with general questions to investigate. They do not claim a confirmed effect on Thailand. Direct mentions can still include irrelevant contexts or omit indirect references.

## Persistence and compatibility

- Existing cache, bookmark, theme, language and filter keys are preserved.
- `nowinfo:workspace:v3` contains interests, read/first-seen records, followed event anchors and last observation time.
- JSON backup version 3 exports the complete workspace, feed and bookmarks. Versions 2 and 3 can be imported. Limit: 10 MB; bookmarks: 100; workspace limits as above.
- Imports validate before mutation and merge with existing content. Latest read/unread change wins for duplicate history records; preferences are unioned within limits. Theme/language from the backup are restored.
- All persistence stays in localStorage. No user data is sent to the RSS API. No database, account, paid AI service, email notification or background scheduler was added.
- Storage failures are visible. Browser data deletion can remove the workspace. No cross-device synchronization or guarantee of offline app-shell loading.

## Acceptance checks

- Unit tests cover evidence selection, boundary-aware interests, preserving publisher links, conservative event matching, Thailand lens separation, history merging, and follow continuity.
- Existing RSS validation, outage, cache retention and quota tests remain in place.
- Build and TypeScript checking are required before opening the review PR.
- A DOM hydration reproduction is used to ensure the map's previously fixed SVG title issue does not recur.

## Verification performed

- `npm test`: 22/22 passed.
- A separate JSDOM interaction test passed: topic selection, cross-publisher groups, following an event, adding a Thailand interest, marking an article read, Thailand lens filtering, light mode, and remount persistence. No recoverable hydration errors occurred.
- Existing real-news backup used for a grouping smoke check; no test headlines are shipped or substituted for RSS data.
- Final build and browser Preview checks are recorded in the review PR; Production remains unchanged.
