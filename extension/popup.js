const siteInput = document.getElementById('siteInput');
const addBtn = document.getElementById('addSite');
const siteList = document.getElementById('siteList');
const clearBtn = document.getElementById('clearMatching'); // updated ID
const autoToggle = document.getElementById('autoModeToggle');

let sites = [];

// Load saved data
chrome.storage.sync.get(['sites', 'autoEnabled'], (res) => {
  sites = res.sites || [];
  autoToggle.checked = !!res.autoEnabled;
  renderList();
});

// Add site
addBtn.addEventListener('click', () => {
  const site = siteInput.value.trim();
  if (!site) return;

  if (!sites.includes(site)) {
    sites.push(site);
    chrome.storage.sync.set({ sites });
    renderList();
  }

  siteInput.value = '';
});

// Render site list
function renderList() {
  siteList.innerHTML = '';
  sites.forEach((site) => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = site;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => {
      sites = sites.filter((s) => s !== site);
      chrome.storage.sync.set({ sites });
      renderList();
    };

    li.appendChild(text);
    li.appendChild(del);
    siteList.appendChild(li);
  });
}

clearBtn.addEventListener('click', () => {
  if (sites.length === 0) {
    alert("No sites in your list to clear.");
    return;
  }

  let clearedCount = 0;

  chrome.history.search({ text: '', maxResults: 5000 }, (historyItems) => {
    historyItems.forEach((item) => {
      for (const site of sites) {
        if (item.url && item.url.includes(site)) {
          chrome.history.deleteUrl({ url: item.url });
          clearedCount++;
          break;
        }
      }
    });

    alert(`✅ Cleared ${clearedCount} matching entries.`);
  });
});

// Toggle auto mode
autoToggle.addEventListener('change', () => {
  const enabled = autoToggle.checked;
  chrome.storage.sync.set({ autoEnabled: enabled });
});
