class WindowManager {
  constructor() {
    this.windows = [];
    this.activeWindow = null;
    this.zIndexCounter = 100;
    this.desktop = document.getElementById('desktop');
  }

  createWindow(options) {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.width = options.width || '400px';
    win.style.height = options.height || '300px';
    win.style.left = options.x || '100px';
    win.style.top = options.y || '100px';
    win.style.zIndex = this.zIndexCounter++;

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
    title.textContent = options.title || 'Untitled';
    header.appendChild(title);

    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = options.content || '';

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle bottom-right';

    win.appendChild(header);
    win.appendChild(body);
    win.appendChild(resizeHandle);
    this.desktop.appendChild(win);

    this.windows.push(win);
    this.setActive(win);

    this._makeDraggable(win, header);
    this._makeResizable(win, resizeHandle);

    win.addEventListener('mousedown', () => this.setActive(win));

    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(win);
    });

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
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
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

  _makeResizable(win, handle) {
    let startX, startY, startWidth, startHeight;

    const onMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      win.style.width = `${newWidth}px`;
      win.style.height = `${newHeight}px`;
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