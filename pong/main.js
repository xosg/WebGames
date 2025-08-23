// Pong Game
// Author: xosg

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const PADDLE_W = 12, PADDLE_H = 80, BALL_SIZE = 14;
let leftY = H/2 - PADDLE_H/2, rightY = H/2 - PADDLE_H/2;
let leftScore = 0, rightScore = 0;
let ballX = W/2, ballY = H/2, ballVX = 5, ballVY = 3;
let up1 = false, down1 = false, up2 = false, down2 = false;

function draw() {
  ctx.clearRect(0,0,W,H);
  // Middle line
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([10,10]);
  ctx.beginPath();
  ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  ctx.setLineDash([]);
  // Paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,leftY,PADDLE_W,PADDLE_H);
  ctx.fillRect(W-PADDLE_W,rightY,PADDLE_W,PADDLE_H);
  // Ball
  ctx.beginPath();
  ctx.arc(ballX,ballY,BALL_SIZE/2,0,2*Math.PI);
  ctx.fill();
  // Score
  ctx.font = '32px Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(leftScore, W/2-60, 40);
  ctx.fillText(rightScore, W/2+60, 40);
}

function update() {
  // Move paddles
  if (up1) leftY -= 6;
  if (down1) leftY += 6;
  if (up2) rightY -= 6;
  if (down2) rightY += 6;
  leftY = Math.max(0, Math.min(H-PADDLE_H, leftY));
  rightY = Math.max(0, Math.min(H-PADDLE_H, rightY));
  // Move ball
  ballX += ballVX;
  ballY += ballVY;
  // Collisions
  if (ballY < BALL_SIZE/2 || ballY > H-BALL_SIZE/2) ballVY *= -1;
  // Left paddle
  if (ballX-BALL_SIZE/2 < PADDLE_W && ballY > leftY && ballY < leftY+PADDLE_H) {
    ballVX *= -1;
    ballX = PADDLE_W+BALL_SIZE/2;
  }
  // Right paddle
  if (ballX+BALL_SIZE/2 > W-PADDLE_W && ballY > rightY && ballY < rightY+PADDLE_H) {
    ballVX *= -1;
    ballX = W-PADDLE_W-BALL_SIZE/2;
  }
  // Score
  if (ballX < 0) { rightScore++; resetBall(-1); }
  if (ballX > W) { leftScore++; resetBall(1); }
}

function resetBall(dir) {
  ballX = W/2; ballY = H/2;
  ballVX = 5 * (dir || (Math.random()<0.5?-1:1));
  ballVY = 3 * (Math.random()<0.5?-1:1);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.key==='w') up1 = true;
  if (e.key==='s') down1 = true;
  if (e.key==='ArrowUp') up2 = true;
  if (e.key==='ArrowDown') down2 = true;
});
document.addEventListener('keyup', e => {
  if (e.key==='w') up1 = false;
  if (e.key==='s') down1 = false;
  if (e.key==='ArrowUp') up2 = false;
  if (e.key==='ArrowDown') down2 = false;
});

loop();
