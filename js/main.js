const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Game State ===
let gameStarted = false;

// Responsif
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function updatePositions() {
  bow.x = canvas.width * 0.15;
  bow.y = canvas.height / 2;
  target.x = canvas.width * 0.85;
  target.y = canvas.height / 2;
  target.radius = Math.min(80, canvas.width * 0.1);
}

// === Variabel Game ===
const bow = { x: 0, y: 0, angle: 0, pull: 0, maxPull: 1 };
const target = { x: 0, y: 0, radius: 80 };

let arrow = { active: false, x: 0, y: 0, vx: 0, vy: 0 };

let score = 0;
let streak = 0;
let message = '';
let messageAlpha = 0;
let messageTimer = 0;

const hitMessages = [
  "I love you 💕",
  "You good baby 😘",
  "I love you so much ❤️",
  "My heart is yours forever 🥰",
  "You're amazing darling 💖"
];

const missMessages = [
  "I miss you 🥺",
  "Try again lovee 💪",
  "I trust you honey 😊",
  "Almost! Keep going ❤️"
];

function updateUI() {
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('streak').innerText = `Streak: ${streak} 💖`;
}

// === START GAME ===
function startGame() {
  console.log("PLAY button berhasil diklik! Game mulai...");
  gameStarted = true;

  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.style.display = 'none';
      console.log("Start screen sudah dihilangkan");
    }, 600);
  }

  const instructions = document.getElementById('instructions');
  if (instructions) instructions.style.opacity = '0.7';

  const ui = document.getElementById('ui');
  if (ui) ui.style.opacity = '1';

  updateUI();
  updatePositions();
}

// Tunggu sampai semua HTML selesai load (safety)
window.addEventListener('load', () => {
  const playButton = document.getElementById('playButton');
  if (playButton) {
    playButton.addEventListener('click', startGame);
    console.log("Tombol PLAY sudah terpasang event-nya");
  } else {
    console.error("Tombol PLAY tidak ditemukan di HTML!");
  }
});

// Event tombol PLAY
document.getElementById('playButton').addEventListener('click', startGame);

// === Kontrol ===
let isPulling = false;
let mouseX = 0;
let mouseY = 0;

function updateBowAngle() {
  const dx = mouseX - bow.x;
  const dy = mouseY - bow.y;
  bow.angle = Math.atan2(dy, dx);
  bow.angle = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, bow.angle));
}

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (gameStarted && !arrow.active) updateBowAngle();
});

canvas.addEventListener('mousedown', () => {
  if (gameStarted && !arrow.active) isPulling = true;
});

canvas.addEventListener('mouseup', () => {
  if (isPulling && gameStarted && !arrow.active) shootArrow();
  isPulling = false;
  bow.pull = 0;
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
  if (gameStarted && !arrow.active) {
    isPulling = true;
    updateBowAngle();
  }
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
  if (gameStarted && !arrow.active) updateBowAngle();
});

canvas.addEventListener('touchend', () => {
  if (isPulling && gameStarted && !arrow.active) shootArrow();
  isPulling = false;
  bow.pull = 0;
});

function shootArrow() {
  if (bow.pull < 0.2) return;

  arrow.active = true;
  arrow.x = bow.x + Math.cos(bow.angle) * 80;
  arrow.y = bow.y + Math.sin(bow.angle) * 80;

  const power = bow.pull * 20;
  arrow.vx = Math.cos(bow.angle) * power;
  arrow.vy = Math.sin(bow.angle) * power;

  playSound('twang');
}

function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'twang') osc.frequency.value = 300;
    else if (type === 'hit') osc.frequency.value = 800;
    else osc.frequency.value = 200;

    gain.gain.value = 0.3;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.log("Sound blocked or not supported");
  }
}

function checkHit() {
  const dist = Math.hypot(arrow.x - target.x, arrow.y - target.y);

  if (dist < target.radius) {
    let points = 10;
    if (dist < target.radius * 0.3) points = 50;
    else if (dist < target.radius * 0.5) points = 30;
    else if (dist < target.radius * 0.7) points = 20;

    score += points;
    streak++;
    message = hitMessages[(streak - 1) % hitMessages.length];
    playSound('hit');
  } else {
    streak = 0;
    message = missMessages[Math.floor(Math.random() * missMessages.length)];
    playSound('miss');
  }

  messageAlpha = 1;
  messageTimer = 120;
  arrow.active = false;
  updateUI();
}

// === Animate Loop ===
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePositions();

  // Gambar target
  const rings = [target.radius, target.radius * 0.75, target.radius * 0.5, target.radius * 0.25];
  const colors = ['#ff4444', '#ffffff', '#ff8888', '#ffff00'];
  rings.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
    ctx.fillStyle = gameStarted ? colors[i] : colors[i] + '80';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  if (gameStarted) {
    // Update pull strength
    if (isPulling && !arrow.active) {
      const dist = Math.min(Math.hypot(mouseX - bow.x, mouseY - bow.y), 200);
      bow.pull = Math.min(dist / 150, 1);
    }

    // Arrow physics
    if (arrow.active) {
      arrow.vy += 0.3;
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;

      if (Math.hypot(arrow.x - target.x, arrow.y - target.y) < target.radius + 10) {
        checkHit();
      }

      if (arrow.x > canvas.width + 100 || arrow.y > canvas.height + 100 || arrow.y < -100) {
        streak = 0;
        message = missMessages[Math.floor(Math.random() * missMessages.length)];
        messageAlpha = 1;
        messageTimer = 120;
        playSound('miss');
        updateUI();
        arrow.active = false;
      }
    }

    // Gambar bow
    ctx.save();
    ctx.translate(bow.x, bow.y);
    ctx.rotate(bow.angle);

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-40, -60);
    ctx.quadraticCurveTo(20 + bow.pull * 50, 0, -40, 60);
    ctx.stroke();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-40, -60);
    ctx.lineTo(20 + bow.pull * 100, 0);
    ctx.lineTo(-40, 60);
    ctx.stroke();

    if (!arrow.active) {
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(80 + bow.pull * 80, 0);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(80 + bow.pull * 80, 0);
      ctx.lineTo(70 + bow.pull * 80, -10);
      ctx.lineTo(70 + bow.pull * 80, 10);
      ctx.closePath();
      ctx.fillStyle = '#ff3333';
      ctx.fill();
    }

    ctx.restore();

    // Panah terbang
    if (arrow.active) {
      ctx.save();
      const arrowAngle = Math.atan2(arrow.vy, arrow.vx);
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(arrowAngle);

      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(20, 0);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(10, -10);
      ctx.lineTo(10, 10);
      ctx.closePath();
      ctx.fillStyle = '#ff3333';
      ctx.fill();

      ctx.restore();
    }

    // Pesan romantis
    if (messageTimer > 0) {
      ctx.font = 'bold 50px Comic Sans MS';
      ctx.fillStyle = `rgba(255, 20, 147, ${messageAlpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 50);
      messageAlpha = Math.max(0, messageAlpha - 0.015);
      messageTimer--;
    }
  }

  requestAnimationFrame(animate);
}

animate();