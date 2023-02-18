// Initialize tabsInfo object
var tabsInfo = {};

// Load tab info from storage
chrome.storage.local.get("tabsInfo", function(result) {
  tabsInfo = result.tabsInfo || {};
});

// Check if all tabs in tabsInfo exist in the session
chrome.tabs.query({}, function(tabs) {
  var activeTabIds = tabs.map(function(tab) { return tab.id; });
  var tabsInfoUpdated = false;
  for (var tabId in tabsInfo) {
    if (activeTabIds.indexOf(parseInt(tabId)) === -1) {
      delete tabsInfo[tabId];
      tabsInfoUpdated = true;
    }
  }
  if (tabsInfoUpdated) {
    chrome.storage.local.set({ tabsInfo: tabsInfo });
  }
});

// Load already opened tabs
chrome.tabs.query({}, function(tabs) {
  var tabsInfoUpdated = false;
  tabs.forEach(function(tab) {
    if (!(tab.id in tabsInfo)) {
      var tabInfo = {
          id: tab.id,
          title: tab.title,
          firstOpened: new Date().toLocaleString(),
          lastOpened: new Date().toLocaleString()
      };
      tabsInfo[tab.id] = tabInfo;
      tabsInfoUpdated = true;
    }
  });
  if (tabsInfoUpdated) {
    chrome.storage.local.set({ tabsInfo: tabsInfo });
  }
});

// Update tabsInfo when a tab is updated or activated
function updateTabInfo(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" || changeInfo.active === true) {
    if (!(tabId in tabsInfo)) {
      tabsInfo[tabId] = { id:tab.id, title: tab.title, firstOpened: new Date().toLocaleString(), lastOpened: new Date().toLocaleString() };
    } else {
      tabsInfo[tabId].title = tab.title;
      tabsInfo[tabId].lastOpened = new Date().toLocaleString();
    }
    chrome.storage.local.set({ tabsInfo: tabsInfo });
  }
}
chrome.tabs.onUpdated.addListener(updateTabInfo);
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    updateTabInfo(tab.id, { active: true }, tab);
  });
});

// Remove tab from tabsInfo when it is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  delete tabsInfo[tabId];
  chrome.storage.local.set({ tabsInfo: tabsInfo });
});

// Message listener to retrieve tabsInfo from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "getTabInfo") {
    sendResponse(tabsInfo);
  }
});