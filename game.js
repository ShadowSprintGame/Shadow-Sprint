
 
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

const lanes = [100, 200, 300];
let player = { lane: 1, y: canvas.height - 80, w: 40, h: 40, jumping: false, dy: 0, ducking: false };
let obstacles = [];
let score = 0;
let speed = 4;
let keys = {};
let blink = false;
let blinkEnergy = 5;
let health = 6;
let gameOver = false;

const heartUI = document.getElementById("hearts");
const scoreUI = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");

function drawPlayer() {
  const x = lanes[player.lane] - player.w / 2;
  const y = player.y;
  ctx.fillStyle = "#0f0";
  ctx.fillRect(x, y, player.w, player.h);
}

function drawObstacles() {
  ctx.fillStyle = blink ? "#f00" : "#222";
  for (let ob of obstacles) {
    ctx.fillRect(lanes[ob.lane] - 20, ob.y, 40, 40);
    ob.y += speed;
    if (ob.y > canvas.height) ob.y = -200 - Math.random() * 500;
    if (ob.lane === player.lane && ob.y + 40 >= player.y && ob.y <= player.y + player.h) {
      takeDamage();
      ob.y = -200;
    }
  }
}

function updateHearts() {
  const full = Math.floor(health / 2);
  const half = health % 2;
  heartUI.innerText = "❤️".repeat(full) + (half ? "💔" : "");
}

function handleInput() {
  if ((keys["a"] || keys["arrowleft"]) && player.lane > 0) {
    player.lane--;
    keys["a"] = keys["arrowleft"] = false;
  }
  if ((keys["d"] || keys["arrowright"]) && player.lane < 2) {
    player.lane++;
    keys["d"] = keys["arrowright"] = false;
  }
  if ((keys["w"] || keys["arrowup"]) && !player.jumping) {
    player.jumping = true;
    player.dy = -12;
  }
  if (keys["s"] || keys["arrowdown"]) {
    player.h = 20;
  } else {
    player.h = 40;
  }
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

function blinkEffect() {
  if (blinkEnergy > 0) {
    blink = true;
    blinkEnergy--;
    setTimeout(() => blink = false, 300);
  }
}

function gameLoop() {
  if (gameOver) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  handleInput();
  if (player.jumping) {
    player.y += player.dy;
    player.dy += 0.8;
    if (player.y >= canvas.height - 80) {
      player.y = canvas.height - 80;
      player.jumping = false;
      player.dy = 0;
    }
  }

  drawPlayer();
  drawObstacles();

  score += 0.1;
  scoreUI.innerText = "Score: " + Math.floor(score);

  requestAnimationFrame(gameLoop);
}

function restart() {
  health = 6;
  updateHearts();
  score = 0;
  blinkEnergy = 5;
  gameOver = false;
  gameOverScreen.classList.add("hidden");
  obstacles = Array.from({ length: 5 }, () => ({ lane: Math.floor(Math.random() * 3), y: -100 * Math.random() }));
  gameLoop();
}

// Controls
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " ") blinkEffect();
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("click", blinkEffect);

// Init
updateHearts();
restart();
