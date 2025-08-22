// Connect Four
// Author: xosg

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 60;
const P1 = 1, P2 = 2;
const COLORS = ['#fff', '#f44336', '#1976d2'];

let board, currentPlayer, gameOver;

function initGame() {
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    currentPlayer = P1;
    gameOver = false;
    statusText.textContent = "Red's turn";
    drawBoard();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Board background
    ctx.fillStyle = '#ffd200';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Cells
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(c * CELL_SIZE + CELL_SIZE/2, r * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 6, 0, 2 * Math.PI);
            ctx.fillStyle = COLORS[board[r][c]];
            ctx.fill();
            ctx.strokeStyle = '#f7971e';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const col = Math.floor(x / CELL_SIZE);
    if (col < 0 || col >= COLS) return;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = currentPlayer;
            if (checkWin(r, col, currentPlayer)) {
                statusText.textContent = (currentPlayer === P1 ? 'Red' : 'Blue') + ' wins!';
                gameOver = true;
            } else if (board.flat().every(cell => cell !== 0)) {
                statusText.textContent = "It's a draw!";
                gameOver = true;
            } else {
                currentPlayer = currentPlayer === P1 ? P2 : P1;
                statusText.textContent = (currentPlayer === P1 ? "Red's" : "Blue's") + ' turn';
            }
            drawBoard();
            break;
        }
    }
});

function checkWin(r, c, player) {
    return (
        count(r, c, 0, 1, player) + count(r, c, 0, -1, player) > 2 || // horiz
        count(r, c, 1, 0, player) + count(r, c, -1, 0, player) > 2 || // vert
        count(r, c, 1, 1, player) + count(r, c, -1, -1, player) > 2 || // diag \
        count(r, c, 1, -1, player) + count(r, c, -1, 1, player) > 2    // diag /
    );
}
function count(r, c, dr, dc, player) {
    let n = 0;
    for (let i = 1; i < 4; i++) {
        let nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break;
        n++;
    }
    return n;
}

restartBtn.addEventListener('click', initGame);

initGame();
