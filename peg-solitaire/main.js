// Peg Solitaire
// Author: xosg

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const pegsSpan = document.getElementById('pegs');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 7;
const BOARD = [
    [0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0],
    [1,1,1,1,1,1,1],
    [1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1],
    [0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0]
];
let board, selected;

function initGame() {
    board = BOARD.map(row => row.slice());
    board[3][3] = 0; // Center hole empty at start
    selected = null;
    updatePegs();
    drawBoard();
}

function updatePegs() {
    let count = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 1) count++;
    pegsSpan.textContent = count;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cell = canvas.width / SIZE;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (BOARD[r][c] === 0) continue;
            ctx.save();
            ctx.strokeStyle = '#f7971e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c * cell + cell/2, r * cell + cell/2, cell/2.5, 0, 2 * Math.PI);
            ctx.stroke();
            if (board[r][c] === 1) {
                ctx.fillStyle = (selected && selected[0] === r && selected[1] === c) ? '#ffd200' : '#f7971e';
                ctx.beginPath();
                ctx.arc(c * cell + cell/2, r * cell + cell/2, cell/3, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cell = canvas.width / SIZE;
    const c = Math.floor((e.clientX - rect.left) / cell);
    const r = Math.floor((e.clientY - rect.top) / cell);
    if (BOARD[r][c] === 0) return;
    if (selected) {
        if (canJump(selected[0], selected[1], r, c)) {
            doJump(selected[0], selected[1], r, c);
            selected = null;
            updatePegs();
            drawBoard();
            if (isGameOver()) setTimeout(() => alert('Game Over! Pegs left: ' + pegsSpan.textContent), 200);
        } else if (board[r][c] === 1) {
            selected = [r, c];
            drawBoard();
        } else {
            selected = null;
            drawBoard();
        }
    } else if (board[r][c] === 1) {
        selected = [r, c];
        drawBoard();
    }
});

function canJump(r1, c1, r2, c2) {
    if (board[r2][c2] !== 0) return false;
    if (r1 === r2 && Math.abs(c1 - c2) === 2 && board[r1][(c1 + c2)/2] === 1) return true;
    if (c1 === c2 && Math.abs(r1 - r2) === 2 && board[(r1 + r2)/2][c1] === 1) return true;
    return false;
}

function doJump(r1, c1, r2, c2) {
    board[r2][c2] = 1;
    board[r1][c1] = 0;
    if (r1 === r2) board[r1][(c1 + c2)/2] = 0;
    else board[(r1 + r2)/2][c1] = 0;
}

function isGameOver() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 1) {
                if (canJump(r, c, r, c+2) || canJump(r, c, r, c-2) || canJump(r, c, r+2, c) || canJump(r, c, r-2, c)) return false;
            }
        }
    }
    return true;
}

restartBtn.addEventListener('click', initGame);

initGame();
