import { getAllContainerSelector } from '../containers';

const SHIELD_CLASS = 'spoiler-shield-hidden';
const REVEALED_CLASS = 'spoiler-shield-revealed';

type Settings = {
  keywords: string[];
  enabled: boolean;
};

// Tracks elements that we have intentionally blurred across virtual DOM updates.
const blurredElements = new WeakSet<HTMLElement>();

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
    .${SHIELD_CLASS}.${REVEALED_CLASS}::before,
    .${SHIELD_CLASS}.${REVEALED_CLASS}::after {
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
  blurredElements.add(el); 

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    el.classList.add(REVEALED_CLASS);
  }, { once: true });
}

// Return only elements from targets that are not descendants of any other element in targets.
function dedupeByAncestry(targets: Set<HTMLElement>): HTMLElement[] {
  const elementsArray = Array.from(targets);

  return elementsArray.filter(current => {
    return !elementsArray.some(potentialAncestor => {
      if (potentialAncestor === current) return false;
      
      return potentialAncestor.contains(current);
    });
  });
}

// Walk a specific subtree and hide anything containing a keyword.
function scanRoot(root: Element, settings: Settings): void {
  if (!settings.enabled || settings.keywords.length === 0) {
    return;
  }

  const containerSelector = getAllContainerSelector();
  const targets = new Set<HTMLElement>();

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' ||
            tag === 'NOSCRIPT' || tag === 'TEMPLATE') {
          return NodeFilter.FILTER_REJECT;
        }

        if (parent.closest(`.${SHIELD_CLASS}`)) {
          return NodeFilter.FILTER_REJECT;
        }

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
    const target = parent.closest<HTMLElement>(containerSelector) ?? parent;

    matchCount++;
    targets.add(target);
  }

  if (matchCount > 0) {
    console.log(
      `[Spoiler Shield] scanRoot: found ${matchCount} matches → ${targets.size} unique targets inside`, 
      root
    );
  }

  const finalTargets = dedupeByAncestry(targets);
  for (const target of finalTargets) {
    hideElement(target);
  }
}

function scanPage(settings: Settings): void {
  scanRoot(document.body, settings);
}

function startObserver(settings: Settings): void {
  const pendingNodes = new Set<Element>();
  let pendingFlush: number | null = null;

  function flush() {
    pendingFlush = null;

    for (const element of pendingNodes) {
      scanRoot(element, settings);
    }

    pendingNodes.clear();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Direct class modification defense: Intercept elements stripped of shielding by React
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (
          target instanceof HTMLElement && 
          blurredElements.has(target) && 
          !target.classList.contains(SHIELD_CLASS) &&
          !target.classList.contains(REVEALED_CLASS)
        ) {
          target.classList.add(SHIELD_CLASS);
        }
        continue;
      }

      // Collect structural shifts safely
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          pendingNodes.add(node);
        }
      }
    }

    if (pendingFlush === null && pendingNodes.size > 0) {
      pendingFlush = requestAnimationFrame(flush);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

async function init() {
  const settings = (await chrome.storage.sync.get({
    keywords: [],
    enabled: true,
  })) as Settings;

  console.log('[Spoiler Shield] active', settings);
  injectStyles();

  const bootstrap = () => {
    scanPage(settings);     // initial scan over existing DOM
    startObserver(settings); // catch everything added later
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.keywords || changes.enabled) {
      location.reload();
    }
  });
}

init();

export {};