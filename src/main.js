import './style.css'
import WindowManager from './WindowManager.js';
import Dock from './Dock.js';
import TextEdit from './apps/TextEdit';
import Calculator from './apps/Calculator';
import Safari from './apps/Safari';
import iPhoto from './apps/iPhoto';
import iTunes from './apps/iTunes';
import QuickTime from './apps/QuickTime';
import PaintBrush from './apps/PaintBrush';
import iChat from './apps/iChat';
import iPod from './apps/iPod';

// Function to set up the static image background
function setupImageBackground() {
  console.log('Setting up static background image');
  
  // Remove any existing video background if present
  const existingVideo = document.querySelector('#video-background');
  if (existingVideo) {
    existingVideo.pause();
    existingVideo.remove();
  }
  
  // Remove any existing background image element
  const existingBg = document.querySelector('#background-image');
  if (existingBg) {
    existingBg.remove();
  }

  // Create a div for the background image
  const backgroundDiv = document.createElement('div');
  backgroundDiv.id = 'background-image';
  
  // Set inline styles directly
  document.body.style.backgroundImage = 'url("/aurora-copy.jpg")';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  
  // Also set the div background as a fallback
  backgroundDiv.style.position = 'fixed';
  backgroundDiv.style.top = '0';
  backgroundDiv.style.left = '0';
  backgroundDiv.style.width = '100vw';
  backgroundDiv.style.height = '100vh';
  backgroundDiv.style.zIndex = '-10';
  backgroundDiv.style.backgroundImage = 'url("/aurora-copy.jpg")';
  backgroundDiv.style.backgroundSize = 'cover';
  backgroundDiv.style.backgroundPosition = 'center';
  backgroundDiv.style.backgroundRepeat = 'no-repeat';
  
  // Add the background div to the body as the first element
  document.body.insertBefore(backgroundDiv, document.body.firstChild);
  console.log('Static background image set up successfully');
}

// Legacy video background setup function - keeping for reference but not using
function setupVideoBackground() {
  try {
    const video = document.createElement('video');
    video.id = 'background-video';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-1';
    
    // Add a source element
    const source = document.createElement('source');
    source.src = '/Gifakira Video 100.308.mp4';
    source.type = 'video/mp4';
    video.appendChild(source);
    
    // Add the video to the body
    document.body.appendChild(video);
    
    // Set playback rate
    video.playbackRate = 0.5;
    
    // Log when the video is loaded
    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
      console.log('Video is playing at speed:', video.playbackRate);
    });
    
    // Play the video
    const playVideo = async () => {
      try {
        await video.play();
        console.log('Video playback started');
      } catch (error) {
        console.error('Error playing video:', error);
      }
    };
    
    playVideo();
    
    // Add event listener for when the video ends
    video.addEventListener('ended', () => {
      console.log('Video playback ended, looping...');
      playVideo();
    });
    
  } catch (error) {
    console.error('Error setting up video background:', error);
  }
}

// Add preload link for better performance
const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.as = 'image';
preloadLink.href = '/aurora-copy.jpg';
document.head.appendChild(preloadLink);

// Set up the static image background immediately and after DOM is fully loaded
setupImageBackground();

// Initialize the desktop
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  setupImageBackground(); // Set up background again after DOM is loaded to ensure it's applied
  
  // Make sure no video is playing
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    video.pause();
    video.remove();
  });
});

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
