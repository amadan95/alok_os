import WindowManager from '../WindowManager';
import './Safari.css';

class Safari {
  constructor() {
    this.name = 'Safari';
  }

  launch() {
    const content = `
      <div class="safari-app">
        <div class="safari-toolbar">
          <div class="navigation-buttons">
            <button class="nav-button back" disabled>◀</button>
            <button class="nav-button forward" disabled>▶</button>
          </div>
          <div class="address-bar-container">
            <input type="text" class="address-bar" value="https://oldgoogle.neocities.org/2009/">
          </div>
        </div>
        <div class="safari-content">
          <iframe src="http://localhost:3001/?url=https://oldgoogle.neocities.org/2009/" class="browser-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        </div>
      </div>
    `;

    const win = WindowManager.createWindow({
      title: 'Safari',
      width: '900px',
      height: '700px',
      content: content,
    });

    const iframe = win.querySelector('.browser-frame');
    const addressBar = win.querySelector('.address-bar');
    const backButton = win.querySelector('.back');
    const forwardButton = win.querySelector('.forward');

    let history = ['https://oldgoogle.neocities.org/2009/'];
    let historyIndex = 0;

    const updateNavButtons = () => {
      backButton.disabled = historyIndex === 0;
      forwardButton.disabled = historyIndex >= history.length - 1;
    };

    const navigate = (url) => {
      let fullUrl = url.trim();
      // simple check if it's a search query or a URL
      if (!/^(https?:\/\/)|(.*\..*)/i.test(fullUrl) || fullUrl.includes(" ")) {
        // It's a search query if it doesn't look like a URL or contains spaces
        fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
      } else if (!/^https?:\/\//i.test(fullUrl)) {
        // It's a URL without protocol
        fullUrl = 'https://' + fullUrl;
      }
      iframe.src = `http://localhost:3001/?url=${encodeURIComponent(fullUrl)}`;
      addressBar.value = fullUrl;
    };

    addressBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const newUrl = addressBar.value;
        // Add to history
        history = history.slice(0, historyIndex + 1);
        history.push(newUrl);
        historyIndex++;
        
        navigate(newUrl);
        updateNavButtons();
      }
    });

    backButton.addEventListener('click', () => {
      if (historyIndex > 0) {
        historyIndex--;
        navigate(history[historyIndex]);
        updateNavButtons();
      }
    });

    forwardButton.addEventListener('click', () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        navigate(history[historyIndex]);
        updateNavButtons();
      }
    });

    iframe.addEventListener('load', () => {
      try {
        const newUrl = iframe.contentWindow.location.href;
        if (newUrl && newUrl !== 'about:blank' && newUrl !== history[historyIndex]) {
          addressBar.value = newUrl;
          history = history.slice(0, historyIndex + 1);
          history.push(newUrl);
          historyIndex++;
          updateNavButtons();
        }
      } catch (e) {
        // Cross-origin error, can't access iframe location
        // The address bar will just show the last manually entered URL
      }
    });
  }
}

export default new Safari(); 