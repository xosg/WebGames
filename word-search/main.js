// Word Search
// Author: xosg

const WORDS = [
  'JAVASCRIPT','PYTHON','CODE','ARRAY','OBJECT','CANVAS','SCRIPT','EDITOR','BROWSER','SEARCH',
  'PUZZLE','LOGIC','STRING','NUMBER','BOARD','MOUSE','CLICK','SELECT','WINNER','SOURCE'
];
const GRID_SIZE = 10;
const canvas = document.getElementById('wordsearch-canvas');
const ctx = canvas.getContext('2d');
const wordListEl = document.getElementById('word-list');
const restartBtn = document.getElementById('restart-btn');

let grid, placedWords, foundWords, cellSize, selecting, selectStart, selectEnd;

function randomInt(n) { return Math.floor(Math.random() * n); }

function pickWords() {
  // Pick 6 random words
  let pool = [...WORDS];
  let chosen = [];
  for (let i = 0; i < 6; i++) {
    let idx = randomInt(pool.length);
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return chosen;
}

function makeGrid(words) {
  let grid = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(''));
  let placed = [];
  for (let word of words) {
    let placedWord = placeWord(grid, word);
    if (placedWord) placed.push(placedWord);
  }
  // Fill empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + randomInt(26));
    }
  }
  return {grid, placed};
}

function placeWord(grid, word) {
  const directions = [
    [0,1], [1,0], [1,1], [-1,1]
  ]; // right, down, diag down, diag up
  for (let tries = 0; tries < 100; tries++) {
    let dir = directions[randomInt(directions.length)];
    let maxR = dir[0] === 1 ? GRID_SIZE - word.length : dir[0] === -1 ? word.length-1 : GRID_SIZE-1;
    let maxC = dir[1] === 1 ? GRID_SIZE - word.length : GRID_SIZE-1;
    let row = dir[0] === -1 ? randomInt(GRID_SIZE-word.length+1)+word.length-1 : randomInt(maxR+1);
    let col = randomInt(maxC+1);
    // Check fit
    let fits = true;
    for (let i = 0; i < word.length; i++) {
      let r = row + dir[0]*i, c = col + dir[1]*i;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { fits = false; break; }
      if (grid[r][c] && grid[r][c] !== word[i]) { fits = false; break; }
    }
    if (!fits) continue;
    // Place
    for (let i = 0; i < word.length; i++) {
      let r = row + dir[0]*i, c = col + dir[1]*i;
      grid[r][c] = word[i];
    }
    return {word, row, col, dir};
  }
  return null;
}

function drawGrid() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cellSize = Math.floor(canvas.width / GRID_SIZE);
  ctx.font = `${cellSize*0.6}px Segoe UI, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Highlight found words
  for (let found of foundWords) {
    highlightWord(found, '#ffe082');
  }
  // Draw selection
  if (selecting && selectStart && selectEnd) {
    let sel = getSelectionCells(selectStart, selectEnd);
    for (let {r,c} of sel) {
      ctx.fillStyle = '#ffd20088';
      ctx.fillRect(c*cellSize, r*cellSize, cellSize, cellSize);
    }
  }
  // Draw grid
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.strokeStyle = '#f7971e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c*cellSize, r*cellSize, cellSize, cellSize);
      ctx.fillStyle = '#333';
      ctx.fillText(grid[r][c], c*cellSize+cellSize/2, r*cellSize+cellSize/2);
    }
  }
}

function highlightWord(wordObj, color) {
  let {word, row, col, dir} = wordObj;
  ctx.fillStyle = color;
  for (let i = 0; i < word.length; i++) {
    let r = row + dir[0]*i, c = col + dir[1]*i;
    ctx.fillRect(c*cellSize, r*cellSize, cellSize, cellSize);
  }
}

function renderWordList() {
  wordListEl.innerHTML = '';
  for (let w of placedWords) {
    const span = document.createElement('span');
    span.textContent = w.word;
    if (foundWords.some(f => f.word === w.word)) span.style.textDecoration = 'line-through';
    wordListEl.appendChild(span);
  }
}

function getCellFromXY(x, y) {
  const rect = canvas.getBoundingClientRect();
  let cx = x - rect.left, cy = y - rect.top;
  let c = Math.floor(cx / cellSize), r = Math.floor(cy / cellSize);
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null;
  return {r, c};
}

function getSelectionCells(start, end) {
  let dr = end.r - start.r, dc = end.c - start.c;
  let len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [start];
  let stepR = dr === 0 ? 0 : dr/Math.abs(dr);
  let stepC = dc === 0 ? 0 : dc/Math.abs(dc);
  let cells = [];
  for (let i = 0; i <= len; i++) {
    let r = start.r + stepR*i, c = start.c + stepC*i;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break;
    cells.push({r, c});
  }
  return cells;
}

function checkSelection(start, end) {
  for (let w of placedWords) {
    let {word, row, col, dir} = w;
    let len = word.length;
    let sr = start.r, sc = start.c, er = end.r, ec = end.c;
    let dr = dir[0], dc = dir[1];
    let wr = row, wc = col;
    let wrEnd = row + dr*(len-1), wcEnd = col + dc*(len-1);
    // Check both directions
    if ((sr === wr && sc === wc && er === wrEnd && ec === wcEnd) ||
        (er === wr && ec === wc && sr === wrEnd && sc === wcEnd)) {
      if (!foundWords.some(f => f.word === word)) {
        foundWords.push(w);
        renderWordList();
        drawGrid();
        if (foundWords.length === placedWords.length) setTimeout(() => alert('You found all words!'), 200);
      }
      break;
    }
  }
}

function onPointerDown(e) {
  let pt = getCellFromXY(e.touches ? e.touches[0].clientX : e.clientX, e.touches ? e.touches[0].clientY : e.clientY);
  if (!pt) return;
  selecting = true;
  selectStart = pt;
  selectEnd = pt;
  drawGrid();
}
function onPointerMove(e) {
  if (!selecting) return;
  let pt = getCellFromXY(e.touches ? e.touches[0].clientX : e.clientX, e.touches ? e.touches[0].clientY : e.clientY);
  if (!pt) return;
  selectEnd = pt;
  drawGrid();
}
function onPointerUp(e) {
  if (!selecting) return;
  let pt = getCellFromXY(e.changedTouches ? e.changedTouches[0].clientX : e.clientX, e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
  if (!pt) return;
  selectEnd = pt;
  checkSelection(selectStart, selectEnd);
  selecting = false;
  selectStart = selectEnd = null;
  drawGrid();
}

function initGame() {
  let chosen = pickWords();
  let {grid: g, placed} = makeGrid(chosen);
  grid = g;
  placedWords = placed;
  foundWords = [];
  selecting = false;
  selectStart = selectEnd = null;
  renderWordList();
  drawGrid();
}

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchstart', onPointerDown);
canvas.addEventListener('touchmove', onPointerMove);
canvas.addEventListener('touchend', onPointerUp);
restartBtn.addEventListener('click', initGame);

window.addEventListener('resize', drawGrid);

initGame();
