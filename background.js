// Initialize tabInfoList object
let tabInfoList = {};

// Load tabInfoList from storage
chrome.storage.local.get("tabInfoList", function(result) {
  tabInfoList = result.tabInfoList || {};
});

// Check if all tabs in tabInfoList exist in the session. Delete the ones not in the session.
chrome.tabs.query({}, function(tabs) {
  let activeTabIds = tabs.map(function(tab) { return tab.id; });
  let tabInfoListUpdated = false;
  for (let tabInfo in tabInfoList) {
    if (activeTabIds.indexOf(parseInt(tabInfo.id)) === -1) {
      delete tabInfoList[tanInfo];
      tabInfoListUpdated = true;
    }
  }
  if (tabInfoListUpdated) {
    chrome.storage.local.set({ tabInfoListUpdated: tabInfoListUpdated });
  }
});

// Load already opened tabs.
chrome.tabs.query({}, function(tabs) {
  var tabInfoListUpdated = false;
  tabs.forEach(function(tab) {
    if (!(tab.id in tabInfoList)) {
      var tabInfo = {
          id: tab.id,
          title: tab.title,
          firstOpened: new Date().toLocaleString(),
          lastOpened: new Date().toLocaleString()
      };
      tabInfoList[tab.id] = tabInfo;
      tabInfoListUpdated = true;
    }
  });
  if (tabInfoListUpdated) {
    chrome.storage.local.set({ tabInfoListUpdated: tabInfoListUpdated });
  }
});

// Update tabsInfo when a tab is updated or activated
function updateTabInfo(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" || changeInfo.active === true) {
    if (!(tabId in tabInfoList)) {
      tabInfoList[tabId] = { id:tab.id, title: tab.title, firstOpened: new Date().toLocaleString(), lastOpened: new Date().toLocaleString() };
    } else {
      tabInfoList[tabId].title = tab.title;
      tabInfoList[tabId].lastOpened = new Date().toLocaleString();
    }
    chrome.storage.local.set({ tabInfoList: tabInfoList });
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
  delete tabInfoList[tabId];
  chrome.storage.local.set({ tabInfoList: tabInfoList });
});

// Message listener to retrieve tabsInfo from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "getTabInfo") {
    sendResponse(tabInfoList);
  }
});