const display = document.querySelector('#display');
const history = document.querySelector('#history');
const status = document.querySelector('#status');
const shell = document.querySelector('#calculator');
const rebuildButton = document.querySelector('#rebuildButton');
const explosionMessage = document.querySelector('#explosionMessage');
const motionToggle = document.querySelector('#motionToggle');
const dramaToggle = document.querySelector('#dramaToggle');
const ambientField = document.querySelector('.ambient-field');
let dramaticErrors = true;
let expression = '';
let selfDestructTimer;

const accessibleLabels = {
  sin: 'Sine',
  cos: 'Cosine',
  tan: 'Tangent',
  log: 'Logarithm base 10',
  sqrt: 'Square root',
  power: 'Power',
  pi: 'Insert pi',
  inverse: 'Reciprocal, one divided by x',
  clear: 'Clear calculator',
  backspace: 'Delete last character',
  equals: 'Calculate result'
};

document.querySelectorAll('.key').forEach(button => {
  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action && accessibleLabels[action]) {
    button.setAttribute('aria-label', accessibleLabels[action]);
  } else if (value) {
    const labels = { '*': 'Multiply', '/': 'Divide', '-': 'Subtract', '+': 'Add', '.': 'Decimal point', '(': 'Open parenthesis', ')': 'Close parenthesis' };
    button.setAttribute('aria-label', labels[value] || `Number ${value}`);
  }
});

motionToggle.addEventListener('click', () => {
  const isPaused = ambientField.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(isPaused));
  motionToggle.textContent = isPaused ? 'Ambient motion: off' : 'Ambient motion: on';
});

dramaToggle.addEventListener('click', () => {
  dramaticErrors = !dramaticErrors;
  dramaToggle.setAttribute('aria-pressed', String(dramaticErrors));
  dramaToggle.textContent = dramaticErrors ? 'Dramatic errors: on' : 'Dramatic errors: off';
  status.textContent = dramaticErrors ? 'dramatic error mode enabled' : 'quiet error mode enabled';
});

function render(value = expression || '0') {
  display.textContent = value;
}

function press(button) {
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 130);
}

function getCalculationRoast(input, result) {
  const compact = input.replace(/\s/g, '');
  const numbers = compact.match(/\d+(?:\.\d+)?/g) || [];
  const largestNumber = Math.max(...numbers.map(Number), 0);
  const operatorCount = (compact.match(/[+\-*\/]/g) || []).length;
  const hasPower = compact.includes('**');
  const hasDecimals = compact.includes('.');
  const isTiny = numbers.length <= 2 && largestNumber <= 10 && operatorCount <= 1 && !hasDecimals;
  const isSimple = numbers.length <= 3 && operatorCount <= 2 && !hasPower && !hasDecimals;
  const isAdvanced = hasPower || hasDecimals || operatorCount >= 3 || largestNumber >= 1000;

  if (isTiny) {
    return ['Wow, Einstein. The universe may never recover from that 5 + 5.', 'Outstanding. You defeated single-digit arithmetic.', 'The calculator is pretending to be impressed.', 'That was adorable. Try adding a third number next time.'][Math.floor(Math.random() * 4)];
  }

  if (isSimple) {
    return ['Not bad. The training wheels stayed on.', 'A respectable warm-up for your remaining brain cells.', 'You made it through basic arithmetic. Have a sticker.', 'Elementary, my dear calculator.'][Math.floor(Math.random() * 4)];
  }

  if (isAdvanced) {
    return ['Okay, okay... someone brought their big-brain energy.', 'That calculation had enough drama to deserve its own thesis.', 'Impressive. I only had to do most of the work.', 'Look at you, casually bending numbers to your will.'][Math.floor(Math.random() * 4)];
  }

  if (Math.abs(result) > 1000000) {
    return 'You made a very large number. Please use your powers responsibly.';
  }

  return ['Numbers were harmed, but the answer looks correct.', 'A surprisingly competent use of a calculator.', 'That was more complicated than necessary, but I respect it.', 'The math checks out. Your genius remains under review.'][Math.floor(Math.random() * 4)];
}

function showCalculationError(message) {
  render('ERROR');
  status.textContent = message;
  status.className = 'mt-2 h-4 text-[10px] font-bold uppercase tracking-[.2em] text-amber-200';
}

function evaluateExpression() {
  if (!expression) {
    showCalculationError('enter an expression first');
    return;
  }

  if (/9\s*\+\s*10/.test(expression.replace(/\s/g, ''))) {
    history.textContent = expression + ' =';
    expression = '21';
    render();
    status.textContent = 'Wow, Einstein. You discovered the calculator’s favorite plot twist.';
    return;
  }

  if (/\/\s*0(?:\.0*)?$/.test(expression)) {
    return triggerMeltdown();
  }

  try {
    const safe = expression.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function('"use strict"; return (' + safe + ')')();

    if (!Number.isFinite(result)) {
      return dramaticErrors ? triggerMeltdown() : showCalculationError('result is outside calculator range');
    }

    history.textContent = expression + ' =';
    expression = String(Number(result.toFixed(10)));
    render();
    status.textContent = getCalculationRoast(history.textContent.replace(' =', ''), result);
  } catch {
    showCalculationError('invalid expression · check your operators');
  }
}

function createBlast() {
  const rect = shell.getBoundingClientRect();
  const blast = document.createElement('div');
  blast.className = 'meltdown-blast';
  blast.style.left = `${rect.left + rect.width / 2 - 96}px`;
  blast.style.top = `${rect.top + rect.height / 2 - 96}px`;
  document.body.appendChild(blast);

  for (let i = 0; i < 22; i++) {
    const debris = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 22;
    const distance = 130 + Math.random() * 260;

    debris.className = 'debris';
    debris.style.left = `${rect.left + rect.width / 2}px`;
    debris.style.top = `${rect.top + rect.height / 2}px`;
    debris.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    debris.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    debris.style.transform = `scale(${0.5 + Math.random()})`;
    document.body.appendChild(debris);
    setTimeout(() => debris.remove(), 1000);
  }

  setTimeout(() => blast.remove(), 1000);
}

