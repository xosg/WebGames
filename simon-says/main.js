// Simon Says
// Author: xosg

const colors = ['green', 'red', 'yellow', 'blue'];
const colorEls = colors.map(id => document.getElementById(id));
const levelSpan = document.getElementById('level');
const startBtn = document.getElementById('start-btn');

let sequence = [], userStep = 0, level = 1, playing = false, lock = false;

function playSound(color) {
    // Simple beep using Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 220 + colors.indexOf(color) * 110;
    o.connect(g); g.connect(ctx.destination);
    g.gain.value = 0.12;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 180);
}

function flash(color) {
    const el = document.getElementById(color);
    el.classList.add('active');
    playSound(color);
    setTimeout(() => el.classList.remove('active'), 220);
}

function nextLevel() {
    level++;
    levelSpan.textContent = level;
    sequence.push(colors[Math.floor(Math.random() * 4)]);
    userStep = 0;
    playSequence();
}

function playSequence() {
    lock = true;
    let i = 0;
    function step() {
        if (i < sequence.length) {
            flash(sequence[i]);
            setTimeout(step, 500);
            i++;
        } else {
            lock = false;
        }
    }
    setTimeout(step, 600);
}

function startGame() {
    sequence = [colors[Math.floor(Math.random() * 4)]];
    userStep = 0;
    level = 1;
    levelSpan.textContent = level;
    playing = true;
    playSequence();
}

colorEls.forEach((el, idx) => {
    el.addEventListener('click', () => {
        if (!playing || lock) return;
        const color = colors[idx];
        flash(color);
        if (color === sequence[userStep]) {
            userStep++;
            if (userStep === sequence.length) {
                setTimeout(nextLevel, 600);
            }
        } else {
            playing = false;
            setTimeout(() => {
                alert('Game Over! You reached level ' + level);
            }, 300);
        }
    });
});

startBtn.addEventListener('click', startGame);
