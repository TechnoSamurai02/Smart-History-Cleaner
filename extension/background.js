console.log("Smart History Cleaner background loaded");

function getSites(callback) {
  chrome.storage.sync.get(["sites"], (result) => {
    const sites = result.sites || [];
    console.log("Loaded sites:", sites);
    callback(sites);
  });
}

// Manual clear (button)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clearHistory" && message.sites) {
    console.log("Manual clear triggered for:", message.sites);
    clearHistory(message.sites);
  }
});

// Core clear logic
function clearHistory(sites) {
  sites.forEach((site) => {
    console.log("Deleting history for:", site);
    chrome.history.search({ text: site }, (results) => {
      console.log(`Found ${results.length} entries for ${site}`);
      results.forEach((page) => {
        chrome.history.deleteUrl({ url: page.url });
      });
    });
  });
}

// Auto-delete listener
chrome.webNavigation.onCompleted.addListener((details) => {
  const visitedUrl = details.url;
  console.log("Visited:", visitedUrl);

  getSites((sites) => {
    sites.forEach((site) => {
      if (visitedUrl.includes(site)) {
        console.log(`Auto-deleting history for: ${site}`);
        clearHistory([site]);
      }
    });
  });
});

console.log("Background script ready");
