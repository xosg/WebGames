// Battle Chess - Simple Chess with a Twist
// Pieces: K,Q,R,B,N,P. Twist: Captured pieces battle (random win) for a chance to return!

const PIECES = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

let board, selected, turn, info, captured;

function startGame() {
  board = [
    ['bR','bN','bB','bQ','bK','bB','bN','bR'],
    ['bP','bP','bP','bP','bP','bP','bP','bP'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['wP','wP','wP','wP','wP','wP','wP','wP'],
    ['wR','wN','wB','wQ','wK','wB','wN','wR']
  ];
  selected = null;
  turn = 'w';
  captured = { w: [], b: [] };
  render();
  setInfo("White's turn");
}

function render() {
  const boardDiv = document.getElementById('chessboard');
  boardDiv.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.className = 'square ' + ((r+c)%2 ? 'dark' : 'light');
      sq.dataset.r = r; sq.dataset.c = c;
      if (selected && selected.r === r && selected.c === c) sq.classList.add('selected');
      if (selected && isValidMove(selected, {r, c})) sq.classList.add('move');
      if (board[r][c]) sq.textContent = PIECES[board[r][c]];
      sq.onclick = () => onSquareClick(r, c);
      boardDiv.appendChild(sq);
    }
  }
}

function onSquareClick(r, c) {
  const piece = board[r][c];
  if (selected) {
    if (selected.r === r && selected.c === c) {
      selected = null; render(); return;
    }
    if (isValidMove(selected, {r, c})) {
      movePiece(selected, {r, c});
      selected = null;
      render();
      return;
    }
    if (piece && piece[0] === turn) {
      selected = {r, c}; render(); return;
    }
    selected = null; render();
  } else if (piece && piece[0] === turn) {
    selected = {r, c}; render();
  }
}

function isValidMove(from, to) {
  const piece = board[from.r][from.c];
  if (!piece || piece[0] !== turn) return false;
  const dr = to.r - from.r, dc = to.c - from.c;
  // Pawn
  if (piece[1] === 'P') {
    const dir = (turn === 'w') ? -1 : 1;
    if (dc === 0 && !board[to.r][to.c]) {
      if (dr === dir) return true;
      if ((from.r === 6 && turn === 'w' || from.r === 1 && turn === 'b') && dr === 2*dir && !board[from.r+dir][from.c]) return true;
    }
    if (Math.abs(dc) === 1 && dr === dir && board[to.r][to.c] && board[to.r][to.c][0] !== turn) return true;
    return false;
  }
  // Knight
  if (piece[1] === 'N') return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  // Bishop
  if (piece[1] === 'B') return Math.abs(dr) === Math.abs(dc) && clearPath(from, to);
  // Rook
  if (piece[1] === 'R') return (dr === 0 || dc === 0) && clearPath(from, to);
  // Queen
  if (piece[1] === 'Q') return ((dr === 0 || dc === 0) || (Math.abs(dr) === Math.abs(dc))) && clearPath(from, to);
  // King
  if (piece[1] === 'K') return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  return false;
}

function clearPath(from, to) {
  const dr = Math.sign(to.r - from.r), dc = Math.sign(to.c - from.c);
  let r = from.r + dr, c = from.c + dc;
  while (r !== to.r || c !== to.c) {
    if (board[r][c]) return false;
    r += dr; c += dc;
  }
  return true;
}

function movePiece(from, to) {
  const moving = board[from.r][from.c];
  const target = board[to.r][to.c];
  if (target && target[0] !== turn) {
    // Battle! 50% chance for captured piece to win and return to its owner
    if (Math.random() < 0.5) {
      captured[turn].push(target);
      setInfo(PIECES[target] + ' captured!');
    } else {
      // Captured piece wins, returns to its owner at a random empty square
      setInfo(PIECES[target] + ' wins the battle and returns!');
      let empty = [];
      for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (!board[r][c]) empty.push({r,c});
      if (empty.length) {
        const pos = empty[Math.floor(Math.random()*empty.length)];
        board[pos.r][pos.c] = target;
      }
    }
  }
  board[to.r][to.c] = moving;
  board[from.r][from.c] = null;
  // Pawn promotion
  if (moving[1] === 'P' && (to.r === 0 || to.r === 7)) board[to.r][to.c] = turn+'Q';
  // Check for checkmate (simple: if king is captured)
  if (!findKing('w')) { setInfo('Black wins!'); disableBoard(); return; }
  if (!findKing('b')) { setInfo('White wins!'); disableBoard(); return; }
  turn = (turn === 'w') ? 'b' : 'w';
  setInfo((turn === 'w' ? "White" : "Black") + "'s turn");
}

function findKing(color) {
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (board[r][c] === color+'K') return true;
  return false;
}

function setInfo(msg) {
  document.getElementById('info').textContent = msg;
}

function disableBoard() {
  document.getElementById('chessboard').onclick = null;
}

document.getElementById('restart').onclick = startGame;
window.onload = startGame;
