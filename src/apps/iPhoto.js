import WindowManager from '../WindowManager';
import './iPhoto.css';

class iPhoto {
  constructor() {
    this.name = 'Photos';
    this.icon = '../public/icons/iPhoto.png';
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
      title: 'Photos',
      width: '900px',
      height: '700px',
      content: content,
      className: 'iphoto-window',
    });
  }
}

export default new iPhoto(); 