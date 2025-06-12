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
  icon: '/iChat Photoroom.jpg',
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
