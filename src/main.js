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
  icon: '/icons/Film Cannister from Photoroom.png',
  action: () => iPhoto.launch()
});

Dock.addApplication({
  name: 'Movies',
  icon: '/icons/Photoroom VHS.png',
  action: () => QuickTime.launch()
});

Dock.addApplication({
  name: 'iPod',
  icon: '/icons/iPod Image from Photoroom.png',
  action: () => iPod.launch()
});

Dock.addApplication({
  name: 'Safari',
  icon: '/icons/Safari Icon from Photoroom.png',
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

// Future JavaScript for LeopardWeb will go here.
