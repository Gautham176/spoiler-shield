console.log('[Spoiler Shield] content script loaded on', window.location.href);

// Quick sanity check that we can actually touch the DOM.
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Spoiler Shield] DOM ready, body has', document.body.childElementCount, 'top-level children');
});