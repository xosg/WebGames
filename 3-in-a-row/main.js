// 3 in a Row (Tic-Tac-Toe)
// Author: xosg

const boardEl = document.getElementById('game-board');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');

let board, currentPlayer, gameOver;

function initGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    renderBoard();
    statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.idx = i;
        cell.textContent = board[i] || '';
        cell.addEventListener('click', handleCellClick);
        boardEl.appendChild(cell);
    }
}

function handleCellClick(e) {
    const idx = +e.target.dataset.idx;
    if (board[idx] || gameOver) return;
    board[idx] = currentPlayer;
    renderBoard();
    const winner = checkWinner();
    if (winner) {
        statusText.textContent = `Player ${winner} wins!`;
        highlightWinner(winner);
        gameOver = true;
    } else if (board.every(cell => cell)) {
        statusText.textContent = "It's a draw!";
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
}

function checkWinner() {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function highlightWinner(winner) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            const cells = boardEl.querySelectorAll('.cell');
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            break;
        }
    }
}

restartBtn.addEventListener('click', initGame);

initGame();
