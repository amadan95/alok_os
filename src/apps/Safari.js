import WindowManager from '../WindowManager';
import './Safari.css';

class Safari {
  constructor() {
    this.name = 'Safari';
    this.icon = new URL('../../assets/icons/Safari.png', import.meta.url).href;
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
            <input type="text" class="address-bar" value="https://www.google.com">
          </div>
        </div>
        <div class="safari-content">
          <iframe src="http://localhost:3001/" class="browser-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-modals" allowfullscreen></iframe>
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

    // Add error handling for iframe loading
    iframe.addEventListener('load', () => {
      console.log('Safari iframe loaded successfully');
    });
    
    iframe.addEventListener('error', (e) => {
      console.error('Safari iframe error:', e);
    });

    let history = ['https://www.google.com'];
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
      iframe.src = `http://localhost:3001/`;
      addressBar.value = "https://www.google.com";
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
  }
}

export default new Safari(); 