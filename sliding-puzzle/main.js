// Sliding Puzzle (15-puzzle)
// Author: xosg

const boardEl = document.getElementById('game-board');
const movesSpan = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 4;
let board, empty, moves;

function initGame() {
    let nums = Array.from({length: SIZE*SIZE-1}, (_, i) => i+1);
    nums = shuffle(nums);
    nums.push(null);
    board = [];
    for (let i = 0; i < SIZE; i++) {
        board.push(nums.slice(i*SIZE, (i+1)*SIZE));
    }
    empty = findEmpty();
    moves = 0;
    movesSpan.textContent = moves;
    renderBoard();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function findEmpty() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === null) return [r, c];
        }
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const val = board[r][c];
            const el = document.createElement('div');
            el.className = 'tile' + (val === null ? ' empty' : '');
            el.textContent = val || '';
            el.addEventListener('click', () => handleTileClick(r, c));
            boardEl.appendChild(el);
        }
    }
}

function handleTileClick(r, c) {
    if (canMove(r, c)) {
        board[empty[0]][empty[1]] = board[r][c];
        board[r][c] = null;
        empty = [r, c];
        moves++;
        movesSpan.textContent = moves;
        renderBoard();
        if (isSolved()) {
            setTimeout(() => alert('You win! Moves: ' + moves), 200);
        }
    }
}

function canMove(r, c) {
    const [er, ec] = empty;
    return (Math.abs(er - r) + Math.abs(ec - c)) === 1;
}

function isSolved() {
    let n = 1;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (r === SIZE-1 && c === SIZE-1) return board[r][c] === null;
            if (board[r][c] !== n++) return false;
        }
    }
    return true;
}

restartBtn.addEventListener('click', initGame);

initGame();
