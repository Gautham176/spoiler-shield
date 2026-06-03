const KEYWORDS = ['succession', 'spoiler', 'ending'];

const SHIELD_CLASS = 'spoiler-shield-hidden';

// Inject  CSS once, at the top of the page.
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .${SHIELD_CLASS} {
      filter: blur(16px);
      position: relative;
      cursor: pointer;
      transition: filter 0.2s ease;
      user-select: none;
    }
    .${SHIELD_CLASS}::after {
      content: "🛡️ Spoiler hidden — click to reveal";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      filter: blur(0); /* override parent blur on the overlay */
      z-index: 1;
    }
    .${SHIELD_CLASS}.revealed {
      filter: none;
    }
    .${SHIELD_CLASS}.revealed::after {
      display: none;
    }
  `;
  document.documentElement.appendChild(style);
}

// Check whether a string contains any keyword (case-insensitive).
function containsKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
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
function scanPage() {
  const candidates = document.body.querySelectorAll<HTMLElement>(
    'p, li, h1, h2, h3, h4, blockquote'
  );

  console.log('[Spoiler Shield] scanning, found', candidates.length, 'candidates');

  for (const el of candidates) {
    if (el.closest(`.${SHIELD_CLASS}`)) continue;
    const text = el.innerText;
    if (text && containsKeyword(text)) {
      console.log('[Spoiler Shield] hiding', el.tagName, el);  // ← add this
      hideElement(el);
    }
  }
}

console.log('[Spoiler Shield] active, keywords:', KEYWORDS);
injectStyles();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanPage);
} else {
  scanPage();
}