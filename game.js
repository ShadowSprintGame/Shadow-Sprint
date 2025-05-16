const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 360;
canvas.height = 640;

const laneX = [80, 160, 240];
let player = {
  lane: 1,
  y: 500,
  w: 60,
  h: 80,
  jumping: false,
  dy: 0,
  bounce: 0
};

let keys = {};
let obstacles = [];
let score = 0;
let speed = 4;
let blink = false;
let blinkEnergy = 5;
let health = 6;
let gameOver = false;

// Load selected character
const selected = localStorage.getItem("selectedRunner") || "runner1";
const playerImg = new Image();
playerImg.src = selected + ".png";

const obstacleImg = new Image();
obstacleImg.src = "obstacle.png"; // generated or placeholder
const bgImg = new Image();
bgImg.src = "background.jpg"; // generated or placeholder

let bgY = 0;

function updateHearts() {
  const full = Math.floor(health / 2);
  const half = health % 2;
  document.getElementById("hearts").innerText = "❤️".repeat(full) + (half ? "💔" : "");
}

function drawBackground() {
  bgY += 2;
  if (bgY >= canvas.height) bgY = 0;
  ctx.drawImage(bgImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, bgY, canvas.width, canvas.height);
}

function drawPlayer() {
  const x = laneX[player.lane] - player.w / 2;
  const y = player.y + Math.sin(player.bounce) * 3;
  ctx.drawImage(playerImg, x, y, player.w, player.h);
  player.bounce += 0.3;
}

function drawObstacles() {
  for (let ob of obstacles) {
    ob.y += speed;
    ctx.drawImage(obstacleImg, laneX[ob.lane] - 20, ob.y, 40, 40);
    if (ob.y > canvas.height) ob.y = -200 - Math.random() * 500;
    if (
      ob.lane === player.lane &&
      ob.y + 40 >= player.y &&
      ob.y < player.y + player.h
    ) {
      takeDamage();
      ob.y = -200;
    }
  }
}

function takeDamage() {
  if (health > 4) health--;
  else health -= 2;
  updateHearts();
  if (health <= 0) {
    gameOver = true;
    document.getElementById("gameOver").classList.remove("hidden");
  }
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
  if (keys[" "] && blinkEnergy > 0) {
    blink = true;
    blinkEnergy--;
    setTimeout(() => (blink = false), 400);
    keys[" "] = false;
  }
}

function updatePlayer() {
  if (player.jumping) {
    player.y += player.dy;
    player.dy += 0.8;
    if (player.y >= 500) {
      player.y = 500;
      player.jumping = false;
      player.dy = 0;
    }
  }
}

function gameLoop() {
  if (gameOver) return;

  drawBackground();
  handleInput();
  updatePlayer();
  drawObstacles();
  drawPlayer();

  score += 0.1;
  document.getElementById("score").innerText = "Score: " + Math.floor(score);
  requestAnimationFrame(gameLoop);
}

function restart() {
  player.lane = 1;
  player.y = 500;
  player.jumping = false;
  score = 0;
  health = 6;
  blink = false;
  blinkEnergy = 5;
  gameOver = false;
  obstacles = Array.from({ length: 5 }, () => ({
    lane: Math.floor(Math.random() * 3),
    y: -Math.random() * 600
  }));
  updateHearts();
  document.getElementById("gameOver").classList.add("hidden");
  gameLoop();
}

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;


