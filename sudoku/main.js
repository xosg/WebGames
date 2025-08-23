// Sudoku
// Author: xosg

const boardEl = document.getElementById('sudoku-board');
const restartBtn = document.getElementById('restart-btn');
const checkBtn = document.getElementById('check-btn');

// Simple puzzle (0 = empty)
const puzzle = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];
let cells = [];

function createBoard() {
  boardEl.innerHTML = '';
  cells = [];
  for (let r = 0; r < 9; r++) {
    let row = [];
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('input');
      cell.type = 'text';
      cell.maxLength = 1;
      cell.className = 'sudoku-cell';
      if (puzzle[r][c] !== 0) {
        cell.value = puzzle[r][c];
        cell.disabled = true;
        cell.classList.add('prefilled');
      } else {
        cell.value = '';
        cell.addEventListener('input', () => {
          cell.value = cell.value.replace(/[^1-9]/g, '');
        });
      }
      row.push(cell);
      boardEl.appendChild(cell);
    }
    cells.push(row);
  }
}

function getBoard() {
  return cells.map(row => row.map(cell => parseInt(cell.value) || 0));
}

function checkBoard() {
  let valid = true;
  // Remove previous invalid highlights
  for (let row of cells) for (let cell of row) cell.classList.remove('invalid');
  let board = getBoard();
  // Check rows, columns, boxes
  for (let i = 0; i < 9; i++) {
    let rowSet = new Set(), colSet = new Set();
    for (let j = 0; j < 9; j++) {
      // Row
      if (board[i][j] !== 0) {
        if (rowSet.has(board[i][j])) { cells[i][j].classList.add('invalid'); valid = false; }
        rowSet.add(board[i][j]);
      }
      // Col
      if (board[j][i] !== 0) {
        if (colSet.has(board[j][i])) { cells[j][i].classList.add('invalid'); valid = false; }
        colSet.add(board[j][i]);
      }
    }
  }
  // Boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let boxSet = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          let val = board[br*3+r][bc*3+c];
          if (val !== 0) {
            if (boxSet.has(val)) { cells[br*3+r][bc*3+c].classList.add('invalid'); valid = false; }
            boxSet.add(val);
          }
        }
      }
    }
  }
  if (valid && board.every(row => row.every(v => v !== 0))) {
    setTimeout(() => alert('Congratulations! Sudoku solved!'), 100);
  } else if (!valid) {
    setTimeout(() => alert('There are errors in your solution.'), 100);
  } else {
    setTimeout(() => alert('Keep going!'), 100);
  }
}

function restart() {
  createBoard();
}

restartBtn.addEventListener('click', restart);
checkBtn.addEventListener('click', checkBoard);

createBoard();
