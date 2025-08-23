class GoGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.size = 19;
        this.cellSize = 40;
        this.margin = this.cellSize;
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
            const x = Math.round(((e.clientX - rect.left) - this.margin) / this.cellSize);
            const y = Math.round(((e.clientY - rect.top) - this.margin) / this.cellSize);
            this.handleClick(x, y);
        });
        this.canvas.addEventListener('touchstart', e => {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = Math.round(((touch.clientX - rect.left) - this.margin) / this.cellSize);
            const y = Math.round(((touch.clientY - rect.top) - this.margin) / this.cellSize);
            this.handleClick(x, y);
        });
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('new-game-overlay').addEventListener('click', () => { this.newGame(); this.hideOverlay(); });
        document.getElementById('close-overlay').addEventListener('click', () => this.hideOverlay());
    }
    handleClick(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.board[y][x]) return;
        // Place stone
        this.board[y][x] = this.currentPlayer;
        this.moveHistory.push({ x, y, player: this.currentPlayer });
        // Remove captured stones
        this.removeCaptured(x, y, this.currentPlayer === 'black' ? 'white' : 'black');
        // TODO: prevent suicide moves
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.drawBoard();
        this.updateDisplay();
    }
    removeCaptured(x, y, opponent) {
        // Check all 4 directions for opponent groups with no liberties
        const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
        for (let [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.board[ny][nx] === opponent) {
                const group = this.getGroup(nx, ny, opponent);
                if (!this.hasLiberty(group)) {
                    for (let {x: gx, y: gy} of group) {
                        this.board[gy][gx] = null;
                    }
                }
            }
        }
    }
    getGroup(x, y, color, visited = {}) {
        const key = `${x},${y}`;
        if (visited[key]) return [];
        visited[key] = true;
        let group = [{x, y}];
        const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
        for (let [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.board[ny][nx] === color) {
                group = group.concat(this.getGroup(nx, ny, color, visited));
            }
        }
        return group;
    }
    hasLiberty(group) {
        const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
        for (let {x, y} of group) {
            for (let [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && !this.board[ny][nx]) {
                    return true;
                }
            }
        }
        return false;
    }
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw grid
        this.ctx.strokeStyle = '#b9935f';
        for (let i = 0; i < this.size; i++) {
            // Horizontal
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, this.margin + i * this.cellSize);
            this.ctx.lineTo(this.margin + (this.size - 1) * this.cellSize, this.margin + i * this.cellSize);
            this.ctx.stroke();
            // Vertical
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin + i * this.cellSize, this.margin);
            this.ctx.lineTo(this.margin + i * this.cellSize, this.margin + (this.size - 1) * this.cellSize);
            this.ctx.stroke();
        }
        // Draw star points
        const star = [3, 9, 15];
        for (let sy of star) {
            for (let sx of star) {
                this.ctx.beginPath();
                this.ctx.arc(this.margin + sx * this.cellSize, this.margin + sy * this.cellSize, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#b9935f';
                this.ctx.fill();
            }
        }
        // Draw stones
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x]) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        this.margin + x * this.cellSize,
                        this.margin + y * this.cellSize,
                        16, 0, Math.PI * 2
                    );
                    this.ctx.fillStyle = this.board[y][x] === 'black' ? '#232526' : '#fff';
                    this.ctx.strokeStyle = '#232526';
                    this.ctx.lineWidth = 2;
                    this.ctx.shadowColor = '#888';
                    this.ctx.shadowBlur = 6;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
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
    new GoGame();
});
