const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');
let currentInput = '';
let lastExpression = '';

function updateDisplay() {
  currentEl.textContent = currentInput || '0';
  historyEl.textContent = lastExpression || '\u00A0';
}

function appendValue(value) {
  if (currentInput.length >= 24) return;

  if (value === '.') {
    const token = currentInput.split(/[^0-9.]/).pop();
    if (token.includes('.')) return;
  }

  if (value === '(' || value === ')') {
    currentInput += value;
    updateDisplay();
    return;
  }

  if (value === '%') {
    currentInput += value;
    updateDisplay();
    return;
  }

  if (/[+\-*/^]/.test(value)) {
    if (!currentInput && lastExpression) {
      lastExpression = lastExpression.replace(/[+\-*/^]+$/, '') + value;
      updateDisplay();
      return;
    }
    if (!currentInput) return;

    if (/[+\-*/^]$/.test(currentInput)) {
      currentInput = currentInput.slice(0, -1) + value;
    } else {
      currentInput += value;
    }

    updateDisplay();
    return;
  }

  currentInput += value;
  updateDisplay();
}

function clearAll() {
  currentInput = '';
  lastExpression = '';
  updateDisplay();
}

function backspace() {
  if (!currentInput) return;
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function toggleSign() {
  if (!currentInput) return;
  if (currentInput.startsWith('-')) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = '-' + currentInput;
  }
  updateDisplay();
}

function compute() {
  if (!currentInput) return;

  let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
  expression = expression.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  expression = expression.replace(/[^0-9.+\-*/()% ]/g, '');

  try {
    const result = Function('return ' + expression)();
    if (Number.isFinite(result)) {
      lastExpression = currentInput + ' =';
      currentInput = String(parseFloat(result.toFixed(12)));
      updateDisplay();
    } else {
      currentEl.textContent = 'Error';
      currentInput = '';
      lastExpression = '';
    }
  } catch (e) {
    currentEl.textContent = 'Error';
    currentInput = '';
    lastExpression = '';
  }
}

document.querySelectorAll('.btn-digit, .btn-operator, .btn-decimal').forEach(btn => {
  btn.addEventListener('click', () => appendValue(btn.dataset.value));
});

document.getElementById('clear').addEventListener('click', clearAll);
document.getElementById('backspace').addEventListener('click', backspace);
document.getElementById('sign').addEventListener('click', toggleSign);
document.getElementById('equals').addEventListener('click', compute);

document.addEventListener('keydown', (e) => {
  if (/^[0-9]$/.test(e.key)) appendValue(e.key);
  if (e.key === '.') appendValue('.');
  if (['+', '-', '*', '/', '^', '%', '(', ')'].includes(e.key)) appendValue(e.key);
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); compute(); }
  if (e.key === 'Backspace') backspace();
  if (e.key.toLowerCase() === 'c') clearAll();
  if (e.key.toLowerCase() === 's') toggleSign();
});

updateDisplay();
