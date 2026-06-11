const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Common short words we never want to use as a match-by-themselves.
// Length-based filtering catches most stopwords; this is for the few common ones
// that are still 3+ characters.
const SPLIT_STOPWORDS = new Set([
  'the', 'and', 'for', 'of', 'to', 'in', 'on', 'at', 'a', 'an',
]);

// Take a list of (possibly multi-word) terms and return them PLUS each individual
// word from any multi-word term. Dedupes via Set. Skips short words and stopwords.
// "Harvey Specter" → ["Harvey Specter", "Harvey", "Specter"]
// "The Mountain"   → ["The Mountain", "Mountain"]   (skips "The")
// "Roy family"     → ["Roy family", "Roy", "family"] (accepts both)
function splitMultiWordTerms(terms: string[]): string[] {
  const out = new Set<string>();
  for (const term of terms) {
    out.add(term);
    const words = term.split(/\s+/);
    if (words.length < 2) continue;
    for (const word of words) {
      if (word.length < 3) continue;
      if (SPLIT_STOPWORDS.has(word.toLowerCase())) continue;
      out.add(word);
    }
  }
  return Array.from(out);
}

const PROMPT_TEMPLATE = `The user wants to avoid spoilers about: "{KEYWORD}"

Generate a list of specific terms that, if mentioned in text on the web, would indicate spoiler discussion of this topic. Include:

- Full character names (e.g., "Harvey Specter")
- Distinctive last names alone, when the surname is uncommon enough to be a reliable signal (e.g., "Specter", "Wambsgans"). Skip common surnames like "Smith" or "Ross".
- Distinctive first names alone, when they're unusual or strongly associated with the franchise (e.g., "Kendall", "Saruman"). Skip common first names like "Tom", "Mike", "Harvey".
- Nicknames that are distinctive (e.g., "Cousin Greg", "The Mountain")
- Location names, organizations, key items, plot-specific events
- Actor names if strongly associated with the role

Avoid:
- Common single names that would over-match (first names like Harvey/Tom/Mike, common surnames)
- Generic words (ending, finale, death, twist, spoiler)
- The original keyword itself
- Common English words

Aim for 10-25 carefully chosen terms. Better to omit a marginal term than include one that over-matches.

If "{KEYWORD}" is not a recognizable show/movie/book/game/franchise, return an empty array.`;

export class GeminiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function expandKeyword(keyword: string, apiKey: string): Promise<string[]> {
  const prompt = PROMPT_TEMPLATE.replace('{KEYWORD}', keyword);

  const url = `${ENDPOINT}?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Structured output: Gemini will return JSON matching this schema.
        // More reliable than asking the model to "respond with JSON" in the prompt.
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              terms: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['terms'],
          },
        },
      }),
    });
  } catch (err) {
    throw new GeminiError(
      `Network error: ${err instanceof Error ? err.message : 'unknown'}`,
      'network'
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GeminiError('Invalid API key — check it at aistudio.google.com', 'unauthorized');
    }
    if (response.status === 429) {
      throw new GeminiError('Rate limit hit — try again in a moment', 'rate_limit');
    }
    throw new GeminiError(`API error (status ${response.status})`, 'http_error');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') {
    throw new GeminiError('Unexpected response shape from Gemini', 'bad_response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiError('Gemini response was not valid JSON', 'parse_error');
  }

  const terms = (parsed as { terms?: unknown })?.terms;
  if (!Array.isArray(terms)) {
    throw new GeminiError('Gemini response missing terms array', 'bad_response');
  }

  // Defensive filter: keep only non-empty strings, trimmed.
  const cleaned = terms
    .filter((t: unknown): t is string => typeof t === 'string')
    .map(t => t.trim())
    .filter(t => t.length > 0);

    return splitMultiWordTerms(cleaned);
}