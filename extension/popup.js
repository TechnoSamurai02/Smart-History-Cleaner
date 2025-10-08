const urlInput = document.getElementById("urlInput");
const addBtn = document.getElementById("addBtn");
const siteList = document.getElementById("siteList");
const clearBtn = document.getElementById("clearHistoryBtn");

let sites = [];

// Load saved sites
chrome.storage.sync.get(["sites"], (result) => {
  if (result.sites) {
    sites = result.sites;
    updateList();
  }
});

addBtn.addEventListener("click", () => {
  const site = urlInput.value.trim();
  if (site && !sites.includes(site)) {
    sites.push(site);
    chrome.storage.sync.set({ sites });
    updateList();
    urlInput.value = "";
  }
});

// Function to delete a site
function deleteSite(site) {
  sites = sites.filter((s) => s !== site);
  chrome.storage.sync.set({ sites });
  updateList();
}

// Function to update list display
function updateList() {
  siteList.innerHTML = "";
  sites.forEach((site) => {
    const li = document.createElement("li");
    li.textContent = site;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteSite(site);

    li.appendChild(deleteBtn);
    siteList.appendChild(li);
  });
}

clearBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearHistory", sites });
});
