const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 100, y: canvas.height - 150, w: 50, h: 50, dy: 0, onGround: true };
let keys = {}, obstacles = [], score = 0, speed = 5;
let blinkEnergy = 5, blinkActive = false;
let health = 6; // 3 hearts (6 halves)
let gameOver = false;

const groundY = canvas.height - 100;
const scoreUI = document.getElementById("score");
const heartUI = document.getElementById("hearts");
const gameOverScreen = document.getElementById("gameOver");

function setupGame() {
  obstacles = [];
  for (let i = 1; i <= 10; i++) {
    obstacles.push({ x: i * 400, y: groundY, w: 40, h: 60 });
  }
  gameLoop();
}

function drawPlayer() {
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawObstacles() {
  ctx.fillStyle = "#f00";
  for (let ob of obstacles) {
    ob.x -= speed;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    if (isColliding(player, ob)) {
      takeDamage();
      ob.x = -999;
    }
  }
}

function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function takeDamage() {
  if (health > 4) health--;
  else health -= 2;
  updateHearts();
  if (health <= 0) {
    gameOver = true;
    gameOverScreen.classList.remove("hidden");
  }
}

function updateHearts() {
  const full = Math.floor(health / 2);
  const half = health % 2;
  heartUI.innerText = "❤️".repeat(full) + (half ? "💔" : "");
}

function handleInput() {
  if (keys["w"] || keys["ArrowUp"]) {
    if (player.onGround) {
      player.dy = -20;
      player.onGround = false;
    }
  }
  if (keys["a"] || keys["ArrowLeft"]) player.x -= 5;
  if (keys["d"] || keys["ArrowRight"]) player.x += 5;
  if (keys["s"] || keys["ArrowDown"]) player.h = 30;
  else player.h = 50;
}

function blink() {
  if (blinkEnergy > 0 && !blinkActive) {
    blinkEnergy--;
    blinkActive = true;
    setTimeout(() => blinkActive = false, 500);
  }
}

function gameLoop() {
  if (gameOver) return;

  ctx.fillStyle = blinkActive ? "#111" : "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  handleInput();

  // Gravity
  player.y += player.dy;
  if (!player.onGround) player.dy += 1.2;
  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.dy = 0;
    player.onGround = true;
  }

  drawObstacles();
  drawPlayer();

  score += 0.1;
  scoreUI.innerText = "Score: " + Math.floor(score);

  requestAnimationFrame(gameLoop);
}

function restart() {
  player.x = 100;
  player.y = groundY - 50;
  player.dy = 0;
  score = 0;
  blinkEnergy = 5;
  health = 6;
  gameOver = false;
  updateHearts();
  gameOverScreen.classList.add("hidden");
  setupGame();
}

// Controls
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " || e.key === "Spacebar") blink();
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("click", blink);

updateHearts();
setupGame();
