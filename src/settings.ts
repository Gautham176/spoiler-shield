export type Keyword = {
  raw: string;
  expansions: string[];
  expansionEnabled: boolean;
};

export type Settings = {
  keywords: Keyword[];
  enabled: boolean;
  disabledSites: string[];   // hostnames where the extension shouldn't run
  snoozedUntil: number;       // epoch ms; 0 means not snoozed
};

export function migrateSettings(raw: any): Settings {
  // 1. Resolve core extension state switches
  const enabled = raw && typeof raw.enabled === 'boolean' ? raw.enabled : true;

  // 2. Defensively parse snoozedUntil timestamp
  const snoozedUntil = raw && typeof raw.snoozedUntil === 'number' && !isNaN(raw.snoozedUntil) 
    ? raw.snoozedUntil 
    : 0;

  // 3. Defensively parse disabledSites domain collection
  const disabledSites = raw && Array.isArray(raw.disabledSites)
    ? raw.disabledSites.filter((site: any) => typeof site === 'string' && site.trim() !== '')
    : [];

  // 4. Safely capture keywords or fall back to baseline schema configurations
  const rawKeywords = raw?.keywords;
  if (!Array.isArray(rawKeywords)) {
    return { 
      keywords: [], 
      enabled, 
      disabledSites, 
      snoozedUntil 
    };
  }

  const keywords: Keyword[] = [];
  for (const item of rawKeywords) {
    if (typeof item === 'string') {
      if (item.trim()) {
        keywords.push({
          raw: item,
          expansions: [],
          expansionEnabled: true,
        });
      }
    } else if (item && typeof item === 'object' && typeof item.raw === 'string') {
      keywords.push({
        raw: item.raw,
        expansions: Array.isArray(item.expansions)
          ? item.expansions.filter((e: any) => typeof e === 'string')
          : [],
        expansionEnabled: typeof item.expansionEnabled === 'boolean' ? item.expansionEnabled : true,
      });
    }
  }

  return { 
    keywords, 
    enabled, 
    disabledSites, 
    snoozedUntil 
  };
}

export function shouldScan(settings: Settings, hostname: string): boolean {
  // 1. Master switch constraint
  if (!settings.enabled) {
    return false;
  }

  // 2. Snooze timer constraint (Date.now() returns current epoch ms)
  if (settings.snoozedUntil > 0 && Date.now() < settings.snoozedUntil) {
    return false;
  }

  // 3. Per-site disabled list constraint (Normalized case-insensitively)
  const normalizedHostname = hostname.toLowerCase().trim();
  const isSiteDisabled = settings.disabledSites.some(
    site => site.toLowerCase().trim() === normalizedHostname
  );

  if (isSiteDisabled) {
    return false;
  }

  // All guards passed cleanly
  return true;
}