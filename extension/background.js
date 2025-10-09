console.log('Smart History Cleaner background (onVisited version) loaded');

const STORAGE_SITES = 'sites';
const STORAGE_AUTO = 'autoEnabled';

// helper: get sites + toggle state
function getSites() {
  return new Promise(resolve => {
    chrome.storage.sync.get([STORAGE_SITES], res => resolve(res[STORAGE_SITES] || []));
  });
}
function isAutoEnabled() {
  return new Promise(resolve => {
    chrome.storage.sync.get([STORAGE_AUTO], res => resolve(Boolean(res[STORAGE_AUTO])));
  });
}

// match function (same as before)
function urlMatches(site, urlStr) {
  if (!site || !urlStr) return false;
  const s = site.toLowerCase();
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (host === s || host.endsWith('.' + s)) return true;
    return urlStr.toLowerCase().includes(s);
  } catch (e) {
    return urlStr.toLowerCase().includes(s);
  }
}

// new event listener: triggered when a new history entry is added
chrome.history.onVisited.addListener(async (historyItem) => {
  const enabled = await isAutoEnabled();
  if (!enabled) return;

  const sites = await getSites();
  if (!sites || sites.length === 0) return;

  for (const site of sites) {
    if (urlMatches(site, historyItem.url)) {
      console.log('Auto-deleting new history entry for:', site, historyItem.url);
      try {
        chrome.history.deleteUrl({ url: historyItem.url }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Error deleting', historyItem.url, chrome.runtime.lastError);
          } else {
            console.log('Deleted:', historyItem.url);
          }
        });
      } catch (err) {
        console.error('Deletion failed', err);
      }
    }
  }
});

// message handlers for popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  if (msg.type === 'toggleAuto') {
    chrome.storage.sync.set({ [STORAGE_AUTO]: !!msg.enabled }, () => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === 'manualClear') {
    getSites().then(sites => {
      sites.forEach(site => {
        chrome.history.search({ text: site, maxResults: 2000 }, (results) => {
          results.forEach(r => chrome.history.deleteUrl({ url: r.url }));
        });
      });
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === 'getState') {
    Promise.all([getSites(), isAutoEnabled()]).then(([sites, auto]) => sendResponse({ sites, auto }));
    return true;
  }
});
