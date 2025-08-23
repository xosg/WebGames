// Color Flood
// Author: xosg

const canvas = document.getElementById('flood-canvas');
const ctx = canvas.getContext('2d');
const movesEl = document.getElementById('moves');
const colorBtnsEl = document.getElementById('color-buttons');
const restartBtn = document.getElementById('restart-btn');

const COLORS = ['#f44336','#2196f3','#4caf50','#ffeb3b','#ff9800','#9c27b0'];
const SIZE = 12;
let grid, moves;

function randomColor() {
  return COLORS[Math.floor(Math.random()*COLORS.length)];
}

function createGrid() {
  let g = [];
  for (let r=0;r<SIZE;r++) {
    let row = [];
    for (let c=0;c<SIZE;c++) row.push(randomColor());
    g.push(row);
  }
  return g;
}

function drawGrid() {
  let cell = canvas.width/SIZE;
  for (let r=0;r<SIZE;r++) {
    for (let c=0;c<SIZE;c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c*cell, r*cell, cell, cell);
    }
  }
}

function floodFill(r, c, target, replacement) {
  if (target === replacement) return;
  let stack = [[r,c]];
  while (stack.length) {
    let [x,y] = stack.pop();
    if (x<0||x>=SIZE||y<0||y>=SIZE) continue;
    if (grid[x][y] !== target) continue;
    grid[x][y] = replacement;
    stack.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);
  }
}

function isFlooded() {
  let color = grid[0][0];
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (grid[r][c]!==color) return false;
  return true;
}

function handleColor(idx) {
  let color = COLORS[idx];
  let startColor = grid[0][0];
  if (color === startColor) return;
  floodFill(0,0,startColor,color);
  moves++;
  movesEl.textContent = moves;
  drawGrid();
  if (isFlooded()) setTimeout(()=>alert('You win! Moves: '+moves),200);
}

function renderColorButtons() {
  colorBtnsEl.innerHTML = '';
  COLORS.forEach((color,i)=>{
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.background = color;
    btn.addEventListener('click',()=>handleColor(i));
    colorBtnsEl.appendChild(btn);
  });
}

function startGame() {
  grid = createGrid();
  moves = 0;
  movesEl.textContent = moves;
  renderColorButtons();
  drawGrid();
}

restartBtn.addEventListener('click', startGame);
window.addEventListener('resize', drawGrid);

startGame();