function triggerMeltdown() {
  let count = 3;
  clearInterval(selfDestructTimer);
  shell.classList.remove('calculator-destroyed');
  shell.classList.add('meltdown-active');
  history.textContent = expression + ' =';
  status.className = 'countdown meltdown-warning mt-2 h-4 text-[10px] font-bold uppercase tracking-[.2em]';
  render('ERROR // ' + count);
  status.textContent = 'CONTAINMENT FAILURE · 3 SECONDS';

  selfDestructTimer = setInterval(() => {
    count--;

    if (count > 0) {
      render('ERROR // ' + count);
      status.textContent = count === 2 ?
        'CORE PRESSURE RISING · EVACUATE NOW' :
        'CRITICAL MASS REACHED · GOODBYE';
      return;
    }

    clearInterval(selfDestructTimer);
    createBlast();
    shell.classList.remove('meltdown-active');
    shell.classList.add('calculator-destroyed');
    render('SYSTEM LOST');
    status.textContent = 'SYSTEM LOST';
    status.className = 'mt-2 h-4 text-[10px] font-bold uppercase tracking-[.2em] text-rose-300';

    const shellRect = shell.getBoundingClientRect();
    explosionMessage.style.left = `${shellRect.left + window.scrollX + shellRect.width / 2}px`;
    explosionMessage.style.top = `${shellRect.top + window.scrollY + shellRect.height / 2}px`;
    explosionMessage.classList.remove('hidden');
    rebuildButton.classList.remove('hidden');
    expression = '';
  }, 900);
}

function backspace() {
  if (!expression) {
    status.textContent = 'nothing to delete';
    return;
  }

  expression = expression.slice(0, -1);
  render();
  status.textContent = expression ? 'last input removed' : 'input cleared';
}

function scientific(action) {
  if (action === 'power') {
    if (!expression) {
      status.textContent = 'enter a base before choosing a power';
      return;
    }

    expression += '**';
    render();
    status.textContent = 'enter the exponent, then press equals';
    return;
  }

  const value = Number(expression || display.textContent || 0);
  let result;

  if (action === 'sin') result = Math.sin(value * Math.PI / 180);
  if (action === 'cos') result = Math.cos(value * Math.PI / 180);
  if (action === 'tan') result = Math.tan(value * Math.PI / 180);
  if (action === 'log') result = value > 0 ? Math.log10(value) : NaN;
  if (action === 'sqrt') result = value >= 0 ? Math.sqrt(value) : NaN;
  if (action === 'inverse') result = value === 0 ? NaN : 1 / value;

  if (action === 'pi') {
    expression += '3.141592653589793';
    render();
    return;
  }

  if (!Number.isFinite(result)) {
    if (action === 'sqrt' && value < 0) {
      showCalculationError('square root needs a non-negative number');
      return;
    }

    showCalculationError('that operation is not defined');
    return;
  }

  history.textContent = action + '(' + value + ')';
  expression = String(Number(result.toFixed(10)));
  render();
  status.textContent = action + ' wave computed';
}

rebuildButton.addEventListener('click', () => {
  clearInterval(selfDestructTimer);
  rebuildButton.classList.add('hidden');
  explosionMessage.classList.add('hidden');
  shell.classList.remove('calculator-destroyed');
  shell.classList.add('calculator-rebuilding');
  status.className = 'mt-2 h-4 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300';
  status.textContent = 'reconstruction in progress · calibrating core';
  history.textContent = 'restoring damaged components_';
  render('REBUILDING...');
  expression = '';

  setTimeout(() => {
    shell.classList.remove('calculator-rebuilding');
    render();
    history.textContent = 'ready for input_';
    status.className = 'mt-2 h-4 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300';
    status.textContent = 'rebuild complete · awaiting your genius';
  }, 3000);
});

document.querySelectorAll('.key').forEach(button => {
  button.addEventListener('click', () => {
    press(button);
    const {
      value,
      action
    } = button.dataset;

    if (value) {
      expression += value;
      render();
      status.textContent = 'input received';
    }

    if (action === 'clear') {
      clearInterval(selfDestructTimer);
      shell.classList.remove('meltdown-active', 'calculator-destroyed');
      expression = '';
      render();
      history.textContent = 'ready for input_';
      status.className = 'mt-2 h-4 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300';
      status.textContent = 'containment restored · awaiting your genius';
    }

    if (action === 'equals') evaluateExpression();
    if (action === 'backspace') backspace();
    if (['sin', 'cos', 'tan', 'log', 'sqrt', 'power', 'inverse', 'pi'].includes(action)) {
      scientific(action);
    }
  });
});

document.addEventListener('keydown', event => {
  if (/^[0-9+\-*/().]$/.test(event.key)) {
    expression += event.key;
    render();
  }

  if (event.key === 'Enter') evaluateExpression();
  if (event.key === 'Backspace') {
    event.preventDefault();
    backspace();
  }
  if (event.key === 'Escape') document.querySelector('[data-action="clear"]').click();
});

shell.addEventListener('pointermove', event => {
  if (window.innerWidth < 641) return;
  const rect = shell.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  shell.style.transform = `rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateZ(8px)`;
});

shell.addEventListener('pointerleave', () => {
  shell.style.transform = 'rotateY(0) rotateX(0)';
});
