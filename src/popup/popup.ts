import { migrateSettings, type Settings, type Keyword } from '../settings';
import { expandKeyword, GeminiError } from '../gemini';

// Transient UI state — not persisted. Keys are the raw keyword string.
type ExpansionState = { status: 'loading' } | { status: 'error'; message: string };
const transientState = new Map<string, ExpansionState>();

async function getSettings(): Promise<Settings> {
  const raw = await chrome.storage.sync.get(null);
  return migrateSettings(raw);
}

async function setSettings(updates: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(updates);
}

async function getApiKey(): Promise<string> {
  const result = await chrome.storage.local.get('geminiApiKey');
  return typeof result.geminiApiKey === 'string' ? result.geminiApiKey : '';
}

async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ geminiApiKey: key });
}

// Trigger expansion for a keyword. Updates settings when complete.
// Handles the race where the keyword is removed while expansion is in flight.
async function fetchExpansionsFor(keyword: string): Promise<void> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    transientState.set(keyword, { status: 'error', message: 'No API key' });
    await rerenderFromStorage();
    return;
  }

  transientState.set(keyword, { status: 'loading' });
  await rerenderFromStorage();

  try {
    const expansions = await expandKeyword(keyword, apiKey);

    // Race check: did the user remove this keyword while we were waiting?
    const { keywords } = await getSettings();
    const stillExists = keywords.some(k => k.raw === keyword);
    if (!stillExists) {
      transientState.delete(keyword);
      return;
    }

    const updated = keywords.map(k =>
      k.raw === keyword ? { ...k, expansions } : k
    );
    await setSettings({ keywords: updated });
    transientState.delete(keyword);
    await rerenderFromStorage();
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : 'Expansion failed';
    transientState.set(keyword, { status: 'error', message });
    await rerenderFromStorage();
  }
}

async function rerenderFromStorage(): Promise<void> {
  const { keywords } = await getSettings();
  renderList(keywords);
}

function renderList(keywords: Keyword[]): void {
  const list = document.getElementById('keyword-list') as HTMLUListElement;
  const emptyState = document.getElementById('empty-state') as HTMLParagraphElement;

  list.innerHTML = '';
  emptyState.hidden = keywords.length > 0;

  for (const kw of keywords) {
    list.appendChild(buildKeywordItem(kw));
  }
}

function buildKeywordItem(kw: Keyword): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'keyword-item';

  const header = document.createElement('div');
  header.className = 'keyword-header';

  const rawSpan = document.createElement('span');
  rawSpan.className = 'keyword-raw';
  rawSpan.textContent = kw.raw;
  header.appendChild(rawSpan);

  const state = transientState.get(kw.raw);
  const meta = document.createElement('span');
  meta.className = 'keyword-meta';
  if (state?.status === 'loading') {
    meta.textContent = 'expanding…';
    meta.classList.add('loading');
  } else if (state?.status === 'error') {
    meta.textContent = state.message;
    meta.classList.add('error');
  } else if (kw.expansions.length > 0) {
    meta.textContent = `${kw.expansions.length} related`;
  }
  header.appendChild(meta);

  // Regenerate button — shown when no expansions and not currently loading.
  if (kw.expansions.length === 0 && state?.status !== 'loading') {
    const regen = document.createElement('button');
    regen.className = 'regenerate-btn';
    regen.textContent = '↻';
    regen.title = 'Generate expansions';
    regen.addEventListener('click', () => fetchExpansionsFor(kw.raw));
    header.appendChild(regen);
  }

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.textContent = kw.expansions.length > 0 ? '▶' : '▶';
  toggleBtn.disabled = kw.expansions.length === 0;
  toggleBtn.title = kw.expansions.length > 0 ? 'Show expansions' : 'No expansions';
  header.appendChild(toggleBtn);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '×';
  removeBtn.title = `Remove "${kw.raw}"`;
  removeBtn.addEventListener('click', () => removeKeyword(kw.raw));
  header.appendChild(removeBtn);

  li.appendChild(header);

  // Expansion details (collapsible)
  if (kw.expansions.length > 0) {
    const details = document.createElement('div');
    details.className = 'expansions';
    details.hidden = true;

    const useLabel = document.createElement('label');
    useLabel.className = 'use-toggle';
    const useCheckbox = document.createElement('input');
    useCheckbox.type = 'checkbox';
    useCheckbox.checked = kw.expansionEnabled;
    useCheckbox.addEventListener('change', () =>
      setExpansionEnabled(kw.raw, useCheckbox.checked)
    );
    const useText = document.createElement('span');
    useText.textContent = 'Use these terms in matching';
    useLabel.append(useCheckbox, useText);
    details.appendChild(useLabel);

    const expansionList = document.createElement('ul');
    expansionList.className = 'expansion-list';
    for (const term of kw.expansions) {
      const tag = document.createElement('li');
      const tagText = document.createElement('span');
      tagText.textContent = term;
      const tagX = document.createElement('button');
      tagX.textContent = '×';
      tagX.title = `Remove "${term}"`;
      tagX.addEventListener('click', () => removeExpansion(kw.raw, term));
      tag.append(tagText, tagX);
      expansionList.appendChild(tag);
    }
    details.appendChild(expansionList);
    li.appendChild(details);

    toggleBtn.addEventListener('click', () => {
      const opening = details.hidden;
      details.hidden = !opening;
      toggleBtn.textContent = opening ? '▼' : '▶';
    });
  }

  return li;
}

