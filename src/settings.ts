export type Keyword = {
  raw: string;
  expansions: string[];
  expansionEnabled: boolean;
};

export type Settings = {
  keywords: Keyword[];
  enabled: boolean;
};

export function migrateSettings(raw: any): Settings {
  const enabled = raw && typeof raw.enabled === 'boolean' ? raw.enabled : true;
  const rawKeywords = raw?.keywords;
  if (!Array.isArray(rawKeywords)) {
    return { keywords: [], enabled };
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
  return { keywords, enabled };
}