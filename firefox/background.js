let gridState = 'off'; // Track the current grid state

// Listen for the browser action (extension icon click)
browser.browserAction.onClicked.addListener((tab) => {
  const tabId = tab.id;

  if (gridState === 'off') {
    gridState = 'thirds';
    browser.browserAction.setIcon({ path: "icons/thirds_64.png", tabId: tabId });
  } else if (gridState === 'thirds') {
    gridState = 'phi';
    browser.browserAction.setIcon({ path: "icons/phi_64.png", tabId: tabId });
  } else if (gridState === 'phi') {
    gridState = 'off';
    browser.browserAction.setIcon({ path: "icons/grid_off_64.png", tabId: tabId });
  }

  // Inject content.js if it's not already injected
  browser.tabs.executeScript(tabId, { file: 'content.js' }, () => {
    // After injecting content.js, send the message to toggle the grid
    browser.tabs.sendMessage(tabId, { action: 'toggleGrid', gridState: gridState });
  });
});
