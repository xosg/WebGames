// Running Dinosaur Game (Chrome Dino Clone)
// Author: xosg

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const restartBtnOverlay = document.getElementById('restart-btn-overlay');
const gameOverOverlay = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');

// Game constants
const GROUND_Y = 240;
const DINO_X = 90;
const DINO_W = 66;
const DINO_H = 72;
const GRAVITY = 0.45;
const JUMP_V = -15.5;
const OBSTACLE_TYPES = [
    { w: 18, h: 38, color: '#4caf50', type: 'cactus-small' },
    { w: 24, h: 54, color: '#388e3c', type: 'cactus-tall' },
    { w: 40, h: 24, color: '#607d8b', type: 'bird' } // bird is flying
];
const OBSTACLE_MIN_GAP = 120;
const OBSTACLE_MAX_GAP = 260;
const CLOUD_W = 46;
const CLOUD_H = 14;
const FPS = 60;

// Game state
let dino, obstacles, clouds, score, highScore, gameSpeed, isJumping, isGameOver, jumpV, frameCount;

function resetGame() {
    dino = { y: GROUND_Y - DINO_H, vy: 0, w: DINO_W, h: DINO_H };
    obstacles = [];
    clouds = [];
    score = 0;
    gameSpeed = 4.5;
    isJumping = false;
    isGameOver = false;
    jumpV = 0;
    frameCount = 0;
    gameOverOverlay.classList.add('hidden');
    scoreSpan.textContent = score;
    spawnObstacle();
    spawnCloud();
}

function spawnObstacle() {
    const gap = Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP) + OBSTACLE_MIN_GAP;
    const lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : canvas.width;
    // Randomly pick obstacle type
    let typeIdx = Math.random() < 0.15 ? 2 : (Math.random() < 0.5 ? 1 : 0); // 15% bird, 35% tall, 50% small
    let type = OBSTACLE_TYPES[typeIdx];
    let y = type.type === 'bird'
        ? GROUND_Y - type.h - (Math.random() < 0.5 ? 24 : 0) // bird can be higher
        : GROUND_Y - type.h;
    obstacles.push({
        x: lastX + gap,
        y: y,
        w: type.w,
        h: type.h,
        color: type.color,
        type: type.type
    });
}

function spawnCloud() {
    const gap = Math.random() * 200 + 100;
    const lastX = clouds.length > 0 ? clouds[clouds.length - 1].x : canvas.width;
    clouds.push({
        x: lastX + gap,
        y: 30 + Math.random() * 40,
        w: CLOUD_W,
        h: CLOUD_H,
        speed: 1 + Math.random() * 0.5
    });
}

function update() {
    if (isGameOver) return;
    frameCount++;
    // Dino jump
    if (isJumping) {
        dino.vy += GRAVITY;
        dino.y += dino.vy;
        if (dino.y >= GROUND_Y - DINO_H) {
            dino.y = GROUND_Y - DINO_H;
            dino.vy = 0;
            isJumping = false;
        }
    }
    // Obstacles
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed;
    }
    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].w < 0) {
        obstacles.shift();
        spawnObstacle();
    }
    // Clouds
    for (let i = 0; i < clouds.length; i++) {
        clouds[i].x -= clouds[i].speed;
    }
    if (clouds.length > 0 && clouds[0].x + clouds[0].w < 0) {
        clouds.shift();
        spawnCloud();
    }
    // Collision
    for (let obs of obstacles) {
        if (
            DINO_X + DINO_W > obs.x &&
            DINO_X < obs.x + obs.w &&
            dino.y + DINO_H > obs.y &&
            dino.y < obs.y + obs.h
        ) {
            endGame();
            return;
        }
    }
    // Score
    score += 1;
    scoreSpan.textContent = score;
    // Speed up
    if (score % 300 === 0) {
        gameSpeed += 0.25;
    }
}

function draw() {
    // Day/night background
    let isNight = Math.floor(score / 1000) % 2 === 1;
    ctx.fillStyle = isNight ? '#222' : '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Ground
    ctx.fillStyle = isNight ? '#444' : '#888';
    ctx.fillRect(0, GROUND_Y, canvas.width, 4);
    // Clouds
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let cloud of clouds) {
        ctx.fillStyle = isNight ? '#789' : '#b3e5fc';
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
    // Obstacles
    for (let obs of obstacles) {
        if (obs.type === 'bird') {
            // Draw bird (simple wings)
            ctx.save();
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, 2 * Math.PI);
            ctx.fill();
            // Wings
            ctx.strokeStyle = isNight ? '#fff' : '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.w / 2, obs.y + obs.h / 2);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h / 2 - 8);
            ctx.moveTo(obs.x + obs.w / 2, obs.y + obs.h / 2);
            ctx.lineTo(obs.x, obs.y + obs.h / 2 - 8);
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
    }
    // Dino
    ctx.save();
    ctx.fillStyle = isNight ? '#eee' : '#333';
    ctx.fillRect(DINO_X, dino.y, DINO_W, DINO_H);
    // Eye
    ctx.fillStyle = isNight ? '#222' : '#fff';
    ctx.beginPath();
    ctx.arc(DINO_X + DINO_W - 12, dino.y + 14, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = isNight ? '#fff' : '#222';
    ctx.beginPath();
    ctx.arc(DINO_X + DINO_W - 12, dino.y + 14, 2, 0, 2 * Math.PI);
    ctx.fill();
    // Leg
    ctx.fillStyle = isNight ? '#222' : '#222';
    ctx.fillRect(DINO_X + 8, dino.y + DINO_H - 8, 8, 8);
    ctx.fillRect(DINO_X + 28, dino.y + DINO_H - 8, 8, 8);
    ctx.restore();
    // Score
    ctx.fillStyle = isNight ? '#fff' : '#1976d2';
    ctx.font = 'bold 1.2rem Segoe UI';
    ctx.fillText('Score: ' + score, canvas.width - 120, 30);
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function jump() {
    if (!isJumping && !isGameOver) {
        dino.vy = JUMP_V;
        isJumping = true;
    }
}

function endGame() {
    isGameOver = true;
    finalScore.textContent = 'Your Score: ' + score;
    gameOverOverlay.classList.remove('hidden');
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
        e.preventDefault();
    }
});
canvas.addEventListener('mousedown', jump);

restartBtn.addEventListener('click', () => {
    resetGame();
    gameLoop();
});
restartBtnOverlay.addEventListener('click', () => {
    resetGame();
    gameLoop();
});

// Responsive canvas
function resizeCanvas() {
    let w = Math.min(window.innerWidth - 40, 900);
    let h = Math.round(w * (300 / 900));
    canvas.width = w;
    canvas.height = h;
}
window.addEventListener('resize', resizeCanvas);

// Start game
resizeCanvas();
resetGame();
gameLoop();
