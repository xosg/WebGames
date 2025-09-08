// Tooltip element
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

// Simple Nine Men's Morris - 2 players, no AI
// Board points and adjacency
const POINTS = [
  [0,0],[0,3],[0,6], [1,1],[1,3],[1,5], [2,2],[2,3],[2,4],
  [3,0],[3,1],[3,2],[3,4],[3,5],[3,6],
  [4,2],[4,3],[4,4], [5,1],[5,3],[5,5], [6,0],[6,3],[6,6]
];
const ADJ = [
  [1,9],[0,2,4],[1,14], [4,10],[1,3,5,7],[4,13], [7,11],[4,6,8],[7,12],
  [0,10,21],[3,9,11],[7,10,15],[8,13,17],[5,12,14],[2,13,23],
  [11,16],[15,17,19],[8,16,18],[12,17,20],[17,19,21],[15,18,23],[9,18,22],[21,23],[14,19,22]
];
let board, turn, phase, selected, toPlace, info, removed;
let canvas;

function startGame() {
  board = Array(24).fill(null);
  turn = 'w';
  phase = 1;
  selected = null;
  toPlace = {w:9, b:9};
  removed = false;
  info = document.getElementById('info');
    canvas = document.getElementById('morris-board');
  render();
  setInfo("White's turn: Place a piece");
}

function render() {
  // Add mousemove for tooltips
  if (!canvas._tooltipSet) {
    canvas.addEventListener('mousemove', onBoardHover);
    canvas.addEventListener('mouseleave', ()=>{ tooltip.style.display='none'; canvas.style.cursor='default'; });
    canvas._tooltipSet = true;
  }
function onBoardHover(e) {
  const x = e.offsetX;
  const y = e.offsetY;
  let found = false;
  for(let i=0;i<24;i++) {
    let [r,c]=POINTS[i];
    let px=28+c*((400-56)/6), py=28+r*((400-56)/6);
    if(Math.hypot(x-px, y-py)<16) {
      found = true;
      let msg = '';
      if(phase===1) {
        if(!board[i]) msg = 'Click to place your piece here';
        else msg = 'Occupied';
      } else if(phase===2||phase===3) {
        if(selected===null && board[i]===turn) msg = 'Click to select this piece';
        else if(selected!==null && i===selected) msg = 'Click a destination to move';
        else if(selected!==null && !board[i] && (phase===3 || isAdjacent(selected,i))) msg = 'Click to move here';
        else if(board[i] && board[i]!==turn) msg = 'Opponent piece';
        else msg = '';
      }
      if(msg) {
        tooltip.textContent = msg;
        tooltip.style.left = (e.clientX+12)+'px';
        tooltip.style.top = (e.clientY-8)+'px';
        tooltip.style.display = 'block';
        canvas.style.cursor = (msg.startsWith('Click')) ? 'pointer' : 'default';
      } else {
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
      }
      break;
    }
  }
  if (!found) {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  }
}
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,400,400);
  // Draw board lines
  ctx.strokeStyle = '#b8884b';
  ctx.lineWidth = 3;
  for(let d=0;d<3;d++) {
    ctx.strokeRect(40+d*60,40+d*60,320-d*120,320-d*120);
  }
  ctx.beginPath(); ctx.moveTo(200,40); ctx.lineTo(200,360); ctx.moveTo(40,200); ctx.lineTo(360,200); ctx.stroke();
  // Draw points and pieces
  // Adjust margins so all points are visible
  const margin = 28;
  const cell = (400 - 2 * margin) / 6;
  for(let i=0;i<24;i++) {
    let [r,c]=POINTS[i];
    let x=margin+c*cell, y=margin+r*cell;
    // Draw point
    ctx.beginPath();
    ctx.arc(x,y,12,0,2*Math.PI);
    ctx.fillStyle = '#ffeec2';
    ctx.fill();
    ctx.strokeStyle = '#b8884b';
    ctx.stroke();
    // Draw piece if present
    if(board[i]==='w'||board[i]==='b') {
      ctx.beginPath();
      ctx.arc(x,y,10,0,2*Math.PI);
      ctx.fillStyle = board[i]==='w'?'#fff':'#222';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = board[i]==='w'?'#b8884b':'#fffbe7';
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    // Highlight selected
    if(selected===i) {
      ctx.lineWidth=3; ctx.strokeStyle='#f7971e';
      ctx.beginPath(); ctx.arc(x,y,14,0,2*Math.PI); ctx.stroke(); ctx.lineWidth=1;
    }
  }
  // Set click handler only once
  if (!canvas._handlerSet) {
    canvas.onclick = onBoardClick;
    canvas._handlerSet = true;
  }
}

function onBoardClick(e) {
  // Use offsetX/offsetY for reliable canvas coordinates
  const x = e.offsetX;
  const y = e.offsetY;
  let clicked = -1;
  // Match the margin/cell calculation in render()
  const margin = 28;
  const cell = (400 - 2 * margin) / 6;
  for(let i=0;i<24;i++) {
    let [r,c]=POINTS[i];
    let px=margin+c*cell, py=margin+r*cell;
    if(Math.hypot(x-px, y-py)<16) { clicked=i; break; }
  }
  if(clicked===-1) return;
  if(removed) {
    if(board[clicked]===opponent()) {
      board[clicked]=null; removed=false;
      setInfo((turn==='w'?'White':'Black')+"'s turn: "+(phase===1?"Place a piece":"Select a piece"));
      render();
    }
    return;
  }
  if(phase===1) {
    if(!board[clicked]) {
      board[clicked]=turn;
      toPlace[turn]--;
      if(isMill(clicked,turn)) { setInfo('Mill! Remove an opponent piece.'); removed=true; render(); return; }
      if(--toPlace[turn]===0) { phase=2; setInfo((turn==='w'?'White':'Black')+"'s turn: Select a piece"); }
      else setInfo((turn==='w'?'White':'Black')+"'s turn: Place a piece");
      turn=opponent();
      render();
    }
  } else if(phase===2||phase===3) {
    if(selected===null) {
      if(board[clicked]===turn) { selected=clicked; render(); }
    } else {
      // In phase 3 (flying), allow moving to any empty point
      if(!board[clicked] && (phase===3 || isAdjacent(selected,clicked))) {
        board[clicked]=turn; board[selected]=null;
        if(isMill(clicked,turn)) { setInfo('Mill! Remove an opponent piece.'); removed=true; selected=null; render(); return; }
        selected=null;
        setInfo((turn==='w'?'White':'Black')+"'s turn: Select a piece");
        turn=opponent();
        render();
      } else if(board[clicked]===turn) { selected=clicked; render(); }
    }
  }
}

function isAdjacent(a,b) { return ADJ[a].includes(b); }
function opponent() { return turn==='w'?'b':'w'; }
function isMill(pos,player) {
  // All possible mills
  const mills = [
    [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23],
    [0,9,21],[3,10,18],[6,11,15],[1,4,7],[16,19,22],[8,12,17],[5,13,20],[2,14,23]
  ];
  return mills.some(m=>m.includes(pos)&&m.every(i=>board[i]===player));
}
function setInfo(msg) { info.textContent = msg; }
function setInfo(msg) {
  if (!info) info = document.getElementById('info');
  info.innerHTML = `<b>${turn==='w'?'White':'Black'}</b>'s turn: <span style="color:#f7971e">${phase===1?'Place a piece':phase===2?'Move a piece':'Fly a piece'}</span><br>${msg}`;
}

// Add restart button handler

window.onload = function() {
  startGame();
  document.getElementById('restart').onclick = startGame;
};
