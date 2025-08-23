// Simple Mancala (Kalah) - 2 players, no AI
let board, turn, selected, info;

function startGame() {
  // 6 pits per player, 4 stones each, 2 stores
  board = [
    Array(6).fill(4), // Player 0 pits
    Array(6).fill(4), // Player 1 pits
    [0, 0] // Stores: [player0, player1]
  ];
  turn = 0;
  selected = null;
  info = document.getElementById('info');
  render();
  setInfo("Player 1's turn");
}

function render() {
  const boardDiv = document.getElementById('mancala-board');
  boardDiv.innerHTML = '';
  // Top row (Player 2)
  const top = document.createElement('div');
  top.className = 'row';
  for(let i=5;i>=0;i--) top.appendChild(renderPit(1,i));
  // Bottom row (Player 1)
  const bottom = document.createElement('div');
  bottom.className = 'row';
  for(let i=0;i<6;i++) bottom.appendChild(renderPit(0,i));
  // Stores
  const leftStore = renderStore(1);
  const rightStore = renderStore(0);
  // Layout
  const layout = document.createElement('div');
  layout.style.display = 'flex';
  layout.appendChild(leftStore);
  const center = document.createElement('div');
  center.appendChild(top);
  center.appendChild(bottom);
  layout.appendChild(center);
  layout.appendChild(rightStore);
  boardDiv.appendChild(layout);
}

function renderPit(player, idx) {
  const pit = document.createElement('div');
  pit.className = 'pit' + (turn===player && board[player][idx]>0 ? '' : ' disabled');
  pit.onclick = ()=>onPitClick(player, idx);
  for(let s=0;s<board[player][idx];s++) {
    const stone = document.createElement('div');
    stone.className = 'stone';
    pit.appendChild(stone);
  }
  return pit;
}

function renderStore(player) {
  const store = document.createElement('div');
  store.className = 'store';
  store.textContent = board[2][player];
  return store;
}

function onPitClick(player, idx) {
  if(player!==turn || board[player][idx]===0) return;
  let stones = board[player][idx];
  board[player][idx]=0;
  let pos = idx, side = player;
  while(stones>0) {
    pos++;
    if(pos===6) {
      if(side===turn) {
        board[2][turn]++;
        stones--;
        if(stones===0) { setInfo('Extra turn!'); render(); return; }
      }
      pos=0; side=1-side;
    }
    if(stones>0 && side<2) {
      board[side][pos]++;
      stones--;
      if(stones===0 && side===turn && board[side][pos]===1 && board[1-side][5-pos]>0) {
        // Capture
        board[2][turn]+=board[1-side][5-pos]+1;
        board[side][pos]=0;
        board[1-side][5-pos]=0;
        setInfo('Captured!');
      }
    }
  }
  // Check end
  if(board[0].every(x=>x===0)||board[1].every(x=>x===0)) {
    for(let i=0;i<6;i++) board[2][0]+=board[0][i],board[0][i]=0;
    for(let i=0;i<6;i++) board[2][1]+=board[1][i],board[1][i]=0;
    render();
    if(board[2][0]>board[2][1]) setInfo('Player 1 wins!');
    else if(board[2][1]>board[2][0]) setInfo('Player 2 wins!');
    else setInfo('Draw!');
    return;
  }
  turn=1-turn;
  render();
  setInfo("Player "+(turn+1)+"'s turn");
}

function setInfo(msg) { info.textContent = msg; }

window.onload = startGame;
