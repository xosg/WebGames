// Solitaire (Klondike)
// Author: xosg
// Simple, single-deck solitaire for web

const canvas = document.getElementById('solitaire-canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');

const SUITS = ['♠','♥','♦','♣'];
const COLORS = {'♠':'black','♣':'black','♥':'red','♦':'red'};
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const CARD_W = 48, CARD_H = 68, CARD_GAP = 12, PILE_GAP = 24, TABLEAU_GAP = 22;

let deck, stock, waste, foundations, tableau, dragging, dragCards, dragFrom, dragOffset;

function makeDeck() {
  let d = [];
  for (let s of SUITS) for (let r of RANKS) d.push({suit:s, rank:r, color:COLORS[s], faceUp:false});
  for (let i = d.length-1; i > 0; i--) {
    let j = Math.floor(Math.random()*(i+1));
    [d[i],d[j]] = [d[j],d[i]];
  }
  return d;
}

function deal() {
  deck = makeDeck();
  stock = [];
  waste = [];
  foundations = [[],[],[],[]];
  tableau = [[],[],[],[],[],[],[]];
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      let card = deck[idx++];
      card.faceUp = (row === col);
      tableau[col].push(card);
    }
  }
  while (idx < 52) stock.push(deck[idx++]);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.font = '16px Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Draw stock
  drawCardBack(PILE_GAP,PILE_GAP,stock.length>0);
  // Draw waste
  if (waste.length>0) drawCard(waste[waste.length-1],PILE_GAP*2+CARD_W,PILE_GAP,true);
  // Draw foundations
  for (let i=0;i<4;i++) {
    let x = canvas.width - (4-i)*(CARD_W+PILE_GAP);
    if (foundations[i].length>0) drawCard(foundations[i][foundations[i].length-1],x,PILE_GAP,true);
    else drawCardBack(x,PILE_GAP,false);
  }
  // Draw tableau
  for (let col=0;col<7;col++) {
    let pile = tableau[col];
    let x = PILE_GAP + col*(CARD_W+PILE_GAP);
    for (let row=0;row<pile.length;row++) {
      let y = CARD_H+PILE_GAP*2 + row*TABLEAU_GAP;
      let card = pile[row];
      if (dragging && dragFrom && dragFrom.type==='tableau' && dragFrom.idx===col && dragFrom.row<=row) continue;
      drawCard(card,x,y,card.faceUp);
    }
  }
  // Draw dragging cards
  if (dragging && dragCards) {
    for (let i=0;i<dragCards.length;i++) {
      let card = dragCards[i];
      let x = dragging.x + dragOffset.x;
      let y = dragging.y + dragOffset.y + i*TABLEAU_GAP;
      drawCard(card,x,y,card.faceUp,true);
    }
  }
}

function drawCard(card,x,y,faceUp,shadow) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = '#888';
    ctx.shadowBlur = 8;
  }
  ctx.beginPath();
  ctx.rect(x,y,CARD_W,CARD_H);
  ctx.fillStyle = faceUp ? '#fff' : '#e0e0e0';
  ctx.fill();
  ctx.strokeStyle = '#185a9d';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (faceUp) {
    ctx.fillStyle = card.color==='red'?'#d32f2f':'#222';
    ctx.font = 'bold 18px Segoe UI, Arial';
    ctx.fillText(card.rank,x+CARD_W/2,y+20);
    ctx.font = '16px Segoe UI, Arial';
    ctx.fillText(card.suit,x+CARD_W/2,y+CARD_H-18);
  }
  ctx.restore();
}
function drawCardBack(x,y,show) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x,y,CARD_W,CARD_H);
  ctx.fillStyle = show ? '#43cea2' : '#e0e0e0';
  ctx.fill();
  ctx.strokeStyle = '#185a9d';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (show) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Segoe UI, Arial';
    ctx.fillText('🂠',x+CARD_W/2,y+CARD_H/2);
  }
  ctx.restore();
}

