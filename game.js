const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player setup
let player = { x: 100, y: canvas.height - 150, w: 50, h: 50, dy: 0, onGround: true };

// Game variables
let gravity = 1.2;
let speed = 5;
let blinkEnergy = 5, maxBlink = 5;
let score = 0;
let blinkActive = false;
let obstacles = [];
let pickups = [];
let blinkDuration = 400;
let gameOver = false;
let energyBar = document.querySelector("#energyBar");
let scoreDisplay = document.querySelector("#score");
let gameOverScreen = document.querySelector("#gameOver");

// Input
let touchStartY = null;

function resetGame() {
  player.y = canvas.height - 150;
  player.dy = 0;
  player.onGround = true;
  speed = 5;
  blinkEnergy = maxBlink;
  score = 0;
  blinkActive = false;
  gameOver = false;
  obstacles = [];
  pickups = [];
  for (let i = 1; i <= 8; i++) {
    obstacles.push({ x: i * 400, y: canvas.height - 100, w: 40, h: 60 });
    if (i % 3 === 0) pickups.push({ x: i * 400 + 200, y: canvas.height - 140, r: 10 });
  }
  gameLoop();
}

function gameLoop() {
  if (gameOver) return;

  ctx.fillStyle = blinkActive ? "#111" : "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Player physics
  player.y += player.dy;
  if (!player.onGround) player.dy += gravity;

  if (player.y + player.h >= canvas.height - 100) {
    player.y = canvas.height - 100 - player.h;
    player.dy = 0;
    player.onGround = true;
  }

  // Move + render obstacles
  obstacles.forEach(ob => {
    ob.x -= speed;
    if (blinkActive) {
      ctx.fillStyle = "#f00";
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    }
    if (blinkActive && isColliding(player, ob)) {
      triggerGameOver();
    }
  });

  // Move + render pickups
  pickups.forEach(p => {
    p.x -= speed;
    if (blinkActive) {
      ctx.fillStyle = "cyan";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isCollidingCircle(player, p)) {
      blinkEnergy = Math.min(maxBlink, blinkEnergy + 1);
      score += 5;
      p.x = -999;
    }
  });

  // Player
  if (blinkActive) {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  // Score & speed
  score += 0.1;
  speed += 0.0005;

  // UI
  scoreDisplay.innerText = "Score: " + Math.floor(score);
  document.querySelector("#energyBar::after")?.style?.setProperty("width", (blinkEnergy / maxBlink * 100) + "%");

  requestAnimationFrame(gameLoop);
}

function blink() {
  if (blinkEnergy <= 0) return;
  blinkEnergy--;
  blinkActive = true;
  setTimeout(() => blinkActive = false, blinkDuration);
}

function jump() {
  if (player.onGround) {
    player.dy = -20;
    player.onGround = false;
  }
}

function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isCollidingCircle(p, c) {
  let dx = p.x + p.w/2 - c.x;
  let dy = p.y + p.h/2 - c.y;
  return Math.sqrt(dx*dx + dy*dy) < c.r + p.w/2;
}

function triggerGameOver() {
  gameOver = true;
  gameOverScreen.classList.remove("hidden");
}

function restart() {
  gameOverScreen.classList.add("hidden");
  resetGame();
}

// Touch input
canvas.addEventListener("touchstart", e => touchStartY = e.touches[0].clientY);
canvas.addEventListener("touchend", e => {
  let deltaY = touchStartY - e.changedTouches[0].clientY;
  if (deltaY > 30) jump(); else blink();
});

resetGame();
