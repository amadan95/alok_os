import WindowManager from '../WindowManager';
import './iTunes.css';

class iTunes {
  constructor() {
    this.name = 'iTunes';
    this.icon = '../public/icons/iTunes.png';
  }

  launch() {
    const spotifyPlaylistID = '2sqdjmKSomv1u0dKcqQMcm';
    const content = `
      <div class="itunes-app">
        <iframe 
          src="https://open.spotify.com/embed/playlist/${spotifyPlaylistID}?utm_source=generator&theme=0" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style="border-radius: 8px;"
        ></iframe>
      </div>
    `;

    WindowManager.createWindow({
      title: 'iTunes',
      width: '800px',
      height: '600px',
      content: content,
    });
  }
}

export default new iTunes(); 