async function addKeyword(raw: string): Promise<void> {
  const keyword = raw.trim();
  if (!keyword) return;

  const { keywords } = await getSettings();
  if (keywords.some(k => k.raw.toLowerCase() === keyword.toLowerCase())) return;

  const newKeyword: Keyword = {
    raw: keyword,
    expansions: [],
    expansionEnabled: true,
  };
  const updated = [...keywords, newKeyword];
  await setSettings({ keywords: updated });
  renderList(updated);

  // Fire and forget — expansion runs in background, UI updates when complete.
  void fetchExpansionsFor(keyword);
}

async function removeKeyword(keyword: string): Promise<void> {
  const { keywords } = await getSettings();
  const updated = keywords.filter(k => k.raw !== keyword);
  transientState.delete(keyword);
  await setSettings({ keywords: updated });
  renderList(updated);
}

async function removeExpansion(keyword: string, term: string): Promise<void> {
  const { keywords } = await getSettings();
  const updated = keywords.map(k =>
    k.raw === keyword ? { ...k, expansions: k.expansions.filter(t => t !== term) } : k
  );
  await setSettings({ keywords: updated });
  renderList(updated);
}

async function setExpansionEnabled(keyword: string, enabled: boolean): Promise<void> {
  const { keywords } = await getSettings();
  const updated = keywords.map(k =>
    k.raw === keyword ? { ...k, expansionEnabled: enabled } : k
  );
  await setSettings({ keywords: updated });
  // No re-render — the checkbox already reflects the new state.
}

function setStatus(message: string, type: 'success' | 'error' | '' = ''): void {
  const el = document.getElementById('key-status') as HTMLSpanElement;
  el.textContent = message;
  el.className = `status ${type}`;
  if (message) {
    setTimeout(() => {
      if (el.textContent === message) {
        el.textContent = '';
        el.className = 'status';
      }
    }, 3000);
  }
}

async function init(): Promise<void> {
  const settings = await getSettings();
  renderList(settings.keywords);

  const toggle = document.getElementById('enabled-toggle') as HTMLInputElement;
  toggle.checked = settings.enabled;
  toggle.addEventListener('change', () => {
    setSettings({ enabled: toggle.checked });
  });

  const form = document.getElementById('add-form') as HTMLFormElement;
  const input = document.getElementById('keyword-input') as HTMLInputElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addKeyword(input.value);
    input.value = '';
    input.focus();
  });

  // Settings panel
  const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
  const settingsPanel = document.getElementById('settings-panel') as HTMLElement;
  settingsBtn.addEventListener('click', () => {
    settingsPanel.hidden = !settingsPanel.hidden;
  });

  // API key
  const keyInput = document.getElementById('api-key-input') as HTMLInputElement;
  const saveBtn = document.getElementById('save-key-btn') as HTMLButtonElement;
  const badge = document.getElementById('key-status-badge') as HTMLSpanElement;

  if (await getApiKey()) {
    badge.textContent = '✓ Saved';
  }

  saveBtn.addEventListener('click', async () => {
    const value = keyInput.value.trim();
    if (!value) {
      setStatus('Enter a key first', 'error');
      return;
    }
    await setApiKey(value);
    keyInput.value = '';
    badge.textContent = '✓ Saved';
    setStatus('Saved', 'success');
  });
}

init();

export {};