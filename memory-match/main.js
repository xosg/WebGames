// Memory Match Game
// Author: xosg

const boardEl = document.getElementById('game-board');
const movesSpan = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');

const symbols = ['🍎','🍌','🍇','🍉','🍒','🍋','🍓','🍑'];
let cards, flipped, matched, moves, lock;

function initGame() {
    cards = shuffle([...symbols, ...symbols]).map((symbol, i) => ({symbol, id: i, flipped: false, matched: false}));
    flipped = [];
    matched = 0;
    moves = 0;
    lock = false;
    movesSpan.textContent = moves;
    renderBoard();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderBoard() {
    boardEl.innerHTML = '';
    cards.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
        el.textContent = card.flipped || card.matched ? card.symbol : '';
        el.addEventListener('click', () => handleCardClick(idx));
        boardEl.appendChild(el);
    });
}

function handleCardClick(idx) {
    if (lock || cards[idx].flipped || cards[idx].matched) return;
    cards[idx].flipped = true;
    flipped.push(idx);
    renderBoard();
    if (flipped.length === 2) {
        moves++;
        movesSpan.textContent = moves;
        lock = true;
        setTimeout(() => {
            const [i, j] = flipped;
            if (cards[i].symbol === cards[j].symbol) {
                cards[i].matched = cards[j].matched = true;
                matched += 2;
            } else {
                cards[i].flipped = cards[j].flipped = false;
            }
            flipped = [];
            lock = false;
            renderBoard();
            if (matched === cards.length) {
                setTimeout(() => alert('You win! Moves: ' + moves), 200);
            }
        }, 700);
    }
}

restartBtn.addEventListener('click', initGame);

initGame();
