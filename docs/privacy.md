# Privacy Policy — Spoiler Cloak

*Last updated: 13 June 2026*

Spoiler Cloak is a Chrome browser extension that blurs spoiler-related text on web pages. This privacy policy describes what data the extension handles, where it goes, and how you control it.

## Summary

- **We collect nothing.** Spoiler Cloak does not operate any backend server, run any analytics, or transmit data to its developer.
- **Your keywords and settings sync via Chrome.** They are stored in your Chrome browser's built-in storage and synced through your Google account if Chrome Sync is enabled.
- **Your Gemini API key never leaves your device.** It is stored only on the device where you entered it.
- **Page content is never transmitted anywhere.** Keyword matching happens entirely in your browser.

## What the extension stores

The extension stores the following in Chrome's built-in storage:

**Synced via Chrome Sync (`chrome.storage.sync`):**
- Your list of keywords and their expansion terms
- Per-site disabled list (hostnames where you've turned the extension off)
- Snooze state (timestamp until which the extension is paused)
- Master enabled/disabled toggle

This data is managed by Chrome's built-in sync feature, which is controlled by your Google account settings and not accessible to us. Its purpose is to keep your settings consistent across devices where you're signed into Chrome.

**Stored only on your device (`chrome.storage.local`):**
- Your Google Gemini API key (if you provided one)

The API key never syncs to other devices and is not transmitted to us.

## Page content

The extension's content script reads text from pages you visit to match against your keyword list. **This matching happens entirely in your browser.** Page content is never sent to us, never sent to Google, and never sent to any third party. The extension does not record, store, or transmit which pages you visited or what content was matched.

## Third-party services

The extension can optionally use the **Google Gemini API** to generate related terms for a keyword you add. When you add a keyword and have configured a Gemini API key, the extension sends *only that keyword* (for example, "Suits") to the Gemini API. Gemini returns a list of related terms (character names, locations, plot elements).

The extension does not send any other data to Gemini — no page content, no browsing history, no user identifiers beyond the API key you provided. Your interactions with Gemini are governed by [Google's API terms](https://ai.google.dev/terms) and [Google's privacy policy](https://policies.google.com/privacy).

If you do not configure a Gemini API key, no requests are made to the Gemini API at all. The extension's core matching functionality works without it.

## Permissions

The extension requests the following Chrome permissions:

- **`storage`** — to save your keywords, settings, and API key as described above.
- **`activeTab`** — to read the current tab's hostname when the popup is open, so the per-site disable toggle can be scoped to that site. This permission grants access only to the active tab while the popup is open.
- **`host_permissions: https://generativelanguage.googleapis.com/*`** — to make HTTP requests to the Google Gemini API for keyword expansion.
- **Access to all websites** (via `<all_urls>` content script matching) — the extension's content script runs on every website to scan text for your keywords. Spoilers can appear on any site (social media, news, blogs, video platforms, forums), so the extension cannot pre-determine which sites need scanning. **No data is transmitted from these sites — all matching happens locally in your browser.**

## Your control

You can at any time:
- Delete any keyword or expansion term via the popup
- Remove your Gemini API key via the popup's settings panel
- Disable the extension globally with the master toggle
- Disable the extension on any specific website
- Snooze the extension for 30 minutes
- Uninstall the extension, which removes all locally-stored data

To remove the synced data, uninstall the extension and, if desired, clear your Chrome Sync data via your Google account.

## Children's privacy

The extension is not directed at children under 13. Because we do not collect any data from any user, no special handling is needed.

## Changes to this policy

If this policy changes materially, an updated version will be published at this URL with a new "Last updated" date.

## Contact

Questions or concerns: please open an issue at https://github.com/Gautham176/spoiler-shield/issues

---

*Spoiler Cloak is open source. The full source code is available at https://github.com/YOUR_GITHUB_USERNAME/spoiler-shield.*