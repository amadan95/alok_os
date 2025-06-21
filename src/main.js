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
  const videoPath = '/Gifakira Video 100.308.mp4';
  
  // Remove any existing video backgrounds
  const existingVideos = document.querySelectorAll('#video-background');
  existingVideos.forEach(video => video.remove());
  
  // Remove any background images that might be set
  document.body.style.backgroundImage = 'none';
  document.body.style.backgroundColor = 'black';
  
  console.log("Attempting to set up video background with path:", videoPath);
  
  // Try to create video element directly without checking
  createVideoElement(videoPath);
  
  // Also try to preload the video
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'video';
  preloadLink.href = videoPath;
  document.head.appendChild(preloadLink);
}

function createVideoElement(videoPath) {
  console.log("Creating video element with source:", videoPath);
  
  const videoElement = document.createElement('video');
  videoElement.id = 'video-background';
  videoElement.crossOrigin = 'anonymous';
  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.controls = false;
  videoElement.preload = 'auto';
  
  // Add event listeners for debugging
  videoElement.addEventListener('loadeddata', () => {
    console.log("Video data loaded successfully");
  });
  
  videoElement.addEventListener('playing', () => {
    console.log("Video is now playing");
  });
  
  videoElement.addEventListener('error', (e) => {
    console.error("Video error:", e);
    document.body.style.backgroundColor = 'black';
  });
  
  // Set source after adding event listeners
  videoElement.src = videoPath;
  
  // Append to body instead of desktop to ensure it's behind everything
  document.body.prepend(videoElement);
  
  // Start playing with a slight delay to ensure DOM is ready
  setTimeout(() => {
    videoElement.play().then(() => {
      console.log("Video playback started successfully");
    }).catch(error => {
      console.error("Error playing video background:", error);
      
      // Try again with user interaction
      document.addEventListener('click', () => {
        videoElement.play().catch(e => console.error("Still can't play video after user interaction:", e));
      }, { once: true });
      
      document.body.style.backgroundColor = 'black';
    });
  }, 500);
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
