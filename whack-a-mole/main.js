// Whack-a-Mole
// Author: xosg

const grid = document.getElementById('mole-grid');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let active = -1;
let timer = null;
let gameActive = true;

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'mole-hole';
    hole.dataset.idx = i;
    hole.addEventListener('click', () => whack(i));
    grid.appendChild(hole);
  }
}

function randomHole() {
  return Math.floor(Math.random() * 9);
}

function showMole() {
  if (!gameActive) return;
  if (active >= 0) grid.children[active].classList.remove('active');
  active = randomHole();
  grid.children[active].classList.add('active');
  grid.children[active].textContent = '🐹';
  setTimeout(() => {
    if (active >= 0) grid.children[active].textContent = '';
  }, 600);
}

function whack(idx) {
  if (!gameActive) return;
  if (idx === active) {
    score++;
    scoreEl.textContent = score;
    grid.children[active].classList.remove('active');
    grid.children[active].textContent = '';
    active = -1;
  }
}

function gameLoop() {
  showMole();
  timer = setTimeout(gameLoop, 900);
}

function startGame() {
  score = 0;
  scoreEl.textContent = score;
  active = -1;
  gameActive = true;
  createGrid();
  if (timer) clearTimeout(timer);
  gameLoop();
}

restartBtn.addEventListener('click', startGame);

createGrid();
startGame();
