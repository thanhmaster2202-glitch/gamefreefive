const board = document.getElementById("game-board");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const livesText = document.getElementById("lives");
const startMenu = document.getElementById("start-menu");
const gameOverScreen = document.getElementById("game-over");

const width = 30;
const height = 20;

let snake, food, direction, score, level, lives, speed, interval;
let baseSpeed = 120;

function showMenu() {
    gameOverScreen.style.display = "none";
    startMenu.style.display = "flex";
    createGrid();
}

function startGame() {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    baseSpeed = parseInt(selectedMode);
    startMenu.style.display = "none";
    initGame();
}

function initGame() {
    snake = [{x: 10, y: 10}];
    direction = "right";
    score = 0;
    level = 1;
    lives = 3;
    speed = baseSpeed;

    updateUI();
    createGrid();
    spawnFood();
    
    clearInterval(interval);
    interval = setInterval(gameLoop, speed);
}

function createGrid() {
    const overlays = [startMenu, gameOverScreen];
    board.innerHTML = "";
    overlays.forEach(o => board.appendChild(o));

    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = `cell-${i % width}-${Math.floor(i / width)}`;
        board.appendChild(cell);
    }
}

function draw() {
    // Xóa class và nội dung cũ (quan trọng để xóa trái táo cũ)
    document.querySelectorAll(".cell").forEach(c => {
        c.classList.remove("snake", "head", "up", "down", "left", "right", "food");
        c.textContent = ""; 
    });

    // Vẽ rắn
    snake.forEach((segment, index) => {
        const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
        if (!cell) return;
        if (index === 0) {
            cell.classList.add("head", direction);
        } else {
            cell.classList.add("snake");
        }
    });

    // Vẽ trái táo
    const foodCell = document.getElementById(`cell-${food.x}-${food.y}`);
    if (foodCell) {
        foodCell.classList.add("food");
        foodCell.textContent = "🍎"; // Đổi thành trái táo
    }
}

function move() {
    const head = { ...snake[0] };
    if (direction === "up") head.y--;
    if (direction === "down") head.y++;
    if (direction === "left") head.x--;
    if (direction === "right") head.x++;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (score % 50 === 0) {
            level++;
            speed = Math.max(40, speed - 10);
            clearInterval(interval);
            interval = setInterval(gameLoop, speed);
        }
        spawnFood();
        updateUI();
    } else {
        snake.pop();
    }
}

function collision() {
    const head = snake[0];
    const hitWall = head.x < 0 || head.x >= width || head.y < 0 || head.y >= height;
    const hitSelf = snake.slice(1).some(s => s.x === head.x && s.y === head.y);

    if (hitWall || hitSelf) {
        lives--;
        updateUI();
        if (lives <= 0) {
            clearInterval(interval);
            document.getElementById("final-score").textContent = `SCORE: ${score}`;
            gameOverScreen.style.display = "flex";
        } else {
            snake = [{x: 10, y: 10}];
            direction = "right";
        }
        return true;
    }
    return false;
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
        valid = !snake.some(s => s.x === food.x && s.y === food.y);
    }
}

function updateUI() {
    scoreText.textContent = `SCORE: ${score.toString().padStart(3, "0")}`;
    levelText.textContent = `LEVEL: ${level.toString().padStart(2, "0")}`;
    livesText.textContent = "❤️".repeat(lives);
}

function gameLoop() {
    move();
    if (!collision()) draw();
}

document.addEventListener("keydown", e => {
    const keys = { ArrowUp: "down", ArrowDown: "up", ArrowLeft: "right", ArrowRight: "left" };
    const newDir = e.key.replace("Arrow", "").toLowerCase();
    if (keys[e.key] && direction !== keys[e.key]) direction = newDir;
});

showMenu();