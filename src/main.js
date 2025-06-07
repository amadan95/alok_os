import './style.css'
import WindowManager from './WindowManager';
import Dock from './Dock';
import TextEdit from './apps/TextEdit';
import Calculator from './apps/Calculator';
import PaintBrush from './apps/PaintBrush';
import iPhoto from './apps/iPhoto';
import iTunes from './apps/iTunes';
import Safari from './apps/Safari';

Dock.addApplication({
  name: 'TextEdit',
  icon: '/icons/textedit.png',
  action: () => TextEdit.launch()
});

Dock.addApplication({
  name: 'Calculator',
  icon: '', // Assuming no icon provided for calc
  placeholderClass: 'calculator-placeholder',
  action: () => Calculator.launch()
});

Dock.addApplication({
  name: 'PaintBrush',
  icon: '/icons/paintbrush.png',
  action: () => PaintBrush.launch()
});

Dock.addApplication({
  name: 'iPhoto',
  icon: '/icons/iphoto.png',
  action: () => iPhoto.launch()
});

Dock.addApplication({
  name: 'iTunes',
  icon: '/icons/itunes.png',
  action: () => iTunes.launch()
});

Dock.addApplication({
  name: 'Safari',
  icon: '/icons/safari.png',
  action: () => Safari.launch()
});

// Future JavaScript for LeopardWeb will go here.
