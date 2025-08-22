// Reversi (Othello)
// Author: xosg

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const blackScoreSpan = document.getElementById('black-score');
const whiteScoreSpan = document.getElementById('white-score');
const restartBtn = document.getElementById('restart-btn');

const SIZE = 8;
const CELL = 50;
const EMPTY = 0, BLACK = 1, WHITE = 2;
let board, current, gameOver;

function initGame() {
    board = Array.from({length: SIZE}, () => Array(SIZE).fill(EMPTY));
    board[3][3] = WHITE; board[3][4] = BLACK;
    board[4][3] = BLACK; board[4][4] = WHITE;
    current = BLACK;
    gameOver = false;
    updateScores();
    drawBoard();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grid
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            ctx.save();
            ctx.strokeStyle = '#43cea2';
            ctx.lineWidth = 2;
            ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
            if (board[r][c] !== EMPTY) {
                ctx.beginPath();
                ctx.arc(c * CELL + CELL/2, r * CELL + CELL/2, CELL/2.3, 0, 2 * Math.PI);
                ctx.fillStyle = board[r][c] === BLACK ? '#222' : '#fff';
                ctx.fill();
                ctx.strokeStyle = '#185a9d';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (isValidMove(r, c, current)) {
        makeMove(r, c, current);
        current = 3 - current;
        updateScores();
        drawBoard();
        if (!hasValidMove(current)) {
            if (!hasValidMove(3 - current)) {
                gameOver = true;
                setTimeout(() => alert('Game Over!'), 200);
            } else {
                current = 3 - current;
            }
        }
    }
});

function isValidMove(r, c, player) {
    if (board[r][c] !== EMPTY) return false;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (captures(r, c, dr, dc, player).length > 0) return true;
        }
    }
    return false;
}

function captures(r, c, dr, dc, player) {
    let out = [], i = 1;
    while (true) {
        let nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return [];
        if (board[nr][nc] === 3 - player) out.push([nr, nc]);
        else if (board[nr][nc] === player) return out.length ? out : [];
        else return [];
        i++;
    }
}

function makeMove(r, c, player) {
    board[r][c] = player;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let toFlip = captures(r, c, dr, dc, player);
            for (let [fr, fc] of toFlip) board[fr][fc] = player;
        }
    }
}

function hasValidMove(player) {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (isValidMove(r, c, player)) return true;
    return false;
}

function updateScores() {
    let black = 0, white = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === BLACK) black++;
        if (board[r][c] === WHITE) white++;
    }
    blackScoreSpan.textContent = black;
    whiteScoreSpan.textContent = white;
}

restartBtn.addEventListener('click', initGame);

initGame();
