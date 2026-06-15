# Spoiler Shield

A Chrome extension that blurs spoilers about anything — TV shows, movies, sports, news — across any website. AI-assisted keyword expansion turns a single keyword like "Suits" into 15+ related terms (character names, locations, plot elements) so you catch references you wouldn't have thought to add yourself.

![Spoiler Shield in action](docs/demo.gif)

**[Install on the Chrome Web Store →](https://chrome.google.com/webstore/detail/EXTENSION_ID)** *(coming soon — pending review)*

## What it does

- Add keywords for things you're avoiding spoilers about
- Optionally expand each keyword via Google Gemini (free tier) — one keyword becomes a list of related terms
- Browse normally; any text matching your keywords gets blurred in real-time on every website
- Click any blurred element to reveal it
- Per-site disable and 30-minute snooze for when you're done dodging

The matching runs entirely in your browser. Nothing about the pages you visit is ever sent anywhere.

## Tech stack

- **TypeScript** + **Vite** + **@crxjs/vite-plugin** for the build pipeline
- **Chrome Extension Manifest V3**
- **Google Gemini 2.5 Flash-Lite** for keyword expansion (user provides their own API key)
- **Vanilla DOM** in the content script — no framework, for predictable performance on every page

## Architecture highlights

The interesting parts.

### Real-time blur via MutationObserver

The content script watches `document.body` for added subtrees using a `MutationObserver`. New nodes get queued into a `Set` and processed in a single `requestAnimationFrame` batch — coalescing bursts of mutations (Twitter renders dozens of tweets in a single frame) into one scan rather than one scan per mutation.

Scans are scoped to *new subtrees only*, not the whole DOM. The initial scan walks `document.body` once at load; afterward, each observer batch walks only the added nodes.

### Hide-before-render

To prevent a brief flash of spoiler text before the scan completes, the observer marks each added node with a `data-spoiler-pending` attribute synchronously. A CSS rule (`[data-spoiler-pending] { visibility: hidden }`) installed at `document_start` keeps that content invisible until the next animation frame, when the scan runs and either blurs the element or clears the pending attribute. A `setTimeout` failsafe clears the attribute after 2 seconds even if the scan throws — text staying invisible forever is a worse failure mode than briefly flashing.

### TreeWalker over tag-based selectors

Early versions used a tag whitelist (`p`, `span`, `div`, etc.) to find candidate text. This missed real cases: Reddit titles use `<a slot="title">`, YouTube uses `<span role="text">`. The current version uses a `TreeWalker` with `NodeFilter.SHOW_TEXT` to walk *every* text node in a subtree, then climbs up to the nearest registered container element (`shreddit-comment`, `article[data-testid="tweet"]`, etc.) to decide what to blur. The result is site-agnostic: it finds matches in unusual elements without needing tag-specific knowledge.

### Defense against React class-stripping

Twitter's React app re-renders tweets on hover, stripping any classes it doesn't recognize — including the blur class. Solution: a `WeakSet` tracks intentionally-blurred elements, and the observer also watches for `attributes` changes with `attributeFilter: ['class']`. If a tracked element loses the blur class without gaining the user-applied "revealed" class, we re-apply it. The loop is self-terminating because the re-application succeeds on the first try.

### Schema migration with defensive parsing

The settings schema evolved from `string[]` to `Keyword[]` (with raw, expansions, and enabled state) between versions. The `migrateSettings(raw: any): Settings` function defensively parses whatever it gets from storage — handling missing fields, wrong types, NaN-as-number, empty strings, and legacy formats — and *never throws*. New fields (per-site disabled list, snooze timestamp) were added without breaking existing users.

### Schema-enforced JSON from the LLM

Keyword expansion uses Gemini's `responseSchema` parameter rather than prompt-only JSON instructions. The model is *forced* to return valid JSON matching a declared schema, eliminating an entire class of parse failures common with prompt-engineered JSON output.

### BYOK (Bring Your Own Key) architecture

The extension doesn't run a backend. Users provide their own free-tier Gemini API key (15 requests/min, 1000/day, no credit card). This was a deliberate design choice — operating cost is zero, no user data flows through any third-party server, and the privacy story is honest. The tradeoff is a setup step for users.

### Centralized `shouldScan` rule

Whether to scan a given page is decided by a single pure function: `shouldScan(settings, hostname) → boolean`. It encapsulates the master enabled toggle, the snooze timestamp check, and the per-site disabled list. Three checks in one place, easy to test, easy to extend.

### Per-key reload diffing

Most settings changes (keywords, enabled, snooze) reload every open tab. The `disabledSites` change is hostname-specific — the listener diffs old vs. new and only reloads if this tab's hostname's disabled state actually flipped. Prevents unnecessary reloads of unrelated tabs when toggling site-specific settings.

## Performance

Profiled with Chrome DevTools on Twitter during heavy scroll. Bottom-up analysis showed extension code consuming under 1% CPU with no dropped frames attributable to scan work. No optimization performed beyond the architectural choices above — measurement didn't justify it.

## Local development

```bash
git clone https://github.com/Gautham176/spoiler-shield
cd spoiler-shield
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension at `chrome://extensions` (with Developer Mode enabled).

For active development, use `npm run dev` for Vite's watch mode with HMR. Some changes require reloading the extension at `chrome://extensions` and refreshing tabs.

## Project structure

spoiler-shield/

├── manifest.json

├── public/

│   └── icons/                  # extension icons (16/32/48/128)

├── src/

│   ├── content/

│   │   └── index.ts            # content script: scanning, observer, blur

│   ├── popup/

│   │   ├── index.html          # popup UI

│   │   ├── popup.css

│   │   └── popup.ts            # popup logic

│   ├── containers.ts           # per-site container selectors (Reddit, Twitter, etc.)

│   ├── gemini.ts               # Gemini API integration + keyword expansion

│   └── settings.ts             # settings schema, migration, shouldScan helper

└── notes/                      # design notes, observations, limitations

## Known limitations

- Initial page-load matches may flash briefly before the initial scan completes (only dynamic content is hide-before-render).
- Substring matching is intentionally simple — short keywords (e.g., "the") match too broadly. The keyword expansion feature partially mitigates this by suggesting more distinctive terms.
- Multi-word LLM-suggested terms are split into individual words to catch partial mentions ("Harvey Specter" also matches "Harvey"). This trades precision for recall; users can remove unwanted split terms via the popup.
- Snooze countdown in the popup is static during a single open session, not live-updating.