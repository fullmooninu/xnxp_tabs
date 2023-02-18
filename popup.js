// Send message to background script to retrieve tab info
let maxTitleLength = 50;

chrome.runtime.sendMessage("getTabInfo", function(tabInfoList) {
  var tableBody = document.getElementById("table-body");
  for (var tabId in tabInfoList) {
    var tabInfo = tabInfoList[tabId];
    
    var row = document.createElement("tr");
    
    var firstOpenedCell = document.createElement("td");
    firstOpenedCell.textContent = tabInfo.firstOpened;
    
    var lastOpenedCell = document.createElement("td");
    lastOpenedCell.textContent = tabInfo.lastOpened;
    
    var titleCell = document.createElement("td");
    titleCell.textContent = tabInfo.title.slice(0,maxTitleLength);

    var idCell = document.createElement("td");
    idCell.textContent = tabInfo.id

    // Create the close button element
    var closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", function() {
      chrome.tabs.remove(tabInfo.id);
    });
    

    // Create the switch button element
    var switchButton = document.createElement("button");
    switchButton.textContent = "Switch";
    switchButton.addEventListener("click", function() {
      // Update the tabId value inside the click event listener
      chrome.tabs.get(tabInfo.id, function(tab) {
        chrome.windows.update(tab.windowId, { focused: true }, function() {
          chrome.tabs.update(tab.id, { active: true });
        });
      });
    });

    // Create the button cell element
    var buttonCell = document.createElement("td");
    buttonCell.appendChild(closeButton);
    buttonCell.appendChild(switchButton);

    // Add the cells to the row
    row.appendChild(firstOpenedCell);
    row.appendChild(lastOpenedCell);
    row.appendChild(titleCell);
    row.appendChild(idCell);
    row.appendChild(buttonCell);

    tableBody.appendChild(row);

  }
});
