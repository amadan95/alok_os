import './style.css'
import WindowManager from './WindowManager';
import Dock from './Dock';
import TextEdit from './apps/TextEdit';
import Calculator from './apps/Calculator';
import PaintBrush from './apps/PaintBrush';
import iPhoto from './apps/iPhoto';
import iTunes from './apps/iTunes';
import Safari from './apps/Safari';
import QuickTime from './apps/QuickTime';
import iPod from './apps/iPod';

// Set up video background
function setupVideoBackground() {
  // Remove any existing video elements
  const existingVideos = document.querySelectorAll('#video-background');
  existingVideos.forEach(video => video.remove());
  
  // Create a new video element
  const videoElement = document.createElement('video');
  videoElement.id = 'video-background';
  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.controls = false;
  
  // Set CSS properties directly
  videoElement.style.position = 'fixed';
  videoElement.style.top = '0';
  videoElement.style.left = '0';
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';
  videoElement.style.objectFit = 'cover';
  videoElement.style.zIndex = '0';
  
  // Create source element
  const source = document.createElement('source');
  source.src = '/Gifakira Video 100.308.mp4';
  source.type = 'video/mp4';
  
  // Add event listeners
  videoElement.addEventListener('loadeddata', () => {
    console.log('Video loaded successfully');
  });
  
  videoElement.addEventListener('playing', () => {
    console.log('Video is playing');
  });
  
  videoElement.addEventListener('error', (e) => {
    console.error('Video error:', e);
    document.body.style.backgroundColor = 'black';
  });
  
  // Append source to video
  videoElement.appendChild(source);
  
  // Insert video as the first element in the body
  document.body.insertBefore(videoElement, document.body.firstChild);
  
  // Try to play the video
  const playVideo = () => {
    videoElement.play()
      .then(() => console.log('Video playback started'))
      .catch(err => {
        console.error('Error playing video:', err);
        // Try again on user interaction
        document.addEventListener('click', () => {
          videoElement.play().catch(e => console.error('Still cannot play video:', e));
        }, { once: true });
      });
  };
  
  // Try to play immediately and after a delay
  playVideo();
  setTimeout(playVideo, 500);
}

// Initialize video background
document.addEventListener('DOMContentLoaded', setupVideoBackground);

// Import icons
const photosIcon = '/icons/Film-Cannister-from-Photoroom.png';
const moviesIcon = '/icons/Photoroom-VHS.png';
const ipodIcon = '/icons/iPod-Image-from-Photoroom.png';
const safariIcon = '/icons/Safari-Icon-from-Photoroom.png';

/*
Dock.addApplication({
  name: 'TextEdit',
  icon: '/icons/TextEdit.png',
  action: () => new TextEdit().launch()
});

Dock.addApplication({
  name: 'Calculator',
  icon: '/icons/Calculette.png',
  action: () => new Calculator().launch()
});

Dock.addApplication({
  name: 'PaintBrush',
  icon: '/icons/Microsoft-Paint-PNG.png',
  action: () => new PaintBrush().launch()
});
*/

Dock.addApplication({
  name: 'Photos',
  icon: photosIcon,
  action: () => {
    const app = typeof iPhoto === 'function' ? new iPhoto() : iPhoto;
    app.launch();
  }
});

Dock.addApplication({
  name: 'Movies',
  icon: moviesIcon,
  action: () => {
    const app = typeof QuickTime === 'function' ? new QuickTime() : QuickTime;
    app.launch();
  }
});

Dock.addApplication({
  name: 'iPod',
  icon: ipodIcon,
  action: () => {
    const app = typeof iPod === 'function' ? new iPod() : iPod;
    app.launch();
  }
});

Dock.addApplication({
  name: 'Safari',
  icon: safariIcon,
  action: () => {
    const app = typeof Safari === 'function' ? new Safari() : Safari;
    app.launch();
  }
});

/*
Dock.addApplication({
  name: 'iTunes',
  icon: '/icons/iTunes.png',
  action: () => new iTunes().launch()
});
*/

Dock.addApplication({
  name: 'iChat',
  icon: '/icons/Photoroom-iChat.png',
  action: () => {
    import('./apps/iChat').then(({ default: iChat }) => {
      const app = new iChat();
      app.launch();
    });
  }
});

function updateDateTime() {
  const dateTimeElement = document.getElementById('date-time');
  if (dateTimeElement) {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options).replace(',', '');
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);

// Sound effect for clicks and drags
const clickSound = new Audio('/sounds/click.mp3');

document.addEventListener('mousedown', () => {
  clickSound.currentTime = 0; // Rewind to the start
  clickSound.play().catch(error => {
    // Autoplay was prevented.
    console.log("Play was prevented: ", error);
  });
});

// Future JavaScript for LeopardWeb will go here.

// Initialize video background if not already done
setupVideoBackground();
