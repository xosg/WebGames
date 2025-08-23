// Snake vs Blocks
// Author: xosg

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const W = canvas.width, H = canvas.height;
const SNAKE_SIZE = 18, BLOCK_SIZE = 48, BLOCK_ROWS = 5, BLOCK_COLS = 6;
const COLORS = ['#f44336','#2196f3','#4caf50','#ffeb3b','#ff9800','#9c27b0'];

let snake, blocks, score, gameOver, vx, touchStartX;

function randomInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }

function initGame() {
  snake = {len:5, x:Math.floor(W/2/SNAKE_SIZE)*SNAKE_SIZE, y:H-60, vx:0};
  blocks = [];
  score = 0;
  gameOver = false;
  vx = 0;
  scoreEl.textContent = score;
  spawnBlocks();
  draw();
}

function spawnBlocks() {
  blocks = [];
  for (let row=0;row<BLOCK_ROWS;row++) {
    let y = row*BLOCK_SIZE-2*BLOCK_SIZE;
    for (let col=0;col<BLOCK_COLS;col++) {
      if (Math.random()<0.5) {
        let val = randomInt(1, Math.max(1, Math.floor(score/5)+2));
        blocks.push({x:col*BLOCK_SIZE+6, y, val, color:COLORS[randomInt(0,COLORS.length-1)]});
      }
    }
  }
}

function draw() {
  ctx.clearRect(0,0,W,H);
  // Draw snake
  for (let i=0;i<snake.len;i++) {
    ctx.beginPath();
    ctx.arc(snake.x, snake.y-i*SNAKE_SIZE, SNAKE_SIZE/2, 0, 2*Math.PI);
    ctx.fillStyle = '#43cea2';
    ctx.fill();
    ctx.strokeStyle = '#185a9d';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Draw blocks
  for (let b of blocks) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, BLOCK_SIZE-8, BLOCK_SIZE-8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.val, b.x+(BLOCK_SIZE-8)/2, b.y+(BLOCK_SIZE-8)/2);
  }
  // Draw score
  ctx.font = '18px Segoe UI, Arial';
  ctx.fillStyle = '#185a9d';
  ctx.textAlign = 'left';
  ctx.fillText('Score: '+score, 10, 24);
  if (gameOver) {
    ctx.font = '32px Segoe UI, Arial';
    ctx.fillStyle = '#f44336';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W/2, H/2);
  }
}

function update() {
  if (gameOver) return;
  snake.x += vx;
  if (snake.x < SNAKE_SIZE/2) snake.x = SNAKE_SIZE/2;
  if (snake.x > W-SNAKE_SIZE/2) snake.x = W-SNAKE_SIZE/2;
  // Move blocks down
  for (let b of blocks) b.y += 2;
  // Collision with blocks
  for (let b of blocks) {
    if (b.y+BLOCK_SIZE-8 > snake.y-SNAKE_SIZE/2 && b.y < snake.y+SNAKE_SIZE/2 && Math.abs(b.x+BLOCK_SIZE/2-snake.x)<BLOCK_SIZE/2) {
      if (b.val >= snake.len) {
        gameOver = true;
        draw();
        setTimeout(()=>alert('Game Over! Score: '+score),200);
        return;
      } else {
        snake.len -= b.val;
        score += b.val;
        scoreEl.textContent = score;
        b.val = 0;
      }
    }
  }
  // Remove blocks with val 0
  blocks = blocks.filter(b=>b.val>0 && b.y<H+BLOCK_SIZE);
  // Add new blocks if needed
  if (blocks.length < BLOCK_ROWS*BLOCK_COLS/2) spawnBlocks();
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
  if (e.key==='ArrowLeft') vx = -SNAKE_SIZE;
  if (e.key==='ArrowRight') vx = SNAKE_SIZE;
});
document.addEventListener('keyup', e => {
  if (e.key==='ArrowLeft' || e.key==='ArrowRight') vx = 0;
});
// Touch controls
canvas.addEventListener('touchstart', e => {
  if (e.touches.length===1) touchStartX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length===1 && touchStartX!==undefined) {
    let dx = e.touches[0].clientX - touchStartX;
    if (dx < -10) vx = -SNAKE_SIZE;
    else if (dx > 10) vx = SNAKE_SIZE;
    else vx = 0;
  }
});
canvas.addEventListener('touchend', e => { vx = 0; });

restartBtn.addEventListener('click', ()=>{initGame();update();});

initGame();
update();
