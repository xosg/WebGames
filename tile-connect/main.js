// Tile Connect Game
// Author: xosg

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-message');
const nextLevelBtn = document.getElementById('next-level');
const restartBtn = document.getElementById('restart-game');

// Game settings
const tileTypes = 12; // Number of different tile images
const tileColors = [
    '#f7971e', '#ffd200', '#ff6f61', '#6ec6ff', '#81c784', '#ba68c8',
    '#ffb74d', '#4dd0e1', '#e57373', '#aed581', '#9575cd', '#ff8a65'
];
const boardRows = 10;
const boardCols = 8;
const tileSize = 48;
const tileGap = 6;
const boardOffsetX = 24;
const boardOffsetY = 24;
const boardW = boardCols * (tileSize + tileGap) + tileGap;
const boardH = boardRows * (tileSize + tileGap) + tileGap;

// Game state
let board = [];
let selected = [];
let level = 1;
let score = 0;
let timer = null;
let animPath = null;

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function createBoard(rows, cols, types) {
    // Fill with pairs
    let total = rows * cols;
    if (total % 2 !== 0) {
        // Make total even by removing one tile (set last cell to null later)
        total -= 1;
    }
    let pairs = [];
    for (let i = 0; i < total / 2; i++) {
        let type = i % types;
        pairs.push(type, type);
    }
    shuffle(pairs);
    // Add border (0 = empty)
    let b = [];
    for (let r = 0; r < rows + 2; r++) {
        let row = [];
        for (let c = 0; c < cols + 2; c++) {
            if (r === 0 || c === 0 || r === rows + 1 || c === cols + 1) {
                row.push(-1); // border
            } else {
                let idx = (r - 1) * cols + (c - 1);
                if (idx < pairs.length) {
                    row.push(pairs[idx]);
                } else {
                    row.push(null); // last cell left empty if odd
                }
            }
        }
        b.push(row);
    }
    return b;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 1; r <= boardRows; r++) {
        if (!board[r]) continue;
        for (let c = 1; c <= boardCols; c++) {
            if (!board[r] || typeof board[r][c] === 'undefined') continue;
            let val = board[r][c];
            let x = boardOffsetX + (c - 1) * (tileSize + tileGap);
            let y = boardOffsetY + (r - 1) * (tileSize + tileGap);
            if (val !== -1 && val !== null) {
                ctx.save();
                ctx.fillStyle = tileColors[val % tileColors.length];
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(x, y, tileSize, tileSize, 12);
                ctx.fill();
                ctx.stroke();
                ctx.font = 'bold 1.5rem Segoe UI';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String.fromCharCode(65 + val), x + tileSize / 2, y + tileSize / 2);
                ctx.restore();
            }
        }
    }
    // Draw selection
    if (selected.length > 0) {
        selected.forEach(([r, c]) => {
            let x = boardOffsetX + (c - 1) * (tileSize + tileGap);
            let y = boardOffsetY + (r - 1) * (tileSize + tileGap);
            ctx.save();
            ctx.strokeStyle = '#ff6f61';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, tileSize + 4, tileSize + 4, 14);
            ctx.stroke();
            ctx.restore();
        });
    }
    // Draw path animation
    if (animPath) {
        ctx.save();
        ctx.strokeStyle = '#4dd0e1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let i = 0; i < animPath.length; i++) {
            let [r, c] = animPath[i];
            let x = boardOffsetX + (c - 1) * (tileSize + tileGap) + tileSize / 2;
            let y = boardOffsetY + (r - 1) * (tileSize + tileGap) + tileSize / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }
}

function getTileAt(x, y) {
    let c = Math.floor((x - boardOffsetX) / (tileSize + tileGap)) + 1;
    let r = Math.floor((y - boardOffsetY) / (tileSize + tileGap)) + 1;
    if (
        r >= 1 && r <= boardRows &&
        c >= 1 && c <= boardCols &&
        board[r][c] !== -1 && board[r][c] !== null
    ) {
        return [r, c];
    }
    return null;
}

function isClearLine(r1, c1, r2, c2) {
    if (r1 === r2) {
        let minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
        for (let c = minC + 1; c < maxC; c++) {
            if (board[r1][c] !== null) return false;
        }
        return true;
    }
    if (c1 === c2) {
        let minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
        for (let r = minR + 1; r < maxR; r++) {
            if (board[r][c1] !== null) return false;
        }
        return true;
    }
    return false;
}