function getCardAt(x,y) {
  // Stock
  if (x>=PILE_GAP && x<=PILE_GAP+CARD_W && y>=PILE_GAP && y<=PILE_GAP+CARD_H) return {type:'stock'};
  // Waste
  if (x>=PILE_GAP*2+CARD_W && x<=PILE_GAP*2+CARD_W*2 && y>=PILE_GAP && y<=PILE_GAP+CARD_H) return {type:'waste'};
  // Foundations
  for (let i=0;i<4;i++) {
    let fx = canvas.width - (4-i)*(CARD_W+PILE_GAP);
    if (x>=fx && x<=fx+CARD_W && y>=PILE_GAP && y<=PILE_GAP+CARD_H) return {type:'foundation',idx:i};
  }
  // Tableau
  for (let col=0;col<7;col++) {
    let tx = PILE_GAP + col*(CARD_W+PILE_GAP);
    let pile = tableau[col];
    for (let row=pile.length-1;row>=0;row--) {
      let ty = CARD_H+PILE_GAP*2 + row*TABLEAU_GAP;
      if (x>=tx && x<=tx+CARD_W && y>=ty && y<=ty+CARD_H) {
        if (!pile[row].faceUp) return null;
        return {type:'tableau',idx:col,row:row};
      }
    }
  }
  return null;
}

function onMouseDown(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left, y = e.clientY - rect.top;
  let card = getCardAt(x,y);
  if (!card) return;
  if (card.type==='stock' && stock.length>0) {
    // Draw from stock
    let c = stock.pop();
    c.faceUp = true;
    waste.push(c);
    draw();
    return;
  }
  if (card.type==='waste' && waste.length>0) {
    dragging = {x:x-CARD_W/2,y:y-CARD_H/2};
    dragCards = [waste[waste.length-1]];
    dragFrom = {type:'waste'};
    dragOffset = {x:0,y:0};
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mouseup',onMouseUp);
    draw();
    return;
  }
  if (card.type==='tableau') {
    let pile = tableau[card.idx];
    let cards = pile.slice(card.row);
    dragging = {x:x-CARD_W/2,y:y-CARD_H/2};
    dragCards = cards;
    dragFrom = {type:'tableau',idx:card.idx,row:card.row};
    dragOffset = {x:0,y:0};
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mouseup',onMouseUp);
    draw();
    return;
  }
}
function onMouseMove(e) {
  let rect = canvas.getBoundingClientRect();
  dragging.x = e.clientX - rect.left - CARD_W/2;
  dragging.y = e.clientY - rect.top - CARD_H/2;
  draw();
}
function onMouseUp(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left, y = e.clientY - rect.top;
  let target = getCardAt(x,y);
  if (dragFrom.type==='waste') {
    if (target && target.type==='foundation') {
      let card = waste[waste.length-1];
      if (canMoveToFoundation(card,target.idx)) {
        foundations[target.idx].push(waste.pop());
      }
    } else if (target && target.type==='tableau') {
      let card = waste[waste.length-1];
      if (canMoveToTableau(card,target.idx)) {
        tableau[target.idx].push(waste.pop());
      }
    }
  } else if (dragFrom.type==='tableau') {
    let cards = tableau[dragFrom.idx].slice(dragFrom.row);
    if (target && target.type==='foundation' && cards.length===1) {
      let card = cards[0];
      if (canMoveToFoundation(card,target.idx)) {
        foundations[target.idx].push(tableau[dragFrom.idx].pop());
      }
    } else if (target && target.type==='tableau') {
      let dest = tableau[target.idx];
      let card = cards[0];
      if (canMoveToTableau(card,target.idx)) {
        for (let c of cards) tableau[target.idx].push(c);
        tableau[dragFrom.idx].splice(dragFrom.row);
      }
    }
    // Flip next card if needed
    let pile = tableau[dragFrom.idx];
    if (pile.length>0 && !pile[pile.length-1].faceUp) pile[pile.length-1].faceUp = true;
  }
  dragging = null; dragCards = null; dragFrom = null; dragOffset = null;
  canvas.removeEventListener('mousemove',onMouseMove);
  canvas.removeEventListener('mouseup',onMouseUp);
  draw();
  checkWin();
}

function canMoveToFoundation(card,idx) {
  let pile = foundations[idx];
  if (pile.length===0) return card.rank==='A';
  let top = pile[pile.length-1];
  return card.suit===top.suit && RANKS.indexOf(card.rank)===RANKS.indexOf(top.rank)+1;
}
function canMoveToTableau(card,idx) {
  let pile = tableau[idx];
  if (pile.length===0) return card.rank==='K';
  let top = pile[pile.length-1];
  return card.color!==top.color && RANKS.indexOf(card.rank)===RANKS.indexOf(top.rank)-1;
}

function checkWin() {
  if (foundations.every(f=>f.length===13)) setTimeout(()=>alert('You win!'),200);
}

function onRestart() {
  deal();
  draw();
}

canvas.addEventListener('mousedown',onMouseDown);
restartBtn.addEventListener('click',onRestart);

window.addEventListener('resize',draw);

deal();
draw();
