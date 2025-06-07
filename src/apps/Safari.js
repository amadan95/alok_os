import WindowManager from '../WindowManager';
import './Safari.css';

class Safari {
  constructor() {
    this.name = 'Safari';
    this.placeholderClass = 'safari-placeholder';
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
          <iframe src="https://oldgoogle.neocities.org/2009/" class="browser-frame"></iframe>
        </div>
      </div>
    `;

    WindowManager.createWindow({
      title: 'Safari',
      width: '900px',
      height: '700px',
      content: content,
    });
  }
}

export default new Safari(); 