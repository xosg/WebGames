// Space Invaders
// Author: xosg

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const W = canvas.width, H = canvas.height;
const PLAYER_W = 40, PLAYER_H = 16, PLAYER_Y = H-40;
const INVADER_W = 28, INVADER_H = 18, INVADER_ROWS = 4, INVADER_COLS = 8;
const BULLET_W = 4, BULLET_H = 12;

let playerX, left, right, bullets, invaders, invaderDir, invaderStep, score, gameOver, shootReady;

function initGame() {
  playerX = W/2 - PLAYER_W/2;
  left = right = false;
  bullets = [];
  invaders = [];
  for (let r=0;r<INVADER_ROWS;r++) {
    for (let c=0;c<INVADER_COLS;c++) {
      invaders.push({x: c*44+24, y: r*32+32, alive: true});
    }
  }
  invaderDir = 1;
  invaderStep = 0;
  score = 0;
  gameOver = false;
  shootReady = true;
  scoreEl.textContent = score;
  draw();
}

function draw() {
  ctx.clearRect(0,0,W,H);
  // Draw player
  ctx.fillStyle = '#43cea2';
  ctx.fillRect(playerX, PLAYER_Y, PLAYER_W, PLAYER_H);
  // Draw bullets
  ctx.fillStyle = '#f44336';
  for (let b of bullets) ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H);
  // Draw invaders
  for (let inv of invaders) {
    if (inv.alive) {
      ctx.fillStyle = '#185a9d';
      ctx.fillRect(inv.x, inv.y, INVADER_W, INVADER_H);
    }
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
  // Move player
  if (left) playerX -= 6;
  if (right) playerX += 6;
  playerX = Math.max(0, Math.min(W-PLAYER_W, playerX));
  // Move bullets
  for (let b of bullets) b.y -= 10;
  bullets = bullets.filter(b=>b.y+BULLET_H>0);
  // Move invaders
  invaderStep++;
  if (invaderStep%18===0) {
    let edge = false;
    for (let inv of invaders) {
      if (inv.alive && (inv.x+INVADER_W>=W-8 && invaderDir>0 || inv.x<=8 && invaderDir<0)) edge = true;
    }
    if (edge) {
      for (let inv of invaders) inv.y += 24;
      invaderDir *= -1;
    } else {
      for (let inv of invaders) inv.x += invaderDir*12;
    }
  }
  // Bullet-invader collision
  for (let b of bullets) {
    for (let inv of invaders) {
      if (inv.alive && b.x < inv.x+INVADER_W && b.x+BULLET_W > inv.x && b.y < inv.y+INVADER_H && b.y+BULLET_H > inv.y) {
        inv.alive = false;
        b.y = -100;
        score++;
        scoreEl.textContent = score;
      }
    }
  }
  // Invader-player collision
  for (let inv of invaders) {
    if (inv.alive && inv.y+INVADER_H > PLAYER_Y && inv.x < playerX+PLAYER_W && inv.x+INVADER_W > playerX) {
      gameOver = true;
      draw();
      setTimeout(()=>alert('Game Over! Score: '+score),200);
      return;
    }
  }
  // Win
  if (invaders.every(inv=>!inv.alive)) {
    gameOver = true;
    draw();
    setTimeout(()=>alert('You win! Score: '+score),200);
    return;
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
  if (e.key==='ArrowLeft') left = true;
  if (e.key==='ArrowRight') right = true;
  if (e.key===' ' && shootReady && !gameOver) {
    bullets.push({x:playerX+PLAYER_W/2-BULLET_W/2, y:PLAYER_Y-10});
    shootReady = false;
  }
});
document.addEventListener('keyup', e => {
  if (e.key==='ArrowLeft') left = false;
  if (e.key==='ArrowRight') right = false;
  if (e.key===' ') shootReady = true;
});

restartBtn.addEventListener('click', ()=>{initGame();update();});

initGame();
update();
