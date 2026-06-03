type Settings = {
  keywords: string[];
  enabled: boolean;
};

const DEFAULTS: Settings = { keywords: [], enabled: true };

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(DEFAULTS);
  return result as Settings;
}

async function setSettings(updates: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(updates);
}

function renderList(keywords: string[]) {
  const list = document.getElementById('keyword-list') as HTMLUListElement;
  const emptyState = document.getElementById('empty-state') as HTMLParagraphElement;

  list.innerHTML = '';
  emptyState.hidden = keywords.length > 0;

  for (const kw of keywords) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = kw;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.title = `Remove "${kw}"`;
    removeBtn.addEventListener('click', () => removeKeyword(kw));
    li.append(span, removeBtn);
    list.appendChild(li);
  }
}

async function addKeyword(raw: string) {
  const keyword = raw.trim();
  if (!keyword) return;

  const { keywords } = await getSettings();
  // Dedupe case-insensitively.
  if (keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) return;

  const updated = [...keywords, keyword];
  await setSettings({ keywords: updated });
  renderList(updated);
}

async function removeKeyword(keyword: string) {
  const { keywords } = await getSettings();
  const updated = keywords.filter(k => k !== keyword);
  await setSettings({ keywords: updated });
  renderList(updated);
}

async function init() {
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
}

init();

export {};