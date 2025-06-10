import WindowManager from '../WindowManager';
import './Safari.css';

// The main class for the Safari application
class Safari {
  constructor() {
    this.name = 'Safari';
    this.icon = '/Safari-Icon-from-Photoroom.png';
    this.tabs = new Map(); // Using a Map to store tab data
    this.activeTabId = null;
    this.win = null; // To hold the window instance
  }

  // Launch the application window
  launch() {
    const content = `
      <div class="safari-app">
        <div class="safari-header">
          <div class="safari-toolbar">
            <div class="nav-buttons">
              <button class="back-btn" disabled>◀</button>
              <button class="forward-btn" disabled>▶</button>
              <button class="refresh-btn">↻</button>
              <button class="home-btn">⌂</button>
            </div>
            <div class="address-bar-container">
              <input type="text" class="address-bar" />
            </div>
            <div class="action-buttons">
              <button class="add-bookmark-btn">☆</button>
            </div>
          </div>
          <div class="tab-bar">
            <button class="new-tab-btn">+</button>
          </div>
        </div>
        <div class="safari-content"></div>
      </div>
    `;

    this.win = WindowManager.createWindow({
      title: 'Safari',
      width: '1024px',
      height: '768px',
      content,
    });

    // Initial setup
    this.setupEventListeners();
    this.createNewTab('https://www.google.com');
  }

