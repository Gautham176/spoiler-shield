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

// Walk the page and hide anything containing a keyword.
function scanPage(settings: Settings) {
  if (!settings.enabled || settings.keywords.length === 0) {
    console.log('[Spoiler Shield] scan skipped (disabled or no keywords)');
    return;
  }

  // Get all text-bearing content elements. Divs deliberately excluded —
  // they're too generic and would blur entire layout containers.
  // Week 2 will replace this with smarter ancestor selection.
  const candidates = document.body.querySelectorAll<HTMLElement>(
    'p, li, h1, h2, h3, h4, blockquote'
  );

  console.log('[Spoiler Shield] scanning, found', candidates.length, 'candidates');

  for (const el of candidates) {
    // Skip if an ancestor is already hidden (avoids double-hiding nested matches).
    if (el.closest(`.${SHIELD_CLASS}`)) continue;

    // Use innerText (not textContent) so we only match what's actually visible.
    const text = el.innerText;
    if (text && containsKeyword(text, settings.keywords)) {
      console.log('[Spoiler Shield] hiding', el.tagName, el);
      hideElement(el);
    }
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
      // We'll replace this with in-place re-scanning in Week 3.
      location.reload();
    }
  });
}

init();

export {};