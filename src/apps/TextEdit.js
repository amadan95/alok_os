import WindowManager from '../WindowManager';

class TextEdit {
  constructor() {
    this.name = 'TextEdit';
    this.icon = '../public/icons/TextEdit.png';
  }

  launch() {
    const content = `
      <div class="text-editor" contenteditable="true" style="height: 100%; outline: none;"></div>
    `;

    WindowManager.createWindow({
      title: 'Untitled - TextEdit',
      width: '600px',
      height: '400px',
      content: content
    });
  }
}

export default new TextEdit(); 