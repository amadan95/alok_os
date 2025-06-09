import WindowManager from '../WindowManager';

class PaintBrush {
  constructor() {
    this.name = 'PaintBrush';
    this.icon = '/Microsoft Paint PNG.png';
    this.placeholderClass = 'paintbrush-placeholder';
  }

  launch() {
    const content = `
      <div class="paintbrush-app">
        <div class="toolbar">
          <input type="color" value="#000000">
          <input type="range" min="1" max="20" value="5">
        </div>
        <canvas class="canvas"></canvas>
      </div>
    `;

    const win = WindowManager.createWindow({
      title: 'Untitled - PaintBrush',
      width: '600px',
      height: '450px',
      content: content,
    });

    this._addLogic(win.querySelector('.paintbrush-app'));
  }

  _addLogic(appElement) {
    const canvas = appElement.querySelector('.canvas');
    const colorPicker = appElement.querySelector('input[type="color"]');
    const brushSizeSlider = appElement.querySelector('input[type="range"]');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize); // Adjust canvas on window resize

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function draw(e) {
      if (!isDrawing) return;
      ctx.strokeStyle = colorPicker.value;
      ctx.lineWidth = brushSizeSlider.value;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
  }
}

export default new PaintBrush(); 