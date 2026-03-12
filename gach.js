/**
 * 1. CẤU HÌNH HỆ THỐNG VŨ TRỤ
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let lives = 3;
const MAX_LIVES = 3;
let level = 1;
let gameOver = false;

// Hệ thống sao nền (Starfield)
const stars = [];
for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random(),
        speed: Math.random() * 0.4 + 0.1
    });
}

/**
 * 2. THANH ĐẨY (PADDLE)
 */
const paddle = {
    width: 160,
    height: 14,
    x: (canvas.width - 160) / 2,
    speed: 10,
    color: "#38bdf8"
};

let rightPressed = false;
let leftPressed = false;

/**
 * 3. QUẢN LÝ BÓNG (NĂNG LƯỢNG)
 */
let balls = [];

function createNewBall(x, y, speed) {
    return {
        x: x || canvas.width / 2,
        y: y || canvas.height - 80,
        dx: (Math.random() > 0.5 ? 1 : -1) * speed,
        dy: -speed,
        radius: 8,
        speed: speed // Lưu lại tốc độ cơ sở
    };
}

/**
 * 4. VẬT PHẨM (ITEMS)
 */
let items = [];
const itemTypes = {
    DOUBLE: { color: "#fbbf24", label: "x2" },
    LIFE: { color: "#f43f5e", label: "❤" }
};

/**
 * 5. CẤU HÌNH GẠCH (NHỎ & MẬT ĐỘ CAO)
 */
const brickRowCount = 10;
const brickColumnCount = 15;
const brickPadding = 8;
const brickOffsetTop = 80;
const brickOffsetLeft = 45;

const brickWidth = (canvas.width - (brickOffsetLeft * 2) - (brickPadding * (brickColumnCount - 1))) / brickColumnCount;
const brickHeight = 18;

let bricks = [];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const hue = 200 + (r * 12);
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                color: `hsl(${hue}, 80%, 60%)`,
                shadow: `hsl(${hue}, 80%, 40%)`
            };
        }
    }
}

/**
 * 6. XỬ LÝ SỰ KIỆN ĐIỀU KHIỂN
 */
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

/**
 * 7. LOGIC QUA MÀN & VÔ HẠN (ENDLESS)
 */
function checkLevelComplete() {
    let allBroken = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { allBroken = false; break; }
        }
    }

    if (allBroken) {
        if (level < 3) {
            level++; // Lên màn 2 và 3
        }
        // Nếu là level 3, không tăng level nữa (Endless)
        
        resetLevel();
    }
}

function resetLevel() {
    initBricks();
    items = [];
    
    // Tốc độ bóng: Màn 1 = 4, Màn 2 = 5, Màn 3 = 6.
    // Từ màn 3 trở đi khi reset gạch, tốc độ giữ nguyên là 6.
    let speed = 3 + level; 
    if (level > 3) speed = 6; 

    // Đưa số bóng về 1
    balls = [createNewBall(canvas.width / 2, canvas.height - 80, speed)];
    paddle.x = (canvas.width - paddle.width) / 2;
}

/**
 * 8. VẼ GIAO DIỆN
 */
function drawBackground() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const by = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = bx; b.y = by;
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = b.shadow;
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.roundRect(bx, by, brickWidth, brickHeight, 4);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}

function drawBalls() {
    balls.forEach(ball => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawPaddle() {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#38bdf8";
    ctx.fillStyle = paddle.color;
    ctx.beginPath();
    ctx.roundRect(paddle.x, canvas.height - paddle.height - 20, paddle.width, paddle.height, 10);
    ctx.fill();
    ctx.restore();
}

function drawItems() {
    items.forEach((item, index) => {
        item.y += 2.5;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = item.type.color;
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(item.type.label, item.x, item.y + 4);
        
        if (item.y + 12 > canvas.height - 35 && item.x > paddle.x && item.x < paddle.x + paddle.width) {
            if (item.type === itemTypes.DOUBLE) {
                const len = balls.length;
                for(let i=0; i<len; i++) {
                    balls.push(createNewBall(balls[i].x, balls[i].y, balls[i].speed));
                }
            } else if (item.type === itemTypes.LIFE) {
                if (lives < MAX_LIVES) lives++;
            }
            items.splice(index, 1);
        }
        if (item.y > canvas.height) items.splice(index, 1);
    });
}

function drawStatus() {
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score}`, 45, 40);
    ctx.textAlign = "center";
    ctx.fillText(level >= 3 ? "LEVEL: ENDLESS" : `LEVEL: ${level}`, canvas.width/2, 40);
    ctx.textAlign = "right";
    ctx.fillText(`SHIELDS: ${lives}`, canvas.width - 45, 40);
}

/**
 * 9. VÒNG LẶP GAME (GAME LOOP)
 */
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                balls.forEach(ball => {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 10;
                        if (Math.random() < 0.12) {
                            items.push({ x: b.x + brickWidth/2, y: b.y, type: Math.random() < 0.7 ? itemTypes.DOUBLE : itemTypes.LIFE });
                        }
                        checkLevelComplete();
                    }
                });
            }
        }
    }
}

function draw() {
    if (gameOver) {
        ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "bold 50px 'Segoe UI'";
        ctx.fillText("MISSION FAILED", canvas.width/2, canvas.height/2);
        ctx.font = "20px 'Segoe UI'";
        ctx.fillText(`Final Score: ${score} - Click to Restart`, canvas.width/2, canvas.height/2 + 50);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBricks();
    drawBalls();
    drawPaddle();
    drawItems();
    drawStatus();
    collisionDetection();

    balls.forEach((ball, index) => {
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ball.radius - 20) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                let hitPoint = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
                ball.dx = hitPoint * ball.speed;
                ball.dy = -Math.abs(ball.dy);
            } else {
                balls.splice(index, 1);
                if (balls.length === 0) {
                    lives--;
                    if (lives <= 0) gameOver = true;
                    else {
                        // Khi mất mạng, tạo lại 1 bóng với tốc độ của level hiện tại
                        balls = [createNewBall(null, null, 3 + (level > 3 ? 3 : level))];
                    }
                }
            }
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    if (rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    else if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

    requestAnimationFrame(draw);
}

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    level = 1; score = 0; lives = 3; gameOver = false;
    resetLevel();
    draw();
}

canvas.addEventListener("click", () => {
    if (gameOver) document.location.reload();
});

drawBackground();