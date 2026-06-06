# Week 2 DOM Observations

Notes collected before designing the ancestor-selection algorithm. The goal: identify stable wrapper selectors for the "semantic content unit" on each major site (tweet, comment, post, video card) so the algorithm can walk up from a text match to the right element to blur.

## Method

For each unit:
1. Right-click on body text → Inspect.
2. Walk up the DOM with up-arrow until the highlight covers exactly one full unit.
3. Note the tag name and one or two stable attributes (`data-*`, `role`, custom elements). Ignore `class` (auto-generated) and per-instance `id`s.
4. Verify with `document.querySelectorAll('SELECTOR').length` in the console.

---

## Reddit

URL tested: r/AskReddit comment thread + r/CarsIndia post feed

### Comment
- **Wrapper tag:** `shreddit-comment`
- **Stable selector:** `shreddit-comment`
- **Useful attributes:** `thingid`, `depth`, `author`, `permalink`, `postid`
- **Inner content:** child `<div slot="comment" id="t1_XXX-comment-rtjson-content">` holds the actual body text
- **Notes:** `depth` indicates nesting level (0 = top-level reply). The whole thread is N flat `<shreddit-comment>` elements at varying depths — there's no "thread" wrapper element.

### Post (in feed)
- **Wrapper tag:** `shreddit-post`
- **Stable selector:** `shreddit-post`
- **Fallback selector:** `article[data-post-id]`
- **Useful attributes:** `permalink`, `id`, `post-title`, `subreddit-name`, `author`, `created-timestamp`
- **Notes:** wrapped in `<article data-post-id="t3_XXX" aria-label="<post title>">`. Either selector works; `shreddit-post` matches the comment naming convention.

---

## Twitter / X

URL tested: home timeline

### Tweet
- **Wrapper tag:** `article`
- **Stable selector:** `article[data-testid="tweet"]`
- **Confirmed count:** 16 articles vs 8 `cellInnerDiv` rows — some tweets live outside the virtualized timeline (pinned tweets, main tweet on detail pages, etc.)
- **Virtualization:** timeline only keeps ~8 cells (`div[data-testid="cellInnerDiv"]`) in DOM regardless of scroll position. Each cell may contain a tweet, an ad, a "Who to follow" widget, or other UI — `cellInnerDiv` is too broad to use as the unit.
- **Nesting:** quote tweets contain a nested `article[data-testid="tweet"]`. Algorithm should walk to the **outermost** matching ancestor, not the innermost — otherwise quoted spoilers blur but the quoter's commentary stays visible.

### Reply
- Same selector as Tweet (`article[data-testid="tweet"]`).

---

## YouTube

URL tested: homepage + a video page with comments

### Video card (homepage)
- **Wrapper tag:** `ytd-rich-item-renderer`
- **Stable selector:** `ytd-rich-item-renderer`
- **Confirmed count:** 54
- **Caveat:** different YouTube views use different wrappers. Search results may use `ytd-video-renderer` or `yt-lockup-view-model`; sidebar recommendations use yet another. To be revisited at implementation time — final selector will probably be a comma list.

### Comment (under video)
- **Thread wrapper:** `ytd-comment-thread-renderer` (top-level comment + all replies as one unit)
- **Single-comment wrapper:** `ytd-comment-view-model` (new name as of 2026; older `ytd-comment-renderer` returned 0 — YouTube migrated mid-rollout, both may coexist on some pages)
- **Stable selector:** `ytd-comment-thread-renderer`
- **Confirmed counts:** 20 threads, 0 old-style single comments
- **Notes:** thread-level wrapper is the right unit for spoilers — replies often contain related discussion and a single-comment selector would leave them visible. Comments lazy-load on scroll (initial scan misses most).

---

## Cross-site observations

### Web Components are the norm
Reddit and YouTube both use custom elements (`shreddit-*`, `ytd-*`). Twitter uses standard HTML with `data-testid` hooks. Custom elements are easier to target reliably because their tag names are unique and stable. `data-testid` works but is subject to renames.

### Dynamic content is the default
- **Reddit:** initial scan returned only 12 candidates because comments load after `DOMContentLoaded`.
- **Twitter:** virtualizes — only ~8 cells in DOM at any time, constantly recycled as you scroll.
- **YouTube:** comments lazy-load; homepage grid is large initially (54+) but search results stream in.

All three confirm the need for a `MutationObserver` (Week 3). The Week 2 algorithm needs to work on a single element when handed one, regardless of when it appears.

### Nesting and the "outermost ancestor" rule
Twitter quote tweets nest `article[data-testid="tweet"]` inside itself. When the matching text is inside a nested unit, blurring the inner one leaves the outer commentary visible — wrong UX for spoilers. Algorithm should walk **all the way up** to the outermost ancestor matching a known container selector, not stop at the first one.

### Selector fragility
YouTube's `ytd-comment-renderer` → `ytd-comment-view-model` migration in 2026 is a reminder that selectors break. Final implementation should use **lists of fallback selectors** per unit, not single strings, so a rename doesn't immediately break the extension.

---

## Open design questions for Week 2 algorithm

1. **How to combine container selectors with text matching.** Current code finds text matches via `querySelectorAll('p, li, h1, h2, h3, h4, blockquote')`. Should that drive the search and then walk up to a container? Or scan containers first and search text inside them?

2. **Behavior on unregistered sites** (Wikipedia, blogs, news sites with no custom container). Fall back to current behavior (blur the text element directly), or try a heuristic ancestor walk (e.g. nearest `<article>`, `<section>`, or container with significant `padding`)?

3. **Where to store the selector registry.** Inline constant in the content script? Separate config file? Eventually user-editable in the popup?

To be resolved in the design discussion before implementing.