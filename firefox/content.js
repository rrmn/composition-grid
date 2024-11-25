// Ensure 'cgContainer' is only declared once and prevent redeclaration
if (typeof cgContainer === 'undefined') {
  var cgContainer;

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleGrid') {
      if (request.gridState === 'off') {
        removeGrid();
      } else if (request.gridState === 'thirds') {
        showThirdsGrid();
      } else if (request.gridState === 'phi') {
        showPhiGrid();
      }
    }
  });

  function injectStyles() {
    if (!document.getElementById('cg-composition-grid-styles')) {
      const style = document.createElement('style');
      style.id = 'cg-composition-grid-styles';
      style.textContent = `
        :root { --gr: 1.618; }
        .cg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1701;
        }
        .cg-thirds-line-1, .cg-thirds-line-2, .cg-thirds-line-3, .cg-thirds-line-4, 
        .cg-phi-line-1, .cg-phi-line-2, .cg-phi-line-3, .cg-phi-line-4 {
          position: absolute;
          background: red;
          opacity: 0.5;
          display: none;
        }
        .cg-thirds-line-1 { top: calc(100vh / 3); left: 0; height: 1px; width: 100vw; }
        .cg-thirds-line-2 { top: calc(2 * 100vh / 3); left: 0; height: 1px; width: 100vw; }
        .cg-thirds-line-3 { left: calc(100vw / 3); top: 0; width: 1px; height: 100vh; }
        .cg-thirds-line-4 { left: calc(2 * 100vw / 3); top: 0; width: 1px; height: 100vh; }
        .cg-phi-line-1 { top: calc(100vh * (1 - 1 / var(--gr))); left: 0; height: 1px; width: 100vw; }
        .cg-phi-line-2 { top: calc(100vh * (1 / var(--gr))); left: 0; height: 1px; width: 100vw; }
        .cg-phi-line-3 { left: calc(100vw * (1 - 1 / var(--gr))); top: 0; width: 1px; height: 100vh; }
        .cg-phi-line-4 { left: calc(100vw * (1 / var(--gr))); top: 0; width: 1px; height: 100vh; }
      `;
      document.head.appendChild(style);
    }
  }

  function removeGrid() {
    if (cgContainer) {
      cgContainer.parentNode.removeChild(cgContainer);
      cgContainer = null;
    }
  }

  function showThirdsGrid() {
    injectStyles();
    createGrid();
    toggleLines('thirds');
  }

  function showPhiGrid() {
    injectStyles();
    createGrid();
    toggleLines('phi');
  }

  function createGrid() {
    if (!cgContainer) {
      // Create the container
      cgContainer = document.createElement('div');
      cgContainer.classList.add('cg-container');

      // Create the grid lines
      const lines = [];

      // Thirds lines
      for (let i = 1; i <= 4; i++) {
        const line = document.createElement('div');
        line.classList.add(`cg-thirds-line-${i}`);
        lines.push(line);
      }

      // Phi lines
      for (let i = 1; i <= 4; i++) {
        const line = document.createElement('div');
        line.classList.add(`cg-phi-line-${i}`);
        lines.push(line);
      }

      // Append lines to container
      lines.forEach(line => cgContainer.appendChild(line));

      // Append container to body
      document.body.appendChild(cgContainer);
    }
  }

  function toggleLines(type) {
    const thirdsLines = cgContainer.querySelectorAll('.cg-thirds-line-1, .cg-thirds-line-2, .cg-thirds-line-3, .cg-thirds-line-4');
    const phiLines = cgContainer.querySelectorAll('.cg-phi-line-1, .cg-phi-line-2, .cg-phi-line-3, .cg-phi-line-4');

    if (type === 'thirds') {
      thirdsLines.forEach(line => (line.style.display = 'block'));
      phiLines.forEach(line => (line.style.display = 'none'));
    } else if (type === 'phi') {
      thirdsLines.forEach(line => (line.style.display = 'none'));
      phiLines.forEach(line => (line.style.display = 'block'));
    }
  }
}
