// 2048 Hex
// Author: xosg
// A simple 2048 variant on a hexagonal grid (uses a 3x3 hex grid for simplicity)

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 3; // 3 rings (center + 2 rings)
const HEX_RADIUS = 48;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
const CENTER_X = 200, CENTER_Y = 200;
const HEX_CELLS = [
  [0,0],
  [0,-1],[1,-1],[1,0],[0,1],[-1,1],[-1,0],
  [0,-2],[1,-2],[2,-2],[2,-1],[2,0],[1,1],[0,2],[-1,2],[-2,2],[-2,1],[-2,0],[-1,-1]
];

let board, score, gameOver, touchStartX, touchStartY;

function emptyBoard() {
  return Array(HEX_CELLS.length).fill(0);
}

function addTile() {
  let empty = [];
  for (let i=0;i<board.length;i++) if (board[i]===0) empty.push(i);
  if (empty.length===0) return;
  let idx = empty[Math.floor(Math.random()*empty.length)];
  board[idx] = Math.random()<0.9 ? 2 : 4;
}

function hexToXY(q,r) {
  let x = CENTER_X + HEX_RADIUS * 3/2 * q;
  let y = CENTER_Y + HEX_HEIGHT/2 * (2*r - q);
  return [x,y];
}

function drawHex(x,y,fill) {
  ctx.beginPath();
  for (let i=0;i<6;i++) {
    let angle = Math.PI/3*i - Math.PI/6;
    let px = x + HEX_RADIUS * Math.cos(angle);
    let py = y + HEX_RADIUS * Math.sin(angle);
    if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#f7971e';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function renderBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let i=0;i<HEX_CELLS.length;i++) {
    let [q,r] = HEX_CELLS[i];
    let [x,y] = hexToXY(q,r);
    drawHex(x,y, board[i] ? '#ffe082' : '#fffbe7');
    if (board[i]) {
      ctx.font = 'bold 24px Segoe UI, Arial';
      ctx.fillStyle = '#f7971e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(board[i], x, y);
    }
  }
  scoreEl.textContent = score;
}

function move(dir) {
  // For simplicity, only allow up/down/left/right (not all 6 hex directions)
  // Map to axial directions: up (r--), down (r++), left (q--), right (q++)
  let moved = false;
  let merged = Array(board.length).fill(false);
  let dirs = {
    'up':  [0,-1],
    'down':[0,1],
    'left':[-1,0],
    'right':[1,0]
  };
  let [dq,dr] = dirs[dir];
  // Try to move each cell in the right order
  let order = [...Array(board.length).keys()];
  if (dir==='down'||dir==='right') order.reverse();
  for (let idx of order) {
    if (!board[idx]) continue;
    let [q,r] = HEX_CELLS[idx];
    let cur = idx;
    while (true) {
      let nq = q+dq, nr = r+dr;
      let nidx = HEX_CELLS.findIndex(([qq,rr])=>qq===nq&&rr===nr);
      if (nidx===-1) break;
      if (board[nidx]===0) {
        board[nidx]=board[cur]; board[cur]=0; cur=nidx; q=nq; r=nr; moved=true;
      } else if (board[nidx]===board[cur] && !merged[nidx] && !merged[cur]) {
        board[nidx]*=2; board[cur]=0; score+=board[nidx]; merged[nidx]=true; moved=true; break;
      } else break;
    }
  }
  if (moved) addTile();
  renderBoard();
  if (isGameOver()) setTimeout(()=>alert('Game Over! Score: '+score),200);
  if (has2048()) setTimeout(()=>alert('You win!'),200);
}

function isGameOver() {
  for (let i=0;i<board.length;i++) if (board[i]===0) return false;
  for (let i=0;i<board.length;i++) {
    let [q,r] = HEX_CELLS[i];
    for (let [dq,dr] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      let nidx = HEX_CELLS.findIndex(([qq,rr])=>qq===q+dq&&rr===r+dr);
      if (nidx!==-1 && board[nidx]===board[i]) return false;
    }
  }
  return true;
}

function has2048() {
  for (let i=0;i<board.length;i++) if (board[i]===2048) return true;
  return false;
}

function restart() {
  board = emptyBoard();
  score = 0;
  addTile();
  addTile();
  renderBoard();
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key==='ArrowLeft') move('left');
  if (e.key==='ArrowRight') move('right');
  if (e.key==='ArrowUp') move('up');
  if (e.key==='ArrowDown') move('down');
});
// Touch controls
canvas.addEventListener('touchstart', e => {
  if (e.touches.length===1) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }
});
canvas.addEventListener('touchend', e => {
  if (touchStartX===undefined||touchStartY===undefined) return;
  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx)>Math.abs(dy)) {
    if (dx>30) move('right');
    else if (dx<-30) move('left');
  } else {
    if (dy>30) move('down');
    else if (dy<-30) move('up');
  }
  touchStartX = touchStartY = undefined;
});
restartBtn.addEventListener('click', restart);

restart();
