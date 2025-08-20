class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.rows = 9;
        this.cols = 9;
        this.totalMines = 10;
        this.board = [];
        this.gameBoard = [];
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        const difficulty = this.difficulties[this.currentDifficulty];
        this.rows = difficulty.rows;
        this.cols = difficulty.cols;
        this.totalMines = difficulty.mines;
        
        this.createBoard();
        this.renderBoard();
        this.updateMineCount();
        this.resetTimer();
        
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.flaggedCount = 0;
        this.revealedCount = 0;
    }
    
    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => {
            this.initializeGame();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.hideGameOver();
            this.initializeGame();
        });
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.initializeGame();
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    createBoard() {
        // Initialize empty board
        this.board = [];
        this.gameBoard = [];
        
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            this.gameBoard[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    isMine: false,
                    neighborMines: 0,
                    isRevealed: false,
                    isFlagged: false
                };
                this.gameBoard[i][j] = null;
            }
        }
    }
    
    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or if already has mine
            if ((row === firstClickRow && col === firstClickCol) || 
                this.board[row][col].isMine) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].isMine) {
                    this.board[i][j].neighborMines = this.countNeighborMines(i, j);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols && 
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    renderBoard() {
        const gameBoardElement = document.getElementById('game-board');
        gameBoardElement.innerHTML = '';
        gameBoardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        gameBoardElement.style.display = 'grid';
        gameBoardElement.style.gap = '1px';
        gameBoardElement.style.width = `${this.cols * 26 + 10}px`;
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(i, j);
                });
                
                this.gameBoard[i][j] = cell;
                gameBoardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged || 
            this.board[row][col].isRevealed) {
            return;
        }
        
        // First click - place mines
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        this.revealCell(row, col);
        
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.endGame(false);
        } else {
            this.checkWinCondition();
        }
    }
    
    handleCellRightClick(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) {
            return;
        }
        
        this.toggleFlag(row, col);
    }
    
    revealCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        this.board[row][col].isRevealed = true;
        this.revealedCount++;
        const cell = this.gameBoard[row][col];
        cell.classList.add('revealed');
        
        if (this.board[row][col].isMine) {
            cell.classList.add('mine');
            cell.classList.add('mine-hit');
        } else {
            const neighborMines = this.board[row][col].neighborMines;
            if (neighborMines > 0) {
                cell.textContent = neighborMines;
                cell.classList.add(`num-${neighborMines}`);
            } else {
                // Auto-reveal neighbors for empty cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        this.revealCell(row + i, col + j);
                    }
                }
            }
        }
    }
    
    toggleFlag(row, col) {
        if (this.board[row][col].isFlagged) {
            this.board[row][col].isFlagged = false;
            this.gameBoard[row][col].classList.remove('flagged');
            this.flaggedCount--;
        } else {
            this.board[row][col].isFlagged = true;
            this.gameBoard[row][col].classList.add('flagged');
            this.flaggedCount++;
        }
        
        this.updateMineCount();
    }
    
    checkWinCondition() {
        const totalCells = this.rows * this.cols;
        const safeCells = totalCells - this.totalMines;
        
        if (this.revealedCount === safeCells) {
            this.gameWon = true;
            this.gameOver = true;
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.stopTimer();
        
        if (!won) {
            // Reveal all mines
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.board[i][j].isMine && !this.board[i][j].isRevealed) {
                        this.gameBoard[i][j].classList.add('mine');
                    }
                }
            }
            
            this.showGameOver('Game Over!', 'You hit a mine! Better luck next time.');
        } else {
            this.showGameOver('Congratulations!', `You won in ${this.timer} seconds!`);
        }
    }
    
    updateMineCount() {
        const remainingMines = this.totalMines - this.flaggedCount;
        document.getElementById('mine-count').textContent = 
            remainingMines.toString().padStart(3, '0');
    }
    
    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = 
                this.timer.toString().padStart(3, '0');
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        document.getElementById('timer').textContent = '000';
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
    new Minesweeper();
});
