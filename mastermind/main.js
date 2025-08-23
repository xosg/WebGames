// Mastermind
// Author: xosg

const COLORS = ['#f44336','#2196f3','#4caf50','#ffeb3b','#ff9800','#9c27b0'];
const CODE_LENGTH = 4;
const MAX_TURNS = 10;

const boardEl = document.getElementById('board');
const paletteEl = document.getElementById('color-palette');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');

let secret, guesses, currentGuess, selectedSlot, gameOver;

function randomCode() {
  let code = [];
  for (let i=0;i<CODE_LENGTH;i++) code.push(Math.floor(Math.random()*COLORS.length));
  return code;
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let i=0;i<MAX_TURNS;i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j=0;j<CODE_LENGTH;j++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (i < guesses.length) {
        slot.style.background = COLORS[guesses[i][j]];
      } else if (i === guesses.length) {
        if (currentGuess[j] !== null) slot.style.background = COLORS[currentGuess[j]];
        if (selectedSlot === j && !gameOver) slot.classList.add('selected');
        slot.addEventListener('click',()=>selectSlot(j));
      }
      row.appendChild(slot);
    }
    // Feedback
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    if (i < guesses.length) {
      let fb = getFeedback(guesses[i], secret);
      for (let k=0;k<fb.black;k++) {
        const dot = document.createElement('div');
        dot.className = 'feedback-dot black';
        feedback.appendChild(dot);
      }
      for (let k=0;k<fb.white;k++) {
        const dot = document.createElement('div');
        dot.className = 'feedback-dot white';
        feedback.appendChild(dot);
      }
      for (let k=fb.black+fb.white;k<CODE_LENGTH;k++) {
        const dot = document.createElement('div');
        dot.className = 'feedback-dot';
        feedback.appendChild(dot);
      }
    }
    row.appendChild(feedback);
    boardEl.appendChild(row);
  }
}

function renderPalette() {
  paletteEl.innerHTML = '';
  COLORS.forEach((color,i)=>{
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.background = color;
    btn.addEventListener('click',()=>selectColor(i));
    paletteEl.appendChild(btn);
  });
}

function selectSlot(idx) {
  if (gameOver) return;
  selectedSlot = idx;
  renderBoard();
}

function selectColor(idx) {
  if (gameOver || selectedSlot === null) return;
  currentGuess[selectedSlot] = idx;
  // Auto-advance
  for (let i=0;i<CODE_LENGTH;i++) {
    if (currentGuess[i] === null) { selectedSlot = i; break; }
    if (i === CODE_LENGTH-1) selectedSlot = null;
  }
  renderBoard();
}

function getFeedback(guess, code) {
  let black = 0, white = 0;
  let codeCopy = code.slice();
  let guessCopy = guess.slice();
  // Black pegs
  for (let i=0;i<CODE_LENGTH;i++) {
    if (guessCopy[i] === codeCopy[i]) {
      black++;
      codeCopy[i] = guessCopy[i] = null;
    }
  }
  // White pegs
  for (let i=0;i<CODE_LENGTH;i++) {
    if (guessCopy[i] !== null) {
      let idx = codeCopy.indexOf(guessCopy[i]);
      if (idx !== -1) {
        white++;
        codeCopy[idx] = null;
      }
    }
  }
  return {black,white};
}

function submitGuess() {
  if (gameOver) return;
  if (currentGuess.some(v=>v===null)) return alert('Fill all slots!');
  guesses.push(currentGuess.slice());
  let fb = getFeedback(currentGuess, secret);
  if (fb.black === CODE_LENGTH) {
    gameOver = true;
    renderBoard();
    setTimeout(()=>alert('You cracked the code!'),200);
    return;
  }
  if (guesses.length >= MAX_TURNS) {
    gameOver = true;
    renderBoard();
    setTimeout(()=>alert('Out of turns! The code was: '+secret.map(i=>COLORS[i]).join(', ')),200);
    return;
  }
  currentGuess = Array(CODE_LENGTH).fill(null);
  selectedSlot = 0;
  renderBoard();
}

function restart() {
  secret = randomCode();
  guesses = [];
  currentGuess = Array(CODE_LENGTH).fill(null);
  selectedSlot = 0;
  gameOver = false;
  renderPalette();
  renderBoard();
}

submitBtn.addEventListener('click', submitGuess);
restartBtn.addEventListener('click', restart);

restart();
