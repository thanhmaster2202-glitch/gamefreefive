const birdFrames = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `ImageGames/frame-${i}.png`;
  birdFrames.push(img);
}

let birdFrameIndex = 0;
let birdFrameTimer = 0;

const canvas = document.getElementById("gamecv");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Hình ảnh
const planeimg = new Image();
planeimg.src = "ImageGames/maybay.png";
const obstacleimg = new Image();
obstacleimg.src = "ImageGames/frame-1.png";
const fuelimg = new Image();
fuelimg.src = "ImageGames/nhienlieu.png";
const starimg = new Image();
starimg.src = "ImageGames/star.png";
const backgroundimg = new Image();
backgroundimg.src = "ImageGames/background.png";

// --- QUẢN LÝ ĐẠN & CẤP ĐỘ ---
const bullets = [];
const bulletWidth = 35;  
const bulletHeight = 10; 
const bulletSpeed = 12;

let bulletLevel = 1;      
let starsCollected = 0;   
let powerUpTimer = 0; 

const plane = {
  x: 50,
  y: canvas.height / 2,
  width: 50,
  height: 50,
  speed: 12,
};

const obstacles = [];
const fuels = [];
const stars = [];

let score = 0;
let time = 60;
let isGameOver = false;

// --- HÀM TẠO ĐỐI TƯỢNG ---
function spawnobstacle() { if (!isGameOver) obstacles.push({ x: canvas.width, y: Math.random() * (canvas.height - 50), speed: Math.random() * 2 + 2 }); }
function spawnfuel() { if (!isGameOver) fuels.push({ x: canvas.width, y: Math.random() * (canvas.height - 50) }); }
function spawnstar() { if (!isGameOver) stars.push({ x: canvas.width, y: Math.random() * (canvas.height - 50) }); }

function spawnbullet() {
  if (isGameOver) return;
  const startX = plane.x + plane.width;
  const startY = plane.y + plane.height / 2 - bulletHeight / 2;

  if (bulletLevel === 1) {
    // Cấp 1: 1 tia ở giữa
    bullets.push({ x: startX, y: startY, vx: bulletSpeed, vy: 0 });
  } 
  else if (bulletLevel === 2) {
    // Cấp 2: 2 tia song song
    bullets.push({ x: startX, y: startY - 15, vx: bulletSpeed, vy: 0 });
    bullets.push({ x: startX, y: startY + 15, vx: bulletSpeed, vy: 0 });
  } 
  else if (bulletLevel >= 3) {
    // Cấp 3: 3 tia thẳng hàng (song song)
    bullets.push({ x: startX, y: startY - 20, vx: bulletSpeed, vy: 0 });
    bullets.push({ x: startX, y: startY, vx: bulletSpeed, vy: 0 });
    bullets.push({ x: startX, y: startY + 20, vx: bulletSpeed, vy: 0 });
  }
}

// Điều khiển
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function updateplaneposition() {
  if (isGameOver) return;
  if (keys["ArrowUp"] && plane.y > 0) plane.y -= plane.speed;
  if (keys["ArrowDown"] && plane.y < canvas.height - plane.height) plane.y += plane.speed;
  if (keys["ArrowLeft"] && plane.x > 0) plane.x -= plane.speed;
  if (keys["ArrowRight"] && plane.x < canvas.width - plane.width) plane.x += plane.speed;
}

function checkcollisions() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    if (plane.x < o.x + 40 && plane.x + 40 > o.x && plane.y < o.y + 40 && plane.y + 40 > o.y) gameOver();
  }

  // LOGIC ĂN SAO MỚI
  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    if (plane.x < s.x + 50 && plane.x + 50 > s.x && plane.y < s.y + 50 && plane.y + 50 > s.y) {
      starsCollected++;
      score += 10;
      stars.splice(i, 1);

      if (starsCollected >= 2) {
        bulletLevel = 3;
        powerUpTimer = 10 * 60; // Cấp 3 đếm ngược 10s
      } else if (starsCollected === 1) {
        bulletLevel = 2; // Cấp 2 là vô hạn
      }
    }
  }

  for (let i = fuels.length - 1; i >= 0; i--) {
    let f = fuels[i];
    if (plane.x < f.x + 50 && plane.x + 50 > f.x && plane.y < f.y + 50 && plane.y + 50 > f.y) {
      time += 10;
      fuels.splice(i, 1);
    }
  }
}

function gameOver() {
  if (!isGameOver) {
    isGameOver = true;
    alert("Game Over! Điểm: " + score);
    location.reload();
  }
}

function gameloop() {
  if (isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundimg, 0, 0, canvas.width, canvas.height);

  updateplaneposition();
  checkcollisions();

  // XỬ LÝ THỜI GIAN ĐẠN CẤP 3 QUAY VỀ CẤP 1
  if (bulletLevel === 3 && powerUpTimer > 0) {
    powerUpTimer--;
    if (powerUpTimer <= 0) {
      bulletLevel = 1;      // Quay về đạn 1
      starsCollected = 0;   // Reset số sao về 0
    }
  }

  birdFrameTimer++;
  if (birdFrameTimer > 5) {
    birdFrameIndex = (birdFrameIndex + 1) % birdFrames.length;
    birdFrameTimer = 0;
  }

  // --- VẼ ĐẠN ---
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;

    let color = (bulletLevel === 3) ? "#FF0000" : (bulletLevel === 2 ? "#00FFFF" : "#FFFF00");
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, bulletWidth, bulletHeight, 5);
    ctx.fill();
    ctx.restore();

    if (b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = obstacles.length - 1; j >= 0; j--) {
      let o = obstacles[j];
      if (b.x < o.x + 50 && b.x + bulletWidth > o.x && b.y < o.y + 50 && b.y + bulletHeight > o.y) {
        obstacles.splice(j, 1);
        bullets.splice(i, 1);
        score += 5;
        break;
      }
    }
  }

  for (let o of obstacles) { o.x -= o.speed; ctx.drawImage(birdFrames[birdFrameIndex], o.x, o.y, 50, 50); }
  for (let f of fuels) { f.x -= 2; ctx.drawImage(fuelimg, f.x, f.y, 50, 50); }
  for (let s of stars) { s.x -= 1; ctx.drawImage(starimg, s.x, s.y, 50, 50); }
  ctx.drawImage(planeimg, plane.x, plane.y, plane.width, plane.height);

  // UI
  if (time > 0) time -= 1/60; else gameOver();
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.fillText(`Điểm: ${score} | Xăng: ${Math.round(time)} | Đạn cấp: ${bulletLevel}`, 10, 30);
  
  if (bulletLevel === 3) {
    ctx.fillStyle = "#FF0000";
    ctx.fillText(`SIÊU CẤP (3 Tia): ${Math.ceil(powerUpTimer/60)}s`, 10, 60);
  } else if (bulletLevel === 2) {
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(`CẤP 2: VÔ HẠN`, 10, 60);
  }

  requestAnimationFrame(gameloop);
}

gameloop();
setInterval(spawnobstacle, 300);
setInterval(spawnfuel, 7000);
setInterval(spawnstar, 6000);
setInterval(spawnbullet, 300);