const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 100, y: canvas.height - 150, w: 50, h: 50, dy: 0, onGround: true, ducking: false };
let keys = {};
let gravity = 1.2;
let speed = 5;
let blinkActive = false;
let blinkEnergy = 5, maxBlink = 5;
let score = 0;
let health = 6; // 6 half-hearts
let heartsUI = document.getElementById("hearts");
let energyFill = document.getElementById("energyFill");
let scoreDisplay = document.getElementById("score");
let gameOverScreen = document.getElementById("gameOver");
let obstacles = [], pickups = [];
let gameOver = false;

function resetGame() {
  player.y = canvas.height - 150;
  player.dy = 0;
  player.onGround = true;
  blinkActive = false;
  speed = 5;
  blinkEnergy = 5;
  score = 0;
  health = 6;
  gameOver = false;
  keys = {};

  obstacles = [];
  pickups = [];
  for (let i = 1; i <= 8; i++) {
    obstacles.push({ x: i * 400, y: canvas.height - 100, w: 40, h: 60 });
    if (i % 3 === 0) pickups.push({ x: i * 400 + 200, y: canvas.height - 140, r: 10 });
  }

  gameLoop();
}

function blink() {
  if (blinkEnergy <= 0) return;
  blinkEnergy--;
  blinkActive = true;
  setTimeout(() => blinkActive = false, 400);
}

function drawHearts() {
  let full = Math.floor(health / 2);
  let half = health % 2;
  let hearts = "♥".repeat(full) + (half ? "½" : "");
  heartsUI.innerText = hearts;
}

function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function isCollidingCircle(p, c) {
  let dx = p.x + p.w/2 - c.x;
  let dy = p.y + p.h/2 - c.y;
  return Math.sqrt(dx*dx + dy*dy) < c.r + p.w/2;
}

function takeDamage() {
  if (health > 4) health--;       // First 2 hits = half damage
  else health -= 2;               // Next = full damage
  if (health <= 0) triggerGameOver();
}

function triggerGameOver() {
  gameOver = true;
  gameOverScreen.classList.remove("hidden");
}

function gameLoop() {
  if (gameOver) return;

  ctx.fillStyle = blinkActive ? "#111" : "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Physics
  player.y += player.dy;
  if (!player.onGround) player.dy += gravity;

  if (player.y + player.h >= canvas.height - 100) {
    player.y = canvas.height - 100 - player.h;
    player.dy = 0;
    player.onGround = true;
  }

  // Horizontal movement
  if (keys["a"] || keys["ArrowLeft"]) player.x -= 5;
  if (keys["d"] || keys["ArrowRight"]) player.x += 5;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // Ducking
  player.h = (keys["s"] || keys["ArrowDown"]) ? 25 : 50;

  // Obstacles
  obstacles.forEach(ob => {
    ob.x -= speed;
    if (blinkActive) {
      ctx.fillStyle = "#f00";
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    }
    if (blinkActive && isColliding(player, ob)) {
      takeDamage();
      ob.x = -999;
    }
  });

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

  if (blinkActive) {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  score += 0.1;
  speed += 0.0005;

  energyFill.style.width = (blinkEnergy / maxBlink * 100) + "%";
  scoreDisplay.innerText = "Score: " + Math.floor(score);
  drawHearts();

  requestAnimationFrame(gameLoop);
}

function restart() {
  gameOverScreen.classList.add("hidden");
  resetGame();
}

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " || e.key === "Spacebar") blink();
  if ((e.key === "w" || e.key === "ArrowUp") && player.onGround) {
    player.dy = -20;
    player.onGround = false;
  }
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("click", blink);

resetGame();
