const canvas = document.getElementById('matrix-rain');
const context = canvas.getContext('2d');
const particleCanvas = document.getElementById('matrix-particles');
const particleContext = particleCanvas.getContext('2d');
let particles = [];
const hackerGlyphs = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\{}[]$#@';

function resizeParticles() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
  const count = Math.min(90, Math.max(35, Math.floor(window.innerWidth / 16)));
  particles = Array.from({
    length: count
  }, () => ({
    x: Math.random() * particleCanvas.width,
    y: Math.random() * particleCanvas.height,
    radius: Math.random() * 1.8 + 0.8,
    speedX: (Math.random() - 0.5) * 0.18,
    speedY: Math.random() * 0.8 + 0.25,
    pulse: Math.random() * Math.PI * 2,
    glyph: hackerGlyphs[Math.floor(Math.random() * hackerGlyphs.length)],
    changeAt: Math.random() * 80
  }));
}

function drawParticles() {
  particleContext.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-blue').trim();

  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.pulse += 0.025;
    particle.changeAt -= 1;

    if (particle.changeAt <= 0) {
      particle.glyph = hackerGlyphs[Math.floor(Math.random() * hackerGlyphs.length)];
      particle.changeAt = Math.random() * 90 + 25;
    }

    if (particle.x < -10) particle.x = particleCanvas.width + 10;
    if (particle.x > particleCanvas.width + 10) particle.x = -10;
    if (particle.y > particleCanvas.height + 18) {
      particle.y = -18;
      particle.x = Math.random() * particleCanvas.width;
    }

    particleContext.font = `${Math.round(particle.radius * 6 + 8)}px monospace`;
    particleContext.fillStyle = index % 5 === 0 ? accent : primary;
    particleContext.shadowBlur = 12;
    particleContext.shadowColor = particleContext.fillStyle;
    particleContext.globalAlpha = 0.25 + Math.abs(Math.sin(particle.pulse)) * 0.55;
    particleContext.fillText(particle.glyph, particle.x, particle.y);
    particleContext.globalAlpha = 1;
    particleContext.shadowBlur = 0;

    particleContext.beginPath();
    particleContext.moveTo(particle.x, particle.y - 28);
    particleContext.lineTo(particle.x, particle.y - 7);
    particleContext.strokeStyle = `color-mix(in srgb, ${particleContext.fillStyle} 22%, transparent)`;
    particleContext.lineWidth = 1;
    particleContext.stroke();

    particles.slice(index + 1).forEach((other) => {
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 125) {
        particleContext.beginPath();
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(other.x, other.y);
        particleContext.strokeStyle = `color-mix(in srgb, ${primary} ${Math.max(5, 28 - distance / 5)}%, transparent)`;
        particleContext.lineWidth = 0.8;
        particleContext.stroke();
      }
    });
  });

  requestAnimationFrame(drawParticles);
}

resizeParticles();
drawParticles();
window.addEventListener('resize', resizeParticles);

const glyphs = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\';
let columns;
let drops;

function resizeRain() {
  const density = window.innerWidth < 600 ? 22 : 18;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / density);
  drops = Array.from({
    length: columns
  }, () => Math.random() * -40);
}

function drawRain() {
  context.fillStyle = 'rgba(255, 255, 0, 0.24)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-mint').trim();
  context.font = '14px Courier New';
  drops.forEach((drop, index) => {
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    context.globalAlpha = Math.random() * 0.7 + 0.15;
    context.fillText(glyph, index * (canvas.width / columns), drop * 16);
    drops[index] = drop * 16 > canvas.height && Math.random() > 0.975 ? 0 : drop + 1;
  });
  context.globalAlpha = 1;
  requestAnimationFrame(drawRain);
}

resizeRain();
drawRain();
window.addEventListener('resize', resizeRain);

const quote = document.getElementById('quote');
const quoteList = [
  'I don’t always test in production. But when I do, I call it a launch strategy.',
  'The bug is not a bug. It is an undocumented feature with confidence issues.',
  'I came, I saw, I committed directly to main.',
  'My code works perfectly. Please do not resize the browser.',
  'There is no spoon. There is only an aggressively styled div.',
  '404: Motivation not found. Deploying coffee instead.',
  'I asked for a semicolon. The compiler asked for my soul.',
  'In this economy, every div is a potential career opportunity.',
  'The frontend is responsive. My sleep schedule is not.',
  'sudo make me look hireable — permission granted by vibes.'
];

function getRandomQuote() {
  const availableQuotes = quoteList.filter((item) => item !== quote.textContent);
  return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
}

document.querySelectorAll('.terminal-button').forEach((button) => {
  button.addEventListener('click', () => {
    quote.textContent = button.textContent.trim() === 'RUN QUOTE' ?
      getRandomQuote() :
      button.dataset.quote;
  });
});

function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-GB');
}

updateClock();
setInterval(updateClock, 1000);

const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const commandHistory = [];
let historyIndex = 0;

const commands = {
  help: 'Available commands:\n  help       show this command list\n  whoami     inspect the current operator\n  skills     reveal the loaded toolset\n  quote      generate a developer quote\n  clear      wipe the terminal output\n  matrix     take the green pill',
  whoami: 'operator: Mayank\nrole: BCA fresher / frontend explorer\nstatus: learning, building, and online',
  skills: 'loaded modules: HTML, CSS, JavaScript, Tailwind CSS\nactive quest: turning ideas into clean interfaces',
  quote: '"' + getRandomQuote() + '"',
  matrix: 'You take the green pill. The CSS has no parents now.',
  sudo: 'Nice try. Root access is reserved for the person who remembers semicolons.',
  ls: 'identity/  experiments/  questionable-confidence/  coffee/',
  pwd: '/home/mayank/matrix'
};

function printToTerminal(text, command) {
  if (command === 'clear') {
    terminalOutput.textContent = '';
    return;
  }
  const line = document.createElement('div');
  line.className = 'mb-2';
  line.innerHTML = '<span class="text-[var(--color-primary)]">mayank@matrix:~$ ' + command.replace(/[<>&]/g, '') + '</span>\n' + text.replace(/[<>&]/g, '');
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

terminalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = terminalInput.value.trim().toLowerCase();
  if (!command) return;
  commandHistory.push(command);
  historyIndex = commandHistory.length;
  terminalInput.value = '';
  printToTerminal(commands[command] || 'Command not found. Try "help" before attempting to hack the mainframe.', command);
});

terminalInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    terminalInput.value = commandHistory[historyIndex] || '';
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    terminalInput.value = commandHistory[historyIndex] || '';
  }
});
