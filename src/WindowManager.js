class WindowManager {
  constructor() {
    this.windows = [];
    this.activeWindow = null;
    this.zIndexCounter = 100;
    this.desktop = document.getElementById('desktop');
  }

  createHeader(titleText, win, resizable) {
    const header = document.createElement('div');
    header.className = 'window-header';

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const closeButton = document.createElement('div');
    closeButton.className = 'window-control close';
    closeButton.innerHTML = `<span class="symbol">×</span>`;
    controls.appendChild(closeButton);

    const minimizeButton = document.createElement('div');
    minimizeButton.className = 'window-control minimize';
    minimizeButton.innerHTML = `<span class="symbol">−</span>`;
    controls.appendChild(minimizeButton);

    const maximizeButton = document.createElement('div');
    maximizeButton.className = 'window-control maximize';
    maximizeButton.innerHTML = `<span class="symbol">+</span>`;
    controls.appendChild(maximizeButton);

    header.appendChild(controls);

    const title = document.createElement('span');
    title.className = 'window-title';
    title.textContent = titleText || 'Untitled';
    header.appendChild(title);

    // Dragging logic
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - win.offsetLeft;
        dragOffsetY = e.clientY - win.offsetTop;
        this.setActive(win);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            win.style.left = `${e.clientX - dragOffsetX}px`;
            win.style.top = `${e.clientY - dragOffsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    return header;
  }

  createWindow(options) {
    const win = document.createElement('div');
    win.className = 'window';
    if (options.className) {
      win.classList.add(options.className);
    }
    win.style.width = options.width || '400px';
    win.style.height = options.height || '300px';
    
    // Calculate initial position with constraints
    const toolbarHeight = 22; // Standard macOS toolbar height
    let initialLeft = options.x ? parseInt(options.x) : 100;
    let initialTop = options.y ? parseInt(options.y) : 100;
    
    // Ensure window doesn't start under toolbar
    if (initialTop < toolbarHeight) {
      initialTop = toolbarHeight;
    }
    
    // Ensure window is within screen bounds
    const maxLeft = window.innerWidth - 100;
    const maxTop = window.innerHeight - 100;
    
    if (initialLeft > maxLeft) initialLeft = maxLeft;
    if (initialLeft < 0) initialLeft = 0;
    if (initialTop > maxTop) initialTop = maxTop;
    
    win.style.left = `${initialLeft}px`;
    win.style.top = `${initialTop}px`;
    win.style.zIndex = this.zIndexCounter++;

    const header = this.createHeader(options.title, win, options.resizable);
    win.appendChild(header);

    const body = document.createElement('div');
    body.className = 'window-body';

    const contentPane = document.createElement('div');
    contentPane.className = 'app-content';
    contentPane.innerHTML = options.content || '';
    body.appendChild(contentPane);

    win.appendChild(body);

    // Create resize handles for all corners and edges
    const resizePositions = [
      'top-left', 'top', 'top-right',
      'left', 'right',
      'bottom-left', 'bottom', 'bottom-right'
    ];
    
    resizePositions.forEach(position => {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = `resize-handle ${position}`;
      win.appendChild(resizeHandle);
      this._makeResizable(win, resizeHandle, position);
    });

    this.desktop.appendChild(win);
    this.windows.push(win);
    this.setActive(win);

    this._makeDraggable(win, header);

    win.addEventListener('mousedown', () => this.setActive(win));

    const closeButton = header.querySelector('.window-control.close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeWindow(win);
      });
    }

    const minimizeButton = header.querySelector('.window-control.minimize');
    if (minimizeButton) {
      minimizeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const appIcon = document.querySelector(`.dock-item img[alt="${options.title}"]`);
        if (appIcon) {
          this._animateMinimize(win, appIcon);
        } else {
          // Fallback if icon isn't found
          win.style.display = 'none';
        }
      });
    }

    return win;
  }

  setActive(win) {
    if (this.activeWindow) {
      this.activeWindow.classList.remove('active');
    }
    this.activeWindow = win;
    win.classList.add('active');
    win.style.zIndex = this.zIndexCounter++;
  }

  closeWindow(win) {
    const index = this.windows.indexOf(win);
    if (index > -1) {
      this.windows.splice(index, 1);
    }
    win.remove();
  }

  _makeDraggable(win, handle) {
    let offsetX, offsetY;

    const onMouseMove = (e) => {
      // Calculate new position
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;
      
      // Prevent window from going above the toolbar (top < 22px)
      const toolbarHeight = 22; // Standard macOS toolbar height
      if (newTop < toolbarHeight) {
        newTop = toolbarHeight;
      }
      
      // Prevent window from going off screen
      const maxLeft = window.innerWidth - 50; // Keep at least 50px visible
      const maxTop = window.innerHeight - 50; // Keep at least 50px visible
      
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newLeft < 0) newLeft = 0;
      if (newTop > maxTop) newTop = maxTop;
      
      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', (e) => {
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  _makeResizable(win, handle, position) {
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    const onMouseMove = (e) => {
      // Calculate position changes
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Minimum window dimensions
      const minWidth = 200;
      const minHeight = 150;
      
      // Toolbar height constraint
      const toolbarHeight = 22;
      
      // New dimensions and positions
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
      
      // Handle resize based on position
      if (position.includes('right')) {
        newWidth = Math.max(minWidth, startWidth + dx);
      }
      
      if (position.includes('bottom')) {
        newHeight = Math.max(minHeight, startHeight + dy);
      }
      
      if (position.includes('left')) {
        const possibleWidth = startWidth - dx;
        if (possibleWidth >= minWidth) {
          newWidth = possibleWidth;
          newLeft = startLeft + dx;
        }
      }
      
      if (position.includes('top')) {
        const possibleHeight = startHeight - dy;
        if (possibleHeight >= minHeight) {
          // Ensure we don't go above the toolbar
          const newPossibleTop = startTop + dy;
          if (newPossibleTop >= toolbarHeight) {
            newHeight = possibleHeight;
            newTop = newPossibleTop;
          }
        }
      }
      
      // Apply new dimensions and positions
      win.style.width = `${newWidth}px`;
      win.style.height = `${newHeight}px`;
      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = win.offsetWidth;
      startHeight = win.offsetHeight;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  _animateMinimize(windowEl, targetIcon) {
    const windowRect = windowEl.getBoundingClientRect();
    const iconRect = targetIcon.getBoundingClientRect();

    const animationEl = windowEl.cloneNode(true);
    animationEl.style.position = 'fixed';
    animationEl.style.left = `${windowRect.left}px`;
    animationEl.style.top = `${windowRect.top}px`;
    animationEl.style.width = `${windowRect.width}px`;
    animationEl.style.height = `${windowRect.height}px`;
    animationEl.style.margin = '0';
    animationEl.style.zIndex = '20000';
    animationEl.style.transition = 'transform 0.4s cubic-bezier(0.5, 0, 1, 0.5), opacity 0.4s ease-out';
    document.body.appendChild(animationEl);

    windowEl.style.display = 'none';

    requestAnimationFrame(() => {
      const scaleX = iconRect.width / windowRect.width;
      const scaleY = iconRect.height / windowRect.height;
      
      const translateX = iconRect.left - windowRect.left;
      const translateY = iconRect.top - windowRect.top;

      animationEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
      animationEl.style.opacity = '0';
    });

    setTimeout(() => {
      animationEl.remove();
    }, 400);
  }
}

export default new WindowManager(); 