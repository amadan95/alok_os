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
    
    // Default home page - using a simple, reliable site
    this.homePage = "https://www.thewayofcode.com";
    
    // List of websites that are more likely to work in iframes
    this.compatibleSites = [
      { name: "The Way of Code", url: "https://www.thewayofcode.com" },
      { name: "Example.com", url: "http://example.com" },
      { name: "HTML5 Test", url: "https://html5test.com" },
      { name: "CSS Zen Garden", url: "http://www.csszengarden.com" },
      { name: "Project Gutenberg", url: "https://www.gutenberg.org" },
      { name: "HTML Standard", url: "https://html.spec.whatwg.org" },
      { name: "Wikipedia", url: "https://en.m.wikipedia.org" }
    ];
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
    this.createNewTab(this.homePage);
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
    homeBtn.addEventListener('click', () => this.navigateTo(this.homePage));
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
    const container = document.createElement('div');
    container.className = 'browser-container';
    
    // Create the iframe for web content
    const iframe = document.createElement('iframe');
    iframe.className = 'browser-frame';
    iframe.sandbox = "allow-scripts allow-forms allow-popups allow-top-navigation allow-modals";
    iframe.loading = "lazy";
    
    // Create a fallback message element
    const fallbackMessage = document.createElement('div');
    fallbackMessage.className = 'browser-fallback hidden';
    fallbackMessage.innerHTML = `
      <div class="fallback-content">
        <h3>Loading...</h3>
      </div>
    `;
    
    // Add both elements to the container
    container.appendChild(iframe);
    container.appendChild(fallbackMessage);
    
    // Create the tab element with initial "Loading..." title
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
      <img class="tab-favicon" src="/icons/Safari-Icon-from-Photoroom.png" />
      <span class="tab-title">Loading...</span>
      <button class="close-tab-btn">×</button>
    `;

    const contentArea = this.win.querySelector('.safari-content');
    contentArea.appendChild(container);

    const tabBar = this.win.querySelector('.tab-bar');
    const newTabBtn = this.win.querySelector('.new-tab-btn');
    tabBar.insertBefore(tabElement, newTabBtn);

    const tabData = {
      id: tabId,
      element: tabElement,
      container: container,
      iframe: iframe,
      fallbackMessage: fallbackMessage,
      history: [url],
      historyIndex: 0,
      title: url === 'about:blank' ? 'New Tab' : 'Loading...',
    };
    this.tabs.set(tabId, tabData);
    this.switchToTab(tabId);

    // Event listeners for the new tab
    tabElement.addEventListener('click', () => this.switchToTab(tabId));
    tabElement.querySelector('.close-tab-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });
    
    // Now load the URL if it's not about:blank
    if (url !== 'about:blank') {
      this.navigateTo(url, false);
    }
  }

  // Shows a fallback message when a site can't be loaded in an iframe
  showFallbackMessage(tabId, url) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    
    // Update the fallback message with more helpful content
    tab.fallbackMessage.innerHTML = `
      <div class="fallback-content">
        <h3>Unable to load website</h3>
        <p>Many modern websites cannot be displayed in Safari due to security restrictions.</p>
        <p>This is because browsers within browsers have limitations imposed by:</p>
        <ul style="text-align: left; margin-bottom: 15px;">
          <li>Content Security Policy (CSP)</li>
          <li>X-Frame-Options headers</li>
          <li>Cross-Origin Resource Sharing (CORS)</li>
        </ul>
        <p class="fallback-url">${url}</p>
        
        <div class="compatible-sites">
          <h4>Try these compatible sites instead:</h4>
          <ul>
            ${this.compatibleSites.map(site => 
              `<li><a href="#" class="compatible-site-link" data-url="${site.url}">${site.name}</a></li>`
            ).join('')}
          </ul>
        </div>
      </div>
    `;
    
    // Add event listeners to the compatible site links
    const links = tab.fallbackMessage.querySelectorAll('.compatible-site-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const siteUrl = e.target.getAttribute('data-url');
        this.navigateTo(siteUrl);
      });
    });
    
    tab.fallbackMessage.classList.remove('hidden');
    tab.iframe.classList.add('hidden');
    
    // Update the tab title to show the domain
    this.updateTabTitle(tabId, this.getDisplayNameFromUrl(url));
  }

  // Switches the active tab
  switchToTab(tabId) {
    if (this.activeTabId) {
      const oldTab = this.tabs.get(this.activeTabId);
      if(oldTab) {
        oldTab.element.classList.remove('active');
        oldTab.container.classList.remove('active');
      }
    }

    const newTab = this.tabs.get(tabId);
    if(newTab) {
      newTab.element.classList.add('active');
      newTab.container.classList.add('active');
      this.activeTabId = tabId;
      this.updateUIForActiveTab();
    }
  }

  // Closes a tab
  closeTab(tabId) {
    const tabData = this.tabs.get(tabId);
    if (!tabData) return;

    tabData.element.remove();
    tabData.container.remove();
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
  navigateTo(url, updateHistory = true) {
    let targetUrl = url.trim();
    
    // Handle search queries and incomplete URLs
    if (!/^(https?:\/\/|about:)/.test(targetUrl)) {
      // Check if it looks like a domain name
      if (/^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+$/.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      } else {
        // Treat as a search query to our home page
        targetUrl = this.homePage;
      }
    }
    
    const tab = this.tabs.get(this.activeTabId);
    if (!tab) return;
    
    // Reset the fallback message
    tab.fallbackMessage.classList.add('hidden');
    tab.iframe.classList.remove('hidden');
    
    // Update tab title to "Loading..."
    this.updateTabTitle(this.activeTabId, "Loading...");
    
    // Track if we've already shown the fallback for this URL
    let errorShown = false;
    let loadTimeout = null;
    
    // Clear any existing event listeners
    const oldIframe = tab.iframe;
    const newIframe = oldIframe.cloneNode(false);
    
    // Set a timeout to detect if the page doesn't load
    loadTimeout = setTimeout(() => {
      // If the iframe hasn't loaded content after 3 seconds, show the fallback
      if (!errorShown) {
        errorShown = true;
        this.showFallbackMessage(this.activeTabId, targetUrl);
      }
    }, 3000);
    
    // Add event listener to detect CSP errors
    newIframe.addEventListener('error', (e) => {
      console.error("Iframe error event triggered:", e);
      clearTimeout(loadTimeout);
      if (!errorShown) {
        errorShown = true;
        this.showFallbackMessage(this.activeTabId, targetUrl);
      }
    });
    
    // Listen for load event
    newIframe.addEventListener('load', () => {
      clearTimeout(loadTimeout);
      
      try {
        // Try to access the iframe content to check if it loaded
        const doc = newIframe.contentDocument || newIframe.contentWindow.document;
        
        // Check if we got a valid document
        if (!doc || !doc.body) {
          throw new Error("Empty document or no body element");
        }
        
        // If we can access the document without errors, it loaded successfully
        // Hide the fallback message if it was shown
        tab.fallbackMessage.classList.add('hidden');
        newIframe.classList.remove('hidden');
        errorShown = false;
        
        // Update tab title with the page title
        const pageTitle = doc.title || this.getDisplayNameFromUrl(targetUrl);
        this.updateTabTitle(this.activeTabId, pageTitle);
        
        console.log("Page loaded successfully:", pageTitle);
      } catch (e) {
        console.error("Error accessing iframe content:", e);
        
        // Security error - can't access cross-origin iframe
        // This could be either because:
        // 1. The page loaded successfully but is cross-origin
        // 2. The page failed to load due to CSP
        
        // Update tab title with domain name from URL
        const displayName = this.getDisplayNameFromUrl(targetUrl);
        this.updateTabTitle(this.activeTabId, displayName);
        console.log("Updated tab title to:", displayName);
        
        // Show the fallback message after a short delay to see if the page loads visually
        setTimeout(() => {
          // If the iframe appears empty or there was an error, show the fallback
          if (!errorShown && (newIframe.clientWidth === 0 || newIframe.clientHeight === 0)) {
            errorShown = true;
            this.showFallbackMessage(this.activeTabId, targetUrl);
          }
        }, 1000);
      }
    });
    
    // Replace the old iframe with the new one
    oldIframe.parentNode.replaceChild(newIframe, oldIframe);
    tab.iframe = newIframe;
    
    // Set the source URL - use the proxy API for external URLs
    if (targetUrl !== 'about:blank') {
      // For compatible sites, try loading directly first
      const isCompatibleSite = this.compatibleSites.some(site => targetUrl.includes(site.url));
      
      if (isCompatibleSite) {
        // Try loading directly first for compatible sites
        newIframe.src = targetUrl;
        console.log("Loading compatible site directly:", targetUrl);
      } else {
        // Use proxy for other external URLs
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
        newIframe.src = proxyUrl;
        console.log("Loading URL via proxy:", targetUrl);
      }
    } else {
      newIframe.src = targetUrl;
    }
    
    // Update history if needed
    if (updateHistory) {
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(targetUrl);
      tab.historyIndex = tab.history.length - 1;
    }

    this.updateUIForActiveTab();
  }
  
  // Update UI elements based on the active tab's state
  updateUIForActiveTab() {
    if (!this.activeTabId || !this.tabs.has(this.activeTabId)) return;
    
    const tab = this.tabs.get(this.activeTabId);
    const addressBar = this.win.querySelector('.address-bar');
    
    let displayUrl = tab.history[tab.historyIndex] || '';
    
    // Ensure we only show the clean URL
    addressBar.value = displayUrl.split('#')[0];
    
    // Update nav buttons
    this.win.querySelector('.back-btn').disabled = tab.historyIndex <= 0;
    this.win.querySelector('.forward-btn').disabled = tab.historyIndex >= tab.history.length - 1;
    
    // Update window title with current tab title
    this.updateTabTitle(this.activeTabId, tab.title);
  }

  // Update the tab title
  updateTabTitle(tabId, title) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    
    // Update the tab data
    tab.title = title || 'Untitled';
    
    // Update the tab element
    const titleElement = tab.element.querySelector('.tab-title');
    if (titleElement) {
      titleElement.textContent = tab.title;
      console.log("Tab title updated to:", tab.title);
    }
    
    // If this is the active tab, also update the window title
    if (this.activeTabId === tabId) {
      const windowTitleElement = this.win.querySelector('.window-title');
      if (windowTitleElement) {
        windowTitleElement.textContent = `Safari - ${tab.title}`;
      }
    }
  }

  // Navigation methods
  goBack() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex > 0) {
      tab.historyIndex--;
      const targetUrl = tab.history[tab.historyIndex];
      this.navigateTo(targetUrl, false);
    }
  }

  goForward() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex++;
      const targetUrl = tab.history[tab.historyIndex];
      this.navigateTo(targetUrl, false);
    }
  }

  reloadPage() {
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.history[tab.historyIndex]) {
      this.navigateTo(tab.history[tab.historyIndex], false);
    }
  }

  // Helper method to extract a display name from URL
  getDisplayNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || 'Untitled';
    } catch (e) {
      return url.split('/')[0] || 'Untitled';
    }
  }

  // Iframe load handler
  onIframeLoad(tabId) {
    const tab = this.tabs.get(tabId);
    if(!tab) return;
    this.updateUIForActiveTab();
  }
}

export default Safari; 