class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // Game dimensions
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.blockSize = 30;
        
        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Timing
        this.dropTime = 0;
        this.dropInterval = 1000; // 1 second
        this.lastTime = 0;
        
        // Piece definitions
        this.pieces = {
            'I': [
                ['....', 'IIII', '....', '....'],
                ['..I.', '..I.', '..I.', '..I.'],
                ['....', '....', 'IIII', '....'],
                ['.I..', '.I..', '.I..', '.I..']
            ],
            'O': [
                ['OO', 'OO']
            ],
            'T': [
                ['.T.', 'TTT', '...'],
                ['.T.', '.TT', '.T.'],
                ['...', 'TTT', '.T.'],
                ['.T.', 'TT.', '.T.']
            ],
            'S': [
                ['.SS', 'SS.', '...'],
                ['.S.', '.SS', '..S'],
                ['...', '.SS', 'SS.'],
                ['S..', 'SS.', '.S.']
            ],
            'Z': [
                ['ZZ.', '.ZZ', '...'],
                ['..Z', '.ZZ', '.Z.'],
                ['...', 'ZZ.', '.ZZ'],
                ['.Z.', 'ZZ.', 'Z..']
            ],
            'J': [
                ['J..', 'JJJ', '...'],
                ['.JJ', '.J.', '.J.'],
                ['...', 'JJJ', '..J'],
                ['.J.', '.J.', 'JJ.']
            ],
            'L': [
                ['..L', 'LLL', '...'],
                ['.L.', '.L.', '.LL'],
                ['...', 'LLL', 'L..'],
                ['LL.', '.L.', '.L.']
            ]
        };
        
        this.pieceColors = {
            'I': '#00f0f0', 'O': '#f0f000', 'T': '#a000f0',
            'S': '#00f000', 'Z': '#f00000', 'J': '#0000f0', 'L': '#f0a000'
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeGame() {
        // Initialize empty board
        this.board = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.board[y][x] = 0;
            }
        }
        
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.canHold = true;
        this.heldPiece = null;
        
        // Generate first pieces
        this.currentPiece = this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        this.updateDropInterval();
        this.draw();
        this.updateDisplay();
        this.hideOverlay();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Button controls
        document.getElementById('new-game').addEventListener('click', () => {
            this.initializeGame();
        });
        
        document.getElementById('pause-game').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resume-game').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.initializeGame();
        });
        
        // Mobile controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleMobileControl(action);
            });
        });
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
            case 'KeyS':
                e.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
            case 'KeyZ':
                e.preventDefault();
                this.rotatePiece(1);
                break;
            case 'KeyX':
                e.preventDefault();
                this.rotatePiece(-1);
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyC':
                e.preventDefault();
                this.holdPiece();
                break;
            case 'KeyP':
                e.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                e.preventDefault();
                this.initializeGame();
                break;
        }
        
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
    }
    
    handleMobileControl(action) {
        if (this.gameOver) return;
        
        switch(action) {
            case 'left':
                this.movePiece(-1, 0);
                break;
            case 'right':
                this.movePiece(1, 0);
                break;
            case 'down':
                this.movePiece(0, 1);
                break;
            case 'rotate-cw':
                this.rotatePiece(1);
                break;
            case 'rotate-ccw':
                this.rotatePiece(-1);
                break;
            case 'hard-drop':
                this.hardDrop();
                break;
            case 'hold':
                this.holdPiece();
                break;
        }
        
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
    }
    
    generatePiece() {
        const pieceTypes = Object.keys(this.pieces);
        const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        return {
            type: type,
            shape: this.pieces[type][0],
            rotation: 0,
            x: Math.floor(this.gridWidth / 2) - Math.floor(this.pieces[type][0][0].length / 2),
            y: 0
        };
    }
    
    startGame() {
        if (this.gameRunning) return;
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop(timestamp = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.dropTime += deltaTime;
        
        if (this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
        
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
        } else if (dy > 0) {
            // Piece hit bottom, place it
            this.placePiece();
        }
    }
    
    rotatePiece(direction) {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        const rotations = this.pieces[this.currentPiece.type];
        let newRotation = this.currentPiece.rotation + direction;
        
        if (newRotation < 0) newRotation = rotations.length - 1;
        if (newRotation >= rotations.length) newRotation = 0;
        
        const newShape = rotations[newRotation];
        
        // Try basic rotation
        if (this.isValidPosition(newShape, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = newShape;
            this.currentPiece.rotation = newRotation;
            return;
        }
        
        // Try wall kicks
        const kicks = [[-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]];
        for (let kick of kicks) {
            if (this.isValidPosition(newShape, this.currentPiece.x + kick[0], this.currentPiece.y + kick[1])) {
                this.currentPiece.shape = newShape;
                this.currentPiece.rotation = newRotation;
                this.currentPiece.x += kick[0];
                this.currentPiece.y += kick[1];
                return;
            }
        }
    }
    
    hardDrop() {
        if (!this.currentPiece || this.gamePaused || this.gameOver) return;
        
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            this.score += 2; // Bonus points for hard drop
        }
        this.placePiece();
    }
    
    holdPiece() {
        if (!this.canHold || this.gamePaused || this.gameOver) return;
        
        if (this.heldPiece === null) {
            this.heldPiece = this.currentPiece.type;
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.generatePiece();
        } else {
            const temp = this.heldPiece;
            this.heldPiece = this.currentPiece.type;
            this.currentPiece = {
                type: temp,
                shape: this.pieces[temp][0],
                rotation: 0,
                x: Math.floor(this.gridWidth / 2) - Math.floor(this.pieces[temp][0][0].length / 2),
                y: 0
            };
        }
        
        this.canHold = false;
        this.drawHoldPiece();
        this.drawNextPiece();
    }
    
    isValidPosition(shape, x, y) {
        for (let dy = 0; dy < shape.length; dy++) {
            for (let dx = 0; dx < shape[dy].length; dx++) {
                if (shape[dy][dx] !== '.' && shape[dy][dx] !== ' ') {
                    const newX = x + dx;
                    const newY = y + dy;
                    
                    if (newX < 0 || newX >= this.gridWidth || 
                        newY >= this.gridHeight || 
                        (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        // Place piece on board
        for (let dy = 0; dy < this.currentPiece.shape.length; dy++) {
            for (let dx = 0; dx < this.currentPiece.shape[dy].length; dx++) {
                if (this.currentPiece.shape[dy][dx] !== '.' && this.currentPiece.shape[dy][dx] !== ' ') {
                    const x = this.currentPiece.x + dx;
                    const y = this.currentPiece.y + dy;
                    
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.type;
                    }
                }
            }
        }
        
        // Check for completed lines
        this.clearLines();
        
        // Get next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        this.canHold = true;
        
        // Check game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.endGame();
        }
        
        this.drawNextPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.gridWidth).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.updateLevel();
            this.updateScore(linesCleared);
        }
    }
    
    updateScore(linesCleared) {
        const basePoints = [0, 40, 100, 300, 1200];
        this.score += basePoints[linesCleared] * this.level;
        
        // Animate score
        const scoreElement = document.getElementById('score');
        scoreElement.style.animation = 'levelUp 0.3s ease-in-out';
        setTimeout(() => {
            scoreElement.style.animation = '';
        }, 300);
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateDropInterval();
            
            // Animate level
            const levelElement = document.getElementById('level');
            levelElement.style.animation = 'levelUp 0.5s ease-in-out';
            setTimeout(() => {
                levelElement.style.animation = '';
            }, 500);
        }
    }
    
    updateDropInterval() {
        this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, this.pieceColors[this.board[y][x]]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.pieceColors[this.currentPiece.type]);
        }
        
        // Draw grid lines
        this.drawGrid();
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, 
                         this.blockSize - 2, this.blockSize - 2);
        
        // Add 3D effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, 
                         this.blockSize - 2, 3);
        this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, 
                         3, this.blockSize - 2);
    }
    
    drawPiece(piece, color) {
        for (let dy = 0; dy < piece.shape.length; dy++) {
            for (let dx = 0; dx < piece.shape[dy].length; dx++) {
                if (piece.shape[dy][dx] !== '.' && piece.shape[dy][dx] !== ' ') {
                    this.drawBlock(piece.x + dx, piece.y + dy, color);
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const blockSize = 20;
            const shape = this.nextPiece.shape;
            const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
            
            for (let dy = 0; dy < shape.length; dy++) {
                for (let dx = 0; dx < shape[dy].length; dx++) {
                    if (shape[dy][dx] !== '.' && shape[dy][dx] !== ' ') {
                        this.nextCtx.fillStyle = this.pieceColors[this.nextPiece.type];
                        this.nextCtx.fillRect(
                            offsetX + dx * blockSize + 1,
                            offsetY + dy * blockSize + 1,
                            blockSize - 2,
                            blockSize - 2
                        );
                    }
                }
            }
        }
    }
    
    drawHoldPiece() {
        this.holdCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        if (this.heldPiece) {
            const blockSize = 20;
            const shape = this.pieces[this.heldPiece][0];
            const offsetX = (this.holdCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.holdCanvas.height - shape.length * blockSize) / 2;
            
            for (let dy = 0; dy < shape.length; dy++) {
                for (let dx = 0; dx < shape[dy].length; dx++) {
                    if (shape[dy][dx] !== '.' && shape[dy][dx] !== ' ') {
                        this.holdCtx.fillStyle = this.pieceColors[this.heldPiece];
                        this.holdCtx.fillRect(
                            offsetX + dx * blockSize + 1,
                            offsetY + dy * blockSize + 1,
                            blockSize - 2,
                            blockSize - 2
                        );
                    }
                }
            }
        }
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        if (!this.gameRunning) {
            this.startGame();
            return;
        }
        
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pause-game');
        
        if (this.gamePaused) {
            pauseBtn.textContent = 'Resume';
            pauseBtn.classList.add('paused');
            this.showPause();
        } else {
            pauseBtn.textContent = 'Pause';
            pauseBtn.classList.remove('paused');
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.showGameOver();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        
        this.drawNextPiece();
        this.drawHoldPiece();
    }
    
    showPause() {
        document.getElementById('overlay-title').textContent = 'Game Paused';
        document.getElementById('overlay-message').textContent = 'Press SPACE or click Resume to continue';
        document.getElementById('resume-game').classList.remove('hidden');
        document.getElementById('restart-game').classList.add('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    showGameOver() {
        document.getElementById('overlay-title').textContent = 'Game Over!';
        document.getElementById('overlay-message').textContent = `Final Score: ${this.score.toLocaleString()}`;
        document.getElementById('resume-game').classList.add('hidden');
        document.getElementById('restart-game').classList.remove('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
        document.getElementById('pause-game').textContent = 'Pause';
        document.getElementById('pause-game').classList.remove('paused');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new TetrisGame();
});
