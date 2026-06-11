const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const PROMPT_TEMPLATE = `The user wants to avoid spoilers about: "{KEYWORD}"

Generate a list of 5-15 specific terms that, if mentioned in text on the web, would indicate spoiler discussion of this topic. Focus on:
- Character names
- Location names
- Plot-specific terms (events, organizations, items)
- Actor names if commonly associated with the show or franchise

Avoid:
- Generic words (ending, finale, death, twist, spoiler)
- The original term itself
- Common English words that would over-match

If "{KEYWORD}" is not a recognizable show/movie/book/game topic, return an empty array.`;

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
  return terms
    .filter((t: unknown): t is string => typeof t === 'string')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}