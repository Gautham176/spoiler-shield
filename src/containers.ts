export type ContainerRule = {
  site: string;
  unit: string;
  selectors: string[];
  notes?: string;
};

export const CONTAINERS: ContainerRule[] = [
  {
    site: 'reddit.com',
    unit: 'comment',
    selectors: ['shreddit-comment'],
  },
  {
    site: 'reddit.com',
    unit: 'post',
    selectors: ['shreddit-post', 'article[data-post-id]'],
    notes: 'Fallback covers cases where shreddit-post isnt rendered',
  },
  {
    site: 'x.com',
    unit: 'tweet',
    selectors: ['article[data-testid="tweet"]'],
    notes: 'Quote tweets nest; D1 post-processing handles this.',
  },
  {
    site: 'youtube.com',
    unit: 'video-card',
    selectors: ['ytd-rich-item-renderer', 'yt-lockup-view-model'],
    notes: 'Search/sidebar use different wrappers; covered by fallbacks.',
  },
  {
    site: 'youtube.com',
    unit: 'comment-thread',
    selectors: ['ytd-comment-thread-renderer'],
  },
];

const ALL_SELECTORS = CONTAINERS.flatMap(rule => rule.selectors).join(', ');

export function getAllContainerSelector(): string {
  return ALL_SELECTORS;
}