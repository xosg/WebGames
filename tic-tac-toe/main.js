// Tic-Tac-Toe
// Author: xosg

const boardEl = document.getElementById('game-board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');

let board, current, gameOver;

function createBoard() {
  boardEl.innerHTML = '';
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  statusEl.textContent = "Player X's turn";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', () => handleMove(i));
    boardEl.appendChild(cell);
  }
}

function handleMove(idx) {
  if (gameOver || board[idx]) return;
  board[idx] = current;
  boardEl.children[idx].textContent = current;
  let win = checkWin();
  if (win) {
    gameOver = true;
    for (let i of win) boardEl.children[i].classList.add('winner');
    statusEl.textContent = `Player ${current} wins!`;
    return;
  }
  if (board.every(cell => cell)) {
    gameOver = true;
    statusEl.textContent = "It's a draw!";
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  statusEl.textContent = `Player ${current}'s turn`;
}

function checkWin() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let w of wins) {
    if (board[w[0]] && board[w[0]] === board[w[1]] && board[w[1]] === board[w[2]]) return w;
  }
  return null;
}

restartBtn.addEventListener('click', createBoard);

createBoard();
