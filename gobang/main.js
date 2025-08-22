class Gobang {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.size = 15;
        this.cellSize = 40;
        this.board = [];
        this.currentPlayer = 'black';
        this.moveHistory = [];
        this.gameOver = false;
        this.initBoard();
        this.setupEvents();
        this.drawBoard();
        this.updateDisplay();
    }
    initBoard() {
        this.board = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        this.currentPlayer = 'black';
        this.moveHistory = [];
        this.gameOver = false;
    }
    setupEvents() {
        this.canvas.addEventListener('click', e => {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / this.cellSize);
            const y = Math.round((e.clientY - rect.top) / this.cellSize);
            this.handleClick(x, y);
        });
        this.canvas.addEventListener('touchstart', e => {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = Math.round((touch.clientX - rect.left) / this.cellSize);
            const y = Math.round((touch.clientY - rect.top) / this.cellSize);
            this.handleClick(x, y);
        });
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('new-game-overlay').addEventListener('click', () => { this.newGame(); this.hideOverlay(); });
        document.getElementById('close-overlay').addEventListener('click', () => this.hideOverlay());
    }
    handleClick(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.board[y][x]) return;
        this.board[y][x] = this.currentPlayer;
        this.moveHistory.push({ x, y, player: this.currentPlayer });
        if (this.checkWin(x, y, this.currentPlayer)) {
            this.gameOver = true;
            this.showOverlay(`${this.currentPlayer === 'black' ? 'Black ●' : 'White ○'} wins!`);
        } else {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        }
        this.drawBoard();
        this.updateDisplay();
    }
    checkWin(x, y, player) {
        const dirs = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 }
        ];
        for (let { dx, dy } of dirs) {
            let count = 1;
            for (let d = 1; d < 5; d++) {
                let nx = x + dx * d, ny = y + dy * d;
                if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size || this.board[ny][nx] !== player) break;
                count++;
            }
            for (let d = 1; d < 5; d++) {
                let nx = x - dx * d, ny = y - dy * d;
                if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size || this.board[ny][nx] !== player) break;
                count++;
            }
            if (count >= 5) return true;
        }
        return false;
    }
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw grid
        this.ctx.strokeStyle = '#232526';
        for (let i = 0; i < this.size; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize, this.cellSize * (i + 1));
            this.ctx.lineTo(this.cellSize * this.size, this.cellSize * (i + 1));
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize * (i + 1), this.cellSize);
            this.ctx.lineTo(this.cellSize * (i + 1), this.cellSize * this.size);
            this.ctx.stroke();
        }
        // Draw pieces
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x]) {
                    this.ctx.beginPath();
                    this.ctx.arc((x + 1) * this.cellSize, (y + 1) * this.cellSize, 15, 0, Math.PI * 2);
                    this.ctx.fillStyle = this.board[y][x] === 'black' ? '#232526' : '#fff';
                    this.ctx.strokeStyle = '#232526';
                    this.ctx.lineWidth = 2;
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }
        }
    }
    updateDisplay() {
        const playerElement = document.getElementById('current-player');
        playerElement.textContent = this.currentPlayer === 'black' ? 'Black ●' : 'White ○';
        playerElement.className = `player-name ${this.currentPlayer}`;
        // Move history
        const movesElement = document.getElementById('moves-list');
        movesElement.innerHTML = '';
        this.moveHistory.forEach((move, idx) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-item';
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${idx + 1}.`;
            const moveText = document.createElement('span');
            moveText.textContent = `${move.player === 'black' ? '●' : '○'} (${move.x + 1},${move.y + 1})`;
            moveElement.appendChild(moveNumber);
            moveElement.appendChild(moveText);
            movesElement.appendChild(moveElement);
        });
        movesElement.scrollTop = movesElement.scrollHeight;
    }
    newGame() {
        this.initBoard();
        this.drawBoard();
        this.updateDisplay();
        this.hideOverlay();
    }
    showOverlay(msg) {
        document.getElementById('overlay-title').textContent = 'Game Over!';
        document.getElementById('overlay-message').textContent = msg;
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
    }
}
window.addEventListener('load', () => {
    new Gobang();
});
