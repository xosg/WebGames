class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score')) || 0;
        this.size = 4;
        this.gameWon = false;
        this.gameOver = false;
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeGame() {
        // Create empty grid
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        // Reset game state
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderGrid();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.initializeGame();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.hideGameOver();
            this.initializeGame();
        });
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        let moved = false;
        let newGrid = this.copyGrid(this.grid);
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft(newGrid);
                break;
            case 'right':
                moved = this.moveRight(newGrid);
                break;
            case 'up':
                moved = this.moveUp(newGrid);
                break;
            case 'down':
                moved = this.moveDown(newGrid);
                break;
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
            this.renderGrid();
            this.updateDisplay();
            
            if (this.checkWin() && !this.gameWon) {
                this.gameWon = true;
                this.showGameOver('You Win!', 'Congratulations! You reached 2048!');
            } else if (this.checkGameOver()) {
                this.gameOver = true;
                this.showGameOver('Game Over!', 'No more moves available!');
            }
        }
    }
    
    moveLeft(grid) {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            let row = grid[i].filter(val => val !== 0);
            
            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            // Fill with zeros
            while (row.length < this.size) {
                row.push(0);
            }
            
            // Check if row changed
            for (let j = 0; j < this.size; j++) {
                if (grid[i][j] !== row[j]) {
                    moved = true;
                }
                grid[i][j] = row[j];
            }
        }
        
        return moved;
    }
    
    moveRight(grid) {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            let row = grid[i].filter(val => val !== 0);
            
            // Merge tiles from right
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            
            // Fill with zeros at the beginning
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            // Check if row changed
            for (let j = 0; j < this.size; j++) {
                if (grid[i][j] !== row[j]) {
                    moved = true;
                }
                grid[i][j] = row[j];
            }
        }
        
        return moved;
    }
    
    moveUp(grid) {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            // Fill with zeros
            while (column.length < this.size) {
                column.push(0);
            }
            
            // Check if column changed
            for (let i = 0; i < this.size; i++) {
                if (grid[i][j] !== column[i]) {
                    moved = true;
                }
                grid[i][j] = column[i];
            }
        }
        
        return moved;
    }
    
    moveDown(grid) {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            
            // Merge tiles from bottom
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            
            // Fill with zeros at the beginning
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            // Check if column changed
            for (let i = 0; i < this.size; i++) {
                if (grid[i][j] !== column[i]) {
                    moved = true;
                }
                grid[i][j] = column[i];
            }
        }
        
        return moved;
    }
    
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }
    
    renderGrid() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                if (this.grid[i][j] !== 0) {
                    tile.textContent = this.grid[i][j];
                    tile.classList.add(`tile-${this.grid[i][j]}`);
                    
                    // Add animation for new tiles
                    setTimeout(() => {
                        tile.classList.add('tile-new');
                    }, 10);
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        }
        
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                
                // Check right neighbor
                if (j < this.size - 1 && this.grid[i][j + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (i < this.size - 1 && this.grid[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showGameOver(title, message) {
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    hideGameOver() {
        document.getElementById('game-over').classList.add('hidden');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game2048();
});
