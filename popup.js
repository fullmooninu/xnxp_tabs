function switchToTab(tabId) {
  chrome.tabs.get(tabId, function(my_tab) {
    chrome.windows.update(my_tab.windowId, { focused: true }, function() {
      chrome.tabs.update(my_tab.id, { active: true });
    });
  });
}

// Send message to background script to retrieve tab info
let maxTitleLength = 50;

chrome.runtime.sendMessage("getTabInfo", function(tabsInfo) {
  var tableBody = document.getElementById("table-body");
  for (var tabId in tabsInfo) {
    var tab = tabsInfo[tabId];
    
    var row = document.createElement("tr");
    var firstOpenedCell = document.createElement("td");
    firstOpenedCell.textContent = tab.firstOpened;
    var lastOpenedCell = document.createElement("td");
    lastOpenedCell.textContent = tab.lastOpened;
    var titleCell = document.createElement("td");
    titleCell.textContent = tab.title.slice(0,maxTitleLength);

    // Create the close button element
    var closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", function() {
      chrome.tabs.remove(tab.id);
    });
    

    // Create the switch button element
    var switchButton = document.createElement("button");
    switchButton.textContent = "Switch";
    switchButton.addEventListener("click", function() {
      switchToTab(tab.id);
    });

    // Create the button cell element
    var buttonCell = document.createElement("td");
    buttonCell.textContent = tab.id;
    buttonCell.appendChild(closeButton);
    buttonCell.appendChild(switchButton);

    // Add the cells to the row
    row.appendChild(firstOpenedCell);
    row.appendChild(lastOpenedCell);
    row.appendChild(titleCell);
    row.appendChild(buttonCell);


    tableBody.appendChild(row);

  }
});