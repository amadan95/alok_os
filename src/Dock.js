class Dock {
  constructor() {
    this.dockContainer = document.getElementById('dock');
    this.icons = [];
    this.dockContainer.addEventListener('mousemove', this._magnify.bind(this));
    this.dockContainer.addEventListener('mouseleave', this._reset.bind(this));
  }

  addApplication(app) {
    const icon = document.createElement('div');
    icon.className = 'dock-item';
    
    if (app.placeholderClass) {
      icon.classList.add(app.placeholderClass);
      icon.innerHTML = `<span class="app-label">${app.name}</span>`;
    } else {
      const img = new Image();
      img.onload = () => {
        console.log(`Successfully loaded icon for ${app.name}`);
      };
      img.onerror = (error) => {
        console.error(`Failed to load icon for ${app.name}:`, error);
        console.log('Attempted icon path:', app.icon);
      };
      img.src = app.icon;
      img.alt = app.name;
      
      icon.innerHTML = `
        <span class="app-label">${app.name}</span>
      `;
      icon.insertBefore(img, icon.firstChild);
    }

    this.dockContainer.appendChild(icon);
    this.icons.push({ element: icon, ...app });

    icon.addEventListener('click', () => {
      if (app.action) {
        app.action();
      }
    });
  }

  _magnify(e) {
    const dockRect = this.dockContainer.getBoundingClientRect();
    const mouseX = e.clientX - dockRect.left;
    const iconSize = 64;
    const maxMagnification = 1.5;
    const range = 100;

    this.icons.forEach(icon => {
      const iconRect = icon.element.getBoundingClientRect();
      const iconCenterX = iconRect.left - dockRect.left + iconRect.width / 2;
      const distance = Math.abs(mouseX - iconCenterX);

      let scale = 1;
      if (distance < range) {
        scale = 1 + (maxMagnification - 1) * (1 - distance / range);
      }

      icon.element.style.transform = `translateY(-${(scale - 1) * iconSize / 2}px) scale(${scale})`;
      icon.element.style.marginBottom = `${(scale - 1) * iconSize / 2}px`;
    });
  }

  _reset() {
    this.icons.forEach(icon => {
      icon.element.style.transform = 'translateY(0) scale(1)';
      icon.element.style.marginBottom = '0px';
    });
  }
}

export default new Dock(); 