import WindowManager from '../WindowManager';

class Calculator {
  constructor() {
    this.name = 'Calculator';
    this.icon = '../public/icons/Calculette.png';
  }

  launch() {
    const content = `
      <div class="calculator">
        <div class="display">0</div>
        <div class="keys">
          <div class="key" data-key="clear">AC</div>
          <div class="key" data-key="+/-">+/-</div>
          <div class="key" data-key="%">%</div>
          <div class="key operator" data-key="/">÷</div>
          <div class="key" data-key="7">7</div>
          <div class="key" data-key="8">8</div>
          <div class="key" data-key="9">9</div>
          <div class="key operator" data-key="*">×</div>
          <div class="key" data-key="4">4</div>
          <div class="key" data-key="5">5</div>
          <div class="key" data-key="6">6</div>
          <div class="key operator" data-key="-">−</div>
          <div class="key" data-key="1">1</div>
          <div class="key" data-key="2">2</div>
          <div class="key" data-key="3">3</div>
          <div class="key operator" data-key="+">+</div>
          <div class="key zero" data-key="0">0</div>
          <div class="key" data-key=".">.</div>
          <div class="key operator" data-key="=">=</div>
        </div>
      </div>
    `;

    const win = WindowManager.createWindow({
      title: 'Calculator',
      width: '250px',
      height: '350px',
      content: content
    });

    this._addLogic(win.querySelector('.calculator'));
  }

  _addLogic(calculatorElement) {
    const display = calculatorElement.querySelector('.display');
    const keys = calculatorElement.querySelector('.keys');

    let displayValue = '0';
    let firstValue = null;
    let operator = null;
    let waitingForSecondValue = false;

    function updateDisplay() {
      display.textContent = displayValue;
    }

    updateDisplay();

    keys.addEventListener('click', (e) => {
      const key = e.target;
      const keyValue = key.dataset.key;

      if (!key.matches('.key')) return;

      if (/\d/.test(keyValue)) {
        if (waitingForSecondValue) {
          displayValue = keyValue;
          waitingForSecondValue = false;
        } else {
          displayValue = displayValue === '0' ? keyValue : displayValue + keyValue;
        }
      } else if (keyValue === '.') {
        if (!displayValue.includes('.')) {
          displayValue += '.';
        }
      } else if (key.matches('.operator')) {
        const value = parseFloat(displayValue);

        if (operator && waitingForSecondValue) {
          operator = keyValue;
          return;
        }

        if (firstValue === null) {
          firstValue = value;
        } else if (operator) {
          const result = calculate(firstValue, value, operator);
          displayValue = `${parseFloat(result.toFixed(7))}`;
          firstValue = result;
        }

        waitingForSecondValue = true;
        operator = keyValue;

      } else if (keyValue === 'clear') {
        displayValue = '0';
        firstValue = null;
        operator = null;
        waitingForSecondValue = false;
      } else if (keyValue === '+/-') {
        displayValue = (parseFloat(displayValue) * -1).toString();
      } else if (keyValue === '%') {
        displayValue = (parseFloat(displayValue) / 100).toString();
      }

      updateDisplay();
    });

    function calculate(first, second, op) {
      if (op === '+') return first + second;
      if (op === '-') return first - second;
      if (op === '*') return first * second;
      if (op === '/') return first / second;
      return second;
    }
  }
}

export default new Calculator();
