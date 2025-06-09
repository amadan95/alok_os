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
import photosIcon from './assets/icons/Film Cannister from Photoroom.png';
import moviesIcon from './assets/icons/Photoroom VHS.png';
import ipodIcon from './assets/icons/iPod Image from Photoroom.png';
import safariIcon from './assets/icons/Safari Icon from Photoroom.png';

/*
Dock.addApplication({
  name: 'TextEdit',
  icon: '/icons/TextEdit.png',
  action: () => TextEdit.launch()
});

Dock.addApplication({
  name: 'Calculator',
  icon: '/icons/Calculette.png',
  action: () => Calculator.launch()
});

Dock.addApplication({
  name: 'PaintBrush',
  icon: '/icons/Microsoft Paint PNG.png',
  action: () => PaintBrush.launch()
});
*/

Dock.addApplication({
  name: 'Photos',
  icon: photosIcon,
  action: () => iPhoto.launch()
});

Dock.addApplication({
  name: 'Movies',
  icon: moviesIcon,
  action: () => QuickTime.launch()
});

Dock.addApplication({
  name: 'iPod',
  icon: ipodIcon,
  action: () => iPod.launch()
});

Dock.addApplication({
  name: 'Safari',
  icon: safariIcon,
  action: () => Safari.launch()
});

/*
Dock.addApplication({
  name: 'iTunes',
  icon: '/icons/iTunes.png',
  action: () => iTunes.launch()
});
*/

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
