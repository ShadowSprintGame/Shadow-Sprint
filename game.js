const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 360;
canvas.height = 640;

const laneX = [80, 160, 240];
let player = {
  lane: 1, y: 500, w: 60, h: 80,
  jumping: false, dy: 0, bounce: 0
};
let keys = {}, obstacles = [], coins = [], energyBolts = [];
let score = 0, speed = 4, blink = false;
let blinkEnergy = 5, health = 6, coinCount = 0, gameOver = false;

const selected = localStorage.getItem("selectedRunner") || "runner1";
const playerImg = new Image(); playerImg.src = selected + ".png";
const obstacleImg = new Image(); obstacleImg.src = "obstacle.png";
const coinImg = new Image(); coinImg.src = "coin.png";
const energyImg = new Image(); energyImg.src = "energy.png";
const bgImg = new Image(); bgImg.src = "background.jpg";

const coinSfx = new Audio("coin.mp3");
const zapSfx = new Audio("zap.mp3");

let bgY = 0;

function updateHearts() {
  const full = Math.floor(health / 2), half = health % 2;
  document.getElementById("hearts").innerText = "❤️".repeat(full) + (half ? "💔" : "");
}
function updateCoins() {
  if (!document.getElementById("coins")) {
    const el = document.createElement("div");
    el.id = "coins";
    el.style.position = "absolute";
    el.style.top = "10px";
    el.style.right = "10px";
    el.style.color = "white";
    el.style.fontSize = "18px";
    el.style.fontFamily = "sans-serif";
    el.innerText = "🪙 0";
    document.getElementById("ui").appendChild(el);
  }
  document.getElementById("coins").innerText = `🪙 ${coinCount}`;
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
    if (ob.lane === player.lane && ob.y + 40 >= player.y && ob.y < player.y + player.h) {
      takeDamage(); ob.y = -200;
    }
  }
}
function drawCoins() {
  for (let c of coins) {
    c.y += speed;
    ctx.drawImage(coinImg, laneX[c.lane] - 16, c.y, 32, 32);
    if (c.y > canvas.height) c.y = -600;
    if (c.lane === player.lane && c.y + 32 >= player.y && c.y < player.y + player.h) {
      coinCount++; coinSfx.play(); updateCoins(); c.y = -600;
    }
  }
}
function drawEnergy() {
  for (let e of energyBolts) {
    e.y += speed;
    ctx.drawImage(energyImg, laneX[e.lane] - 16, e.y, 32, 32);
    if (e.y > canvas.height) e.y = -800;
    if (e.lane === player.lane && e.y + 32 >= player.y && e.y < player.y + player.h) {
      blinkEnergy = Math.min(blinkEnergy + 1, 5);
      zapSfx.play(); e.y = -800;
    }
  }
}

function takeDamage() {
  if (health > 4) health--; else health -= 2;
  updateHearts();
  if (health <= 0) {
    gameOver = true;
    document.getElementById("gameOver").classList.remove("hidden");
    if (coinCount >= 10) {
      const btn = document.createElement("button");
      btn.innerText = "Buy 1 Life (10 🪙)";
      btn.onclick = () => {
        coinCount -= 10;
        health = 2; gameOver = false;
        document.getElementById("gameOver").classList.add("hidden");
        updateHearts(); updateCoins(); gameLoop();
      };
      document.getElementById("gameOver").appendChild(btn);
    }
  }
}

function handleInput() {
  if ((keys["a"] || keys["arrowleft"]) && player.lane > 0) {
    player.lane--; keys["a"] = keys["arrowleft"] = false;
  }
  if ((keys["d"] || keys["arrowright"]) && player.lane < 2) {
    player.lane++; keys["d"] = keys["arrowright"] = false;
  }
  if ((keys["w"] || keys["arrowup"]) && !player.jumping) {
    player.jumping = true; player.dy = -12;
  }
  if (keys[" "] && blinkEnergy > 0) {
    blink = true; blinkEnergy--;
    setTimeout(() => (blink = false), 400);
    keys[" "] = false;
  }
}
function updatePlayer() {
  if (player.jumping) {
    player.y += player.dy;
    player.dy += 0.8;
    if (player.y >= 500) {
      player.y = 500; player.jumping = false; player.dy = 0;
    }
  }
}

function gameLoop() {
  if (gameOver) return;
  drawBackground(); handleInput(); updatePlayer();
  drawObstacles(); drawCoins(); drawEnergy(); drawPlayer();
  score += 0.1;
  document.getElementById("score").innerText = "Score: " + Math.floor(score);
  requestAnimationFrame(gameLoop);
}

function restart() {
  player = { lane: 1, y: 500, w: 60, h: 80, jumping: false, dy: 0, bounce: 0 };
  score = 0; health = 6; blink = false; blinkEnergy = 5;
  gameOver = false;
  obstacles = Array.from({ length: 5 }, () => ({
    lane: Math.floor(Math.random() * 3),
    y: -Math.random() * 600
  }));
  coins = Array.from({ length: 4 }, () => ({
    lane: Math.floor(Math.random() * 3),
    y: -Math.random() * 1200
  }));
  energyBolts = Array.from({ length: 2 }, () => ({
    lane: Math.floor(Math.random() * 3),
    y: -Math.random() * 1600
  }));
  updateHearts(); updateCoins();
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("gameOver").innerHTML = "Game Over<br><button onclick='restart()'>Retry</button>";
  gameLoop();
}

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener("click", () => {
  if (blinkEnergy > 0) {
    blink = true; blinkEnergy--;
    setTimeout(() => (blink = false), 400);
  }
});

restart();

 