function findPath(a, b) {
    // Returns path if can connect a to b with <=3 lines, else null
    let [r1, c1] = a, [r2, c2] = b;
    if (a[0] === b[0] && a[1] === b[1]) return null;
    // 1. Direct line
    if (isClearLine(r1, c1, r2, c2)) {
        return [a, b];
    }
    // 2. One turn
    let turns = [
        [r1, c2],
        [r2, c1]
    ];
    for (let t of turns) {
        if (board[t[0]][t[1]] === null && isClearLine(r1, c1, t[0], t[1]) && isClearLine(t[0], t[1], r2, c2)) {
            return [a, t, b];
        }
    }
    // 3. Two turns
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if ((r === r1 && c === c1) || (r === r2 && c === c2)) continue;
            if (board[r][c] !== null) continue;
            if (
                isClearLine(r1, c1, r, c) &&
                isClearLine(r, c, r2, c2) &&
                (isClearLine(r, c, r2, c2) || isClearLine(r1, c1, r, c))
            ) {
                if (
                    (isClearLine(r1, c1, r, c) &&
                        (isClearLine(r, c, r2, c2) || isClearLine(r, c, r2, c2))) ||
                    (isClearLine(r, c, r2, c2) &&
                        (isClearLine(r1, c1, r, c) || isClearLine(r1, c1, r, c)))
                ) {
                    if (isClearLine(r1, c1, r, c) && isClearLine(r, c, r2, c2)) {
                        return [a, [r, c], b];
                    }
                }
            }
        }
    }
    return null;
}

function canConnect(a, b) {
    if (board[a[0]][a[1]] !== board[b[0]][b[1]]) return null;
    if (board[a[0]][a[1]] === null || board[b[0]][b[1]] === null) return null;
    return findPath(a, b);
}

function isBoardClear() {
    for (let r = 1; r <= boardRows; r++) {
        for (let c = 1; c <= boardCols; c++) {
            if (board[r][c] !== null) return false;
        }
    }
    return true;
}

function handleTileClick(r, c) {
    if (selected.length === 0) {
        selected = [[r, c]];
    } else if (selected.length === 1) {
        let [r0, c0] = selected[0];
        if (r0 === r && c0 === c) {
            selected = [];
        } else {
            let path = canConnect([r0, c0], [r, c]);
            if (path) {
                animPath = path;
                setTimeout(() => {
                    board[r0][c0] = null;
                    board[r][c] = null;
                    selected = [];
                    animPath = null;
                    score += 10 * level;
                    scoreSpan.textContent = score;
                    drawBoard();
                    if (isBoardClear()) {
                        showOverlay('Level Complete!', `You cleared level ${level}!`, true);
                    }
                }, 250);
            } else {
                selected = [[r, c]];
            }
        }
    }
    drawBoard();
}

canvas.addEventListener('click', (e) => {
    if (overlay.classList.contains('hidden')) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let tile = getTileAt(x, y);
        if (tile) {
            handleTileClick(tile[0], tile[1]);
        }
    }
});

function showOverlay(title, msg, nextLevel = false) {
    overlayTitle.textContent = title;
    overlayMsg.textContent = msg;
    overlay.classList.remove('hidden');
    nextLevelBtn.style.display = nextLevel ? 'inline-block' : 'none';
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

function startLevel(lv) {
    level = lv;
    levelSpan.textContent = level;
    let types = Math.min(tileTypes, 4 + Math.floor(level / 2));
    board = createBoard(boardRows, boardCols, types);
    selected = [];
    animPath = null;
    drawBoard();
}

function startGame() {
    score = 0;
    scoreSpan.textContent = score;
    startLevel(1);
    hideOverlay();
}

newGameBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', () => {
    hideOverlay();
    startLevel(level + 1);
});
restartBtn.addEventListener('click', startGame);

// Responsive canvas
function resizeCanvas() {
    let w = Math.min(window.innerWidth - 40, 480);
    let h = Math.round(w * (boardH / boardW));
    canvas.width = w;
    canvas.height = h;
    drawBoard();
}
window.addEventListener('resize', resizeCanvas);

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        else if (!Array.isArray(r)) r = [0, 0, 0, 0];
        this.beginPath();
        this.moveTo(x + r[0], y);
        this.lineTo(x + w - r[1], y);
        this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
        this.lineTo(x + w, y + h - r[2]);
        this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
        this.lineTo(x + r[3], y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
        this.lineTo(x, y + r[0]);
        this.quadraticCurveTo(x, y, x + r[0], y);
        this.closePath();
    };
}

// Initial setup
resizeCanvas();
startGame();
