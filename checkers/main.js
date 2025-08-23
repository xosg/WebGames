// Simple Checkers (Draughts) - 2 players, no AI
const SIZE = 8;
let board, turn, selected, moves, info;

function startGame() {
  board = Array.from({length:SIZE}, (_,r)=>Array(SIZE).fill(null));
  for(let r=0;r<3;r++) for(let c=0;c<SIZE;c++) if((r+c)%2) board[r][c] = 'b';
  for(let r=5;r<8;r++) for(let c=0;c<SIZE;c++) if((r+c)%2) board[r][c] = 'r';
  turn = 'r';
  selected = null;
  moves = [];
  info = document.getElementById('info');
  render();
  setInfo("Red's turn");
}

function render() {
  const boardDiv = document.getElementById('checkers-board');
  boardDiv.innerHTML = '';
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
    const sq = document.createElement('div');
    sq.className = 'square ' + ((r+c)%2 ? 'dark' : 'light');
    if(selected && selected.r===r && selected.c===c) sq.classList.add('selected');
    if(moves.some(m=>m.r===r&&m.c===c)) sq.classList.add('move');
    sq.onclick = ()=>onSquareClick(r,c);
    if(board[r][c]) {
      const piece = document.createElement('div');
      piece.className = 'piece ' + (board[r][c][0]==='r'?'red':'black') + (board[r][c][1]==='k'?' king':'');
      piece.title = board[r][c][1]==='k'?'King':'';
      sq.appendChild(piece);
    }
    boardDiv.appendChild(sq);
  }
}

function onSquareClick(r,c) {
  if(board[r][c] && board[r][c][0]===turn) {
    selected = {r,c};
    moves = getMoves(r,c);
    render();
    return;
  }
  if(selected && moves.some(m=>m.r===r&&m.c===c)) {
    movePiece(selected.r,selected.c,r,c);
    selected = null;
    moves = [];
    render();
    return;
  }
  selected = null;
  moves = [];
  render();
}

function getMoves(r,c) {
  const piece = board[r][c];
  const dirs = [];
  if(piece[0]==='r'||piece[1]==='k') dirs.push([-1,-1],[-1,1]);
  if(piece[0]==='b'||piece[1]==='k') dirs.push([1,-1],[1,1]);
  let result = [];
  for(const [dr,dc] of dirs) {
    let nr=r+dr,nc=c+dc;
    if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&!board[nr][nc]) result.push({r:nr,c:nc});
    // Capture
    let er=r+dr,ec=c+dc,cr=r+2*dr,cc=c+2*dc;
    if(er>=0&&er<SIZE&&ec>=0&&ec<SIZE&&board[er][ec]&&board[er][ec][0]!==turn&&cr>=0&&cr<SIZE&&cc>=0&&cc<SIZE&&!board[cr][cc]) result.push({r:cr,c:cc,capture:{r:er,c:ec}});
  }
  return result;
}

function movePiece(fr,fc,tr,tc) {
  const piece = board[fr][fc];
  board[fr][fc]=null;
  board[tr][tc]=piece;
  // King
  if(piece==='r'&&tr===0) board[tr][tc]='rk';
  if(piece==='b'&&tr===SIZE-1) board[tr][tc]='bk';
  // Capture
  const move = moves.find(m=>m.r===tr&&m.c===tc);
  if(move&&move.capture) board[move.capture.r][move.capture.c]=null;
  // Multi-jump
  if(move&&move.capture&&getMoves(tr,tc).some(m=>m.capture)) {
    selected={r:tr,c:tc};
    moves=getMoves(tr,tc);
    render();
    return;
  }
  turn = turn==='r'?'b':'r';
  setInfo((turn==='r'?'Red':'Black')+"'s turn");
  // Win check
  if(!board.flat().some(p=>p&&p[0]===turn)) setInfo((turn==='r'?'Black':'Red')+' wins!');
}

function setInfo(msg) { info.textContent = msg; }

window.onload = startGame;
