
// Simple Ludo (2-4 players, playable, no AI)
const COLORS = ['red','green','yellow','blue'];
const STARTS = [0, 13, 26, 39]; // Entry squares for each color
let state = { turn: 0, dice: 0, pieces: [], finished: [0,0,0,0], canRoll: true, waitingMove: false };

function init() {
  state.pieces = Array(4).fill().map(()=>[0,0,0,0]);
  state.finished = [0,0,0,0];
  state.turn = 0;
  state.dice = 0;
  state.canRoll = true;
  state.waitingMove = false;
  drawBoard();
  updateUI();
}

function drawBoard() {
  const canvas = document.getElementById('ludo-board');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,400,400);
  // Board squares
  ctx.strokeStyle = '#b8884b';
  ctx.lineWidth = 2;
  for(let i=0;i<15;i++) for(let j=0;j<15;j++) ctx.strokeRect(i*400/15,j*400/15,400/15,400/15);
  // Home triangles
  ctx.fillStyle = 'red'; ctx.beginPath(); ctx.moveTo(0,0);ctx.lineTo(160,0);ctx.lineTo(0,160);ctx.closePath();ctx.fill();
  ctx.fillStyle = 'green'; ctx.beginPath(); ctx.moveTo(400,0);ctx.lineTo(400,160);ctx.lineTo(240,0);ctx.closePath();ctx.fill();
  ctx.fillStyle = 'yellow'; ctx.beginPath(); ctx.moveTo(400,400);ctx.lineTo(400,240);ctx.lineTo(240,400);ctx.closePath();ctx.fill();
  ctx.fillStyle = 'blue'; ctx.beginPath(); ctx.moveTo(0,400);ctx.lineTo(0,240);ctx.lineTo(160,400);ctx.closePath();ctx.fill();
  // Draw pieces
  drawPieces(ctx);
  // Add click handler for piece movement
  canvas.onclick = onBoardClick;
}


// Store piece hitboxes for mouseover
let pieceHitboxes = [];
function drawPieces(ctx) {
  pieceHitboxes = [];
  for(let p=0;p<4;p++) for(let i=0;i<4;i++) {
    let pos = state.pieces[p][i];
    let xy = getPieceXY(p,pos);
    ctx.beginPath();
    ctx.arc(xy.x,xy.y,12,0,2*Math.PI);
    ctx.fillStyle = COLORS[p];
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
    // Draw piece border if selectable
    if (state.turn === p && state.dice && canMove(p, i)) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f7971e';
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    pieceHitboxes.push({player:p, idx:i, x:xy.x, y:xy.y, canMove: state.turn===p && state.dice && canMove(p,i)});
  }
}

// Tooltip logic
let tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'none';
tooltip.style.background = '#fffbe7';
tooltip.style.border = '1.5px solid #f7971e';
tooltip.style.borderRadius = '7px';
tooltip.style.padding = '4px 10px';
tooltip.style.fontSize = '1em';
tooltip.style.color = '#b8884b';
tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
tooltip.style.zIndex = 1000;
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

document.getElementById('ludo-board').addEventListener('mousemove', function(e) {
  const rect = this.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let found = false;
  for (let hit of pieceHitboxes) {
    if (Math.hypot(x-hit.x, y-hit.y) < 16) {
      found = true;
      if (hit.canMove) {
        tooltip.textContent = 'Click to move this piece';
        this.style.cursor = 'pointer';
      } else if (state.turn === hit.player && state.dice) {
        tooltip.textContent = 'Cannot move this piece';
        this.style.cursor = 'not-allowed';
      } else {
        tooltip.textContent = COLORS[hit.player].charAt(0).toUpperCase()+COLORS[hit.player].slice(1)+"'s piece";
        this.style.cursor = 'default';
      }
      tooltip.style.left = (e.clientX+12)+'px';
      tooltip.style.top = (e.clientY-8)+'px';
      tooltip.style.display = 'block';
      break;
    }
  }
  if (!found) {
    tooltip.style.display = 'none';
    this.style.cursor = state.dice ? 'pointer' : 'default';
  }
});
document.getElementById('ludo-board').addEventListener('mouseleave', function() {
  tooltip.style.display = 'none';
  this.style.cursor = 'default';
});

function getPieceXY(player,pos) {
  // Home: pos=0,1,2,3; Board: pos>=4
  if(pos<4) {
    let base = [[60,60],[100,60],[60,100],[100,100]];
    return {x:base[pos][0]+player*200*(player%2),y:base[pos][1]+Math.floor(player/2)*200};
  }
  // Board: simple circle path for demo
  let angle = ((pos-4)/52)*2*Math.PI - Math.PI/2 + player*Math.PI/2;
  let r = 150;
  return {x:200+r*Math.cos(angle),y:200+r*Math.sin(angle)};
}

function canMove(player, pieceIdx) {
  let pos = state.pieces[player][pieceIdx];
  if (pos < 4) {
    // In base, can only move out on 6
    if (state.dice === 6) {
      // Check if entry square is free
      let entry = STARTS[player];
      for (let p=0;p<4;p++) for (let i=0;i<4;i++) if (state.pieces[p][i] === entry+4) return false;
      return true;
    }
    return false;
  } else {
    // On board, check if move is possible
    let dest = pos + state.dice;
    if (dest > STARTS[player]+51) return false; // Can't go past home
    // Check for collision with own pieces
    for (let i=0;i<4;i++) if (i!==pieceIdx && state.pieces[player][i] === dest) return false;
    return true;
  }
}

function onBoardClick(e) {
  if (!state.dice) return;
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Find clicked piece
  for (let i=0;i<4;i++) {
    let xy = getPieceXY(state.turn, state.pieces[state.turn][i]);
    if (Math.hypot(x-xy.x, y-xy.y) < 16 && canMove(state.turn, i)) {
      movePiece(state.turn, i);
      return;
    }
  }
}

function movePiece(player, pieceIdx) {
  let pos = state.pieces[player][pieceIdx];
  if (pos < 4) {
    // Move out of base
    state.pieces[player][pieceIdx] = STARTS[player]+4;
  } else {
    // Move forward
    let dest = pos + state.dice;
    // Capture opponent
    for (let p=0;p<4;p++) if (p!==player) for (let i=0;i<4;i++) {
      if (state.pieces[p][i] === dest) state.pieces[p][i] = 0; // Send back to base
    }
    state.pieces[player][pieceIdx] = dest;
    // Check for win
    if (dest === STARTS[player]+51) {
      state.finished[player]++;
      if (state.finished[player] === 4) {
        alert(COLORS[player].toUpperCase() + ' wins!');
        init();
        return;
      }
    }
  }
  // Next turn logic
  if (state.dice !== 6) {
    state.turn = (state.turn+1)%4;
  }
  state.dice = 0;
  state.canRoll = true;
  updateUI();
}

document.getElementById('roll').onclick = function() {
  if(!state.canRoll) return;
  state.dice = 1+Math.floor(Math.random()*6);
  state.canRoll = false;
  updateUI();
};

function updateUI() {
  document.getElementById('dice').textContent = state.dice ? '🎲 '+state.dice : '';
  document.getElementById('turn').textContent = 'Player: '+COLORS[state.turn];
  drawBoard();
}

window.onload = init;
