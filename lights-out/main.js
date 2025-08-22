// Lights Out
// Author: xosg

const boardEl = document.getElementById('game-board');
const movesSpan = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 5;
let board, moves;

function initGame() {
    board = Array.from({length: SIZE}, () => Array.from({length: SIZE}, () => Math.random() < 0.5));
    moves = 0;
    movesSpan.textContent = moves;
    renderBoard();
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const el = document.createElement('div');
            el.className = 'light' + (board[r][c] ? '' : ' off');
            el.addEventListener('click', () => handleClick(r, c));
            boardEl.appendChild(el);
        }
    }
}

function handleClick(r, c) {
    toggle(r, c);
    toggle(r-1, c);
    toggle(r+1, c);
    toggle(r, c-1);
    toggle(r, c+1);
    moves++;
    movesSpan.textContent = moves;
    renderBoard();
    if (isWin()) setTimeout(() => alert('You win! Moves: ' + moves), 200);
}

function toggle(r, c) {
    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
        board[r][c] = !board[r][c];
    }
}

function isWin() {
    return board.flat().every(cell => !cell);
}

restartBtn.addEventListener('click', initGame);

initGame();
