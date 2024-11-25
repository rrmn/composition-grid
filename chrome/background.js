// Object to keep track of grid states per tab
const gridStates = {}; // key: tabId, value: gridState ('off', 'thirds', 'phi')

chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu for setting custom colors
  chrome.contextMenus.create({
    id: 'set-grid-color',
    title: 'Set Grid Color',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'set-grid-color') {
    const tabId = tab.id;
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const color = prompt('Enter a color for the grid (e.g., red, #FF0000):');
        if (color) {
          chrome.runtime.sendMessage({ action: 'saveGridColor', color });
        }
      },
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'saveGridColor') {
    const color = message.color;
    chrome.storage.local.set({ gridColor: color }, () => {
      console.log(`Grid color saved: ${color}`);
      if (sender.tab) {
        // Notify the content script to update the grid color if it is shown
        chrome.tabs.sendMessage(sender.tab.id, { action: 'updateGridColor', color });
      }
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  let gridState = gridStates[tabId] || 'off';

  if (gridState === 'off') {
    gridState = 'thirds';
    chrome.action.setIcon({ path: "icons/thirds_64.png", tabId: tabId });

    // Load saved color and apply it
    chrome.storage.local.get('gridColor', (result) => {
      const color = result.gridColor || 'red'; // Default to 'red' if no color is saved
      chrome.scripting.executeScript({
        target: { tabId },
        func: (color) => {
          const style = document.getElementById('cg-composition-grid-styles');
          if (style) {
            style.textContent = style.textContent.replace(/background:.*?;/g, `background: ${color};`);
          }
        },
        args: [color],
      });
    });
  } else if (gridState === 'thirds') {
    gridState = 'phi';
    chrome.action.setIcon({ path: "icons/phi_64.png", tabId: tabId });
  } else if (gridState === 'phi') {
    gridState = 'off';
    chrome.action.setIcon({ path: "icons/grid_off_64.png", tabId: tabId });
  }

  gridStates[tabId] = gridState;

  // Inject content.js into the tab
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['content.js'],
    },
    () => {
      // Send a message to content.js after it's injected
      chrome.tabs.sendMessage(tabId, { action: 'toggleGrid', gridState: gridState });
    }
  );
});
