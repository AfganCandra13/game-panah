const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsif
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// === Variabel Game ===
const bow = {
  x: canvas.width * 0.15,
  y: canvas.height / 2,
  angle: 0,
  pull: 0,
  maxPull: 1
};

const target = {
  x: canvas.width * 0.85,
  y: canvas.height / 2,
  radius: 80
};

let arrow = {
  active: false,
  x: 0, y: 0,
  vx: 0, vy: 0
};

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

// === Audio (opsional, tambahkan file di folder sounds) ===
const sounds = {
  twang: new Audio('assets/sounds/twang.mp3'),
  hit: new Audio('assets/sounds/hit.mp3'),
  miss: new Audio('assets/sounds/miss.mp3')
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {}); // prevent error jika autoplay diblok
  }
}

// === Kontrol Mouse & Touch ===
let isPulling = false;
let mouseX = 0;
let mouseY = 0;

// ... (sisa kode JavaScript sama persis seperti sebelumnya:
// updateBowAngle, event listeners, shootArrow, checkHit, animate, dll)

// Pastikan memanggil animate() di paling bawah
animate();