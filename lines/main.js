// Color Lines
// Author: xosg

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 9;
const COLORS = ['#f44336','#2196f3','#4caf50','#ffeb3b','#ff9800','#9c27b0'];
const BALL_RADIUS = 16;
let board, selected, score, gameOver;

function emptyBoard() {
  return Array.from({length:SIZE},()=>Array(SIZE).fill(null));
}

function randomColor() {
  return COLORS[Math.floor(Math.random()*COLORS.length)];
}

function addBalls(n=3) {
  let empty = [];
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!board[r][c]) empty.push([r,c]);
  for (let i=0;i<n && empty.length>0;i++) {
    let idx = Math.floor(Math.random()*empty.length);
    let [r,c] = empty[idx];
    board[r][c] = randomColor();
    empty.splice(idx,1);
  }
}

function drawBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let cell = canvas.width/SIZE;
  // Draw grid
  ctx.strokeStyle = '#185a9d';
  for (let i=0;i<=SIZE;i++) {
    ctx.beginPath();
    ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i*cell); ctx.lineTo(canvas.width,i*cell); ctx.stroke();
  }
  // Draw balls
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
    if (board[r][c]) {
      ctx.beginPath();
      ctx.arc(c*cell+cell/2, r*cell+cell/2, BALL_RADIUS, 0, 2*Math.PI);
      ctx.fillStyle = board[r][c];
      ctx.fill();
      if (selected && selected[0]===r && selected[1]===c) {
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }
}

function handleClick(e) {
  if (gameOver) return;
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left, y = e.clientY - rect.top;
  let cell = Math.floor(y/(canvas.height/SIZE)), col = Math.floor(x/(canvas.width/SIZE));
  if (cell<0||cell>=SIZE||col<0||col>=SIZE) return;
  if (board[cell][col]) {
    selected = [cell,col];
  } else if (selected) {
    if (canMove(selected, [cell,col])) {
      board[cell][col] = board[selected[0]][selected[1]];
      board[selected[0]][selected[1]] = null;
      selected = null;
      if (!removeLines()) addBalls();
      if (isGameOver()) {
        gameOver = true;
        setTimeout(()=>alert('Game Over! Score: '+score),200);
      }
    }
  }
  drawBoard();
}

function canMove(from, to) {
  // BFS for path
  let visited = Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  let queue = [from];
  visited[from[0]][from[1]] = true;
  let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (queue.length) {
    let [r,c] = queue.shift();
    if (r===to[0]&&c===to[1]) return true;
    for (let [dr,dc] of dirs) {
      let nr=r+dr,nc=c+dc;
      if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&!visited[nr][nc]&&!board[nr][nc]) {
        visited[nr][nc]=true;
        queue.push([nr,nc]);
      }
    }
  }
  return false;
}

function removeLines() {
  let removed = false;
  let toRemove = Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  // Check all directions
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (board[r][c]) {
    let color = board[r][c];
    // Horizontal
    let cnt=1; while(c+cnt<SIZE&&board[r][c+cnt]===color) cnt++;
    if (cnt>=5) { for(let k=0;k<cnt;k++) toRemove[r][c+k]=true; removed=true; }
    // Vertical
    cnt=1; while(r+cnt<SIZE&&board[r+cnt][c]===color) cnt++;
    if (cnt>=5) { for(let k=0;k<cnt;k++) toRemove[r+k][c]=true; removed=true; }
    // Diagonal \
    cnt=1; while(r+cnt<SIZE&&c+cnt<SIZE&&board[r+cnt][c+cnt]===color) cnt++;
    if (cnt>=5) { for(let k=0;k<cnt;k++) toRemove[r+k][c+k]=true; removed=true; }
    // Diagonal /
    cnt=1; while(r+cnt<SIZE&&c-cnt>=0&&board[r+cnt][c-cnt]===color) cnt++;
    if (cnt>=5) { for(let k=0;k<cnt;k++) toRemove[r+k][c-k]=true; removed=true; }
  }
  let points = 0;
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (toRemove[r][c]) { board[r][c]=null; points++; }
  if (points>0) score += points;
  scoreEl.textContent = score;
  return removed;
}

function isGameOver() {
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!board[r][c]) return false;
  return true;
}

function restart() {
  board = emptyBoard();
  selected = null;
  score = 0;
  gameOver = false;
  addBalls(5);
  scoreEl.textContent = score;
  drawBoard();
}

canvas.addEventListener('click', handleClick);
restartBtn.addEventListener('click', restart);

restart();
