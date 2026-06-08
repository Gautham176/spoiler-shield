import { getAllContainerSelector } from '../containers';

const SHIELD_CLASS = 'spoiler-shield-hidden';

type Settings = {
  keywords: string[];
  enabled: boolean;
};

// Inject CSS once, at the top of the page.
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .${SHIELD_CLASS} {
      position: relative;
      cursor: pointer;
    }
    .${SHIELD_CLASS}::before {
      content: "";
      position: absolute;
      inset: 0;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: rgba(0, 0, 0, 0.35);
      z-index: 9998;
      border-radius: 4px;
    }
    .${SHIELD_CLASS}::after {
      content: "🛡️ Spoiler hidden — click to reveal";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      padding: 8px;
      z-index: 9999;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    .${SHIELD_CLASS}.revealed::before,
    .${SHIELD_CLASS}.revealed::after {
      display: none;
    }
  `;
  document.documentElement.appendChild(style);
}

// Check whether a string contains any keyword (case-insensitive).
function containsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

// Hide an element by adding our class + a click-to-reveal handler.
function hideElement(el: HTMLElement) {
  if (el.classList.contains(SHIELD_CLASS)) return; // already hidden
  el.classList.add(SHIELD_CLASS);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    el.classList.add('revealed');
  }, { once: true });
}

function dedupeByAncestry(targets: Set<HTMLElement>): HTMLElement[] {
  const elementsArray = Array.from(targets);

  return elementsArray.filter(current => {
    return !elementsArray.some(potentialAncestor => {
      if (potentialAncestor === current) return false;
      
      return potentialAncestor.contains(current);
    });
  });
}

// Walk the page and hide anything containing a keyword.
function scanPage(settings: Settings) {
  if (!settings.enabled || settings.keywords.length === 0) {
    console.log('[Spoiler Shield] scan skipped (disabled or no keywords)');
    return;
  }

  const containerSelector = getAllContainerSelector();
  const targets = new Set<HTMLElement>();

  // TreeWalker iterates DOM nodes by type. SHOW_TEXT means we only
  // get text nodes — no element nodes, no comments, no other noise.
  // The acceptNode filter lets us further skip text we don't care about.
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Skip text inside non-visual elements. Script/style content
        // can contain keywords coincidentally (a YouTube config blob
        // mentioning "Succession") and we don't want false positives.
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' ||
            tag === 'NOSCRIPT' || tag === 'TEMPLATE') {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip already-hidden subtrees so re-scans don't
        // re-process content we've already handled.
        if (parent.closest(`.${SHIELD_CLASS}`)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip pure whitespace — common between elements, never matches.
        if (!node.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let matchCount = 0;
  let textNode: Node | null;
  while ((textNode = walker.nextNode()) !== null) {
    const text = textNode.nodeValue!;
    if (!containsKeyword(text, settings.keywords)) continue;

    const parent = textNode.parentElement!;
    // container if registered, parent otherwise.
    const target = parent.closest<HTMLElement>(containerSelector) ?? parent;

    matchCount++;
    console.log(
      '[Spoiler Shield] match in', parent.tagName,
      '→ target', target.tagName, target
    );
    targets.add(target);
  }

  console.log('[Spoiler Shield] scan complete:', matchCount,
              'matches,', targets.size, 'unique targets');

  const finalTargets = dedupeByAncestry(targets);
  for (const target of finalTargets) {
    hideElement(target);
  }
}

async function init() {
  const settings = (await chrome.storage.sync.get({
    keywords: [],
    enabled: true,
  })) as Settings;

  console.log('[Spoiler Shield] active', settings);
  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scanPage(settings));
  } else {
    scanPage(settings);
  }

  // Re-scan when settings change in another tab/popup.
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.keywords || changes.enabled) {
      // Easiest re-application: reload the page.
      location.reload();
    }
  });
}

init();

export {};