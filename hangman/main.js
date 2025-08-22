// Hangman
// Author: xosg

const words = [
    'JAVASCRIPT','PYTHON','COMPUTER','PROGRAM','HANGMAN','PUZZLE','BROWSER','KEYBOARD','MONITOR','VARIABLE','FUNCTION','OBJECT','STRING','NUMBER','BOOLEAN','ARRAY','CANVAS','SCRIPT','EDITOR','SOURCE'
];
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const wordEl = document.getElementById('word');
const lettersEl = document.getElementById('letters');
const wrongSpan = document.getElementById('wrong');
const restartBtn = document.getElementById('restart-btn');

let word, guessed, wrong, maxWrong;

function initGame() {
    word = words[Math.floor(Math.random() * words.length)];
    guessed = [];
    wrong = 0;
    maxWrong = 6;
    wrongSpan.textContent = wrong;
    drawHangman();
    renderWord();
    renderLetters();
}

function renderWord() {
    wordEl.textContent = word.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
}

function renderLetters() {
    lettersEl.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const ch = String.fromCharCode(i);
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = ch;
        btn.disabled = guessed.includes(ch) || isGameOver();
        btn.addEventListener('click', () => handleGuess(ch));
        lettersEl.appendChild(btn);
    }
}

function handleGuess(ch) {
    if (guessed.includes(ch) || isGameOver()) return;
    guessed.push(ch);
    if (!word.includes(ch)) {
        wrong++;
        wrongSpan.textContent = wrong;
        drawHangman();
        if (wrong >= maxWrong) setTimeout(() => alert('Game Over! The word was: ' + word), 200);
    } else {
        renderWord();
        if (word.split('').every(l => guessed.includes(l))) setTimeout(() => alert('You win!'), 200);
    }
    renderLetters();
}

function isGameOver() {
    return wrong >= maxWrong || word.split('').every(l => guessed.includes(l));
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f7971e';
    ctx.lineWidth = 3;
    // Base
    ctx.beginPath(); ctx.moveTo(20,200); ctx.lineTo(200,200); ctx.stroke();
    // Pole
    ctx.beginPath(); ctx.moveTo(60,200); ctx.lineTo(60,30); ctx.lineTo(140,30); ctx.lineTo(140,50); ctx.stroke();
    // Head
    if (wrong > 0) { ctx.beginPath(); ctx.arc(140,70,20,0,2*Math.PI); ctx.stroke(); }
    // Body
    if (wrong > 1) { ctx.beginPath(); ctx.moveTo(140,90); ctx.lineTo(140,140); ctx.stroke(); }
    // Left arm
    if (wrong > 2) { ctx.beginPath(); ctx.moveTo(140,100); ctx.lineTo(110,120); ctx.stroke(); }
    // Right arm
    if (wrong > 3) { ctx.beginPath(); ctx.moveTo(140,100); ctx.lineTo(170,120); ctx.stroke(); }
    // Left leg
    if (wrong > 4) { ctx.beginPath(); ctx.moveTo(140,140); ctx.lineTo(120,180); ctx.stroke(); }
    // Right leg
    if (wrong > 5) { ctx.beginPath(); ctx.moveTo(140,140); ctx.lineTo(160,180); ctx.stroke(); }
}

restartBtn.addEventListener('click', initGame);

initGame();
