import WindowManager from '../WindowManager';
import './iPhoto.css';

class iPhoto {
  constructor() {
    this.name = 'iPhoto';
  }

  launch() {
    const portfolioUrl = 'https://alokmadan-photography-portfolio.vercel.app/';
    const content = `
      <div class="iphoto-app" style="height: 100%;">
        <iframe 
          src="${portfolioUrl}" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style="border-radius: 8px;"
        ></iframe>
      </div>
    `;

    WindowManager.createWindow({
      title: 'iPhoto',
      width: '900px',
      height: '700px',
      content: content,
    });
  }
}

export default new iPhoto(); 