  // Centralized event listener setup
  setupEventListeners() {
    const backBtn = this.win.querySelector('.back-btn');
    const forwardBtn = this.win.querySelector('.forward-btn');
    const refreshBtn = this.win.querySelector('.refresh-btn');
    const homeBtn = this.win.querySelector('.home-btn');
    const addressBar = this.win.querySelector('.address-bar');
    const newTabBtn = this.win.querySelector('.new-tab-btn');

    backBtn.addEventListener('click', () => this.goBack());
    forwardBtn.addEventListener('click', () => this.goForward());
    refreshBtn.addEventListener('click', () => this.reloadPage());
    homeBtn.addEventListener('click', () => this.navigateTo('https://www.google.com'));
    newTabBtn.addEventListener('click', () => this.createNewTab());

    addressBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.navigateTo(e.target.value);
      }
    });
  }

  // Creates a new tab
  createNewTab(url = 'about:blank') {
    const tabId = `tab-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.className = 'browser-frame';
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-modals";
    iframe.src = url === 'about:blank' ? url : `/proxy/${encodeURIComponent(url)}`;

    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
      <img class="tab-favicon" src="/default-favicon.png" />
      <span class="tab-title">New Tab</span>
      <button class="close-tab-btn">×</button>
    `;

    const contentArea = this.win.querySelector('.safari-content');
    contentArea.appendChild(iframe);

    const tabBar = this.win.querySelector('.tab-bar');
    const newTabBtn = this.win.querySelector('.new-tab-btn');
    tabBar.insertBefore(tabElement, newTabBtn);

    const tabData = {
      id: tabId,
      element: tabElement,
      iframe: iframe,
      history: [iframe.src],
      historyIndex: 0,
      title: 'New Tab',
    };
    this.tabs.set(tabId, tabData);
    this.switchToTab(tabId);

    // Event listeners for the new tab
    tabElement.addEventListener('click', () => this.switchToTab(tabId));
    tabElement.querySelector('.close-tab-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });

    iframe.addEventListener('load', () => this.onIframeLoad(tabId));
  }

  // Switches the active tab
  switchToTab(tabId) {
    if (this.activeTabId) {
      const oldTab = this.tabs.get(this.activeTabId);
      if(oldTab) {
        oldTab.element.classList.remove('active');
        oldTab.iframe.classList.remove('active');
      }
    }

    const newTab = this.tabs.get(tabId);
    if(newTab) {
      newTab.element.classList.add('active');
      newTab.iframe.classList.add('active');
      this.activeTabId = tabId;
      this.updateUIForActiveTab();
    }
  }

  // Closes a tab
  closeTab(tabId) {
    const tabData = this.tabs.get(tabId);
    if (!tabData) return;

    tabData.element.remove();
    tabData.iframe.remove();
    this.tabs.delete(tabId);

    // If we closed the active tab, switch to another one or close the window
    if (this.activeTabId === tabId) {
      if (this.tabs.size > 0) {
        const firstTabId = this.tabs.keys().next().value;
        this.switchToTab(firstTabId);
      } else {
        WindowManager.closeWindow(this.win);
      }
    }
  }

  // Main navigation logic
  navigateTo(url) {
    let targetUrl = url.trim();
    if (!/^(https?:\/\/|about:)/.test(targetUrl)) {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    }
    
    const tab = this.tabs.get(this.activeTabId);
    if (!tab) return;
    
    const proxiedUrl = targetUrl.startsWith('about:') ? targetUrl : `/proxy/${encodeURIComponent(targetUrl)}`;
    tab.iframe.src = proxiedUrl;
    
    // Update history
    tab.history = tab.history.slice(0, tab.historyIndex + 1);
    tab.history.push(proxiedUrl);
    tab.historyIndex = tab.history.length - 1;

    this.updateUIForActiveTab();
  }
  
  // Update UI elements based on the active tab's state
  updateUIForActiveTab() {
    if (!this.activeTabId || !this.tabs.has(this.activeTabId)) return;
    
    const tab = this.tabs.get(this.activeTabId);
    const addressBar = this.win.querySelector('.address-bar');
    
    let displayUrl = tab.history[tab.historyIndex] || '';
    if (displayUrl.startsWith('/proxy/')) {
        displayUrl = decodeURIComponent(displayUrl.substring(7)); // remove '/proxy/' and decode
    }
    // Ensure we only show the clean URL
    addressBar.value = displayUrl.split('#')[0];
    
    // Update nav buttons
    this.win.querySelector('.back-btn').disabled = tab.historyIndex <= 0;
    this.win.querySelector('.forward-btn').disabled = tab.historyIndex >= tab.history.length - 1;

    // Update tab title
    tab.element.querySelector('.tab-title').textContent = tab.title;

    // Update window title
    const titleElement = this.win.querySelector('.window-title');
    if (titleElement) {
        titleElement.textContent = `Safari - ${tab.title}`;
    }

    try {
      const newTitle = tab.iframe.contentWindow.document.title || 'Untitled';
      if (newTitle && newTitle !== tab.title) {
        tab.title = newTitle;
        this.updateTitles(tab);
      }
    } catch (e) {
      // Cross-origin iframe, title cannot be accessed.
      // We will use the URL as a fallback.
      let url = tab.history[tab.historyIndex] || '';
      if (url.startsWith('/proxy/')) url = decodeURIComponent(url.substring(7));
      const newTitle = url.split('/')[2] || 'Untitled Page';
      if (newTitle !== tab.title) {
        tab.title = newTitle;
        this.updateTitles(tab);
      }
    }
  }

  // Helper to update titles consistently
  updateTitles(tab) {
    tab.element.querySelector('.tab-title').textContent = tab.title;
    const titleElement = this.win.querySelector('.window-title');
    if (titleElement) {
        titleElement.textContent = `Safari - ${tab.title}`;
    }
  }

  // Iframe load handler
  onIframeLoad(tabId) {
    const tab = this.tabs.get(tabId);
    if(!tab) return;
    this.updateUIForActiveTab();
  }

  // Navigation methods
  goBack() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex > 0) {
      tab.historyIndex--;
      tab.iframe.src = tab.history[tab.historyIndex];
      this.updateUIForActiveTab();
    }
  }

  goForward() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex++;
      tab.iframe.src = tab.history[tab.historyIndex];
      this.updateUIForActiveTab();
    }
  }

  reloadPage() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab) {
      tab.iframe.contentWindow.location.reload();
    }
  }
}

export default Safari; 