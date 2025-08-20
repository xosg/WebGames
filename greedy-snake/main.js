class GreedySnake {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake-high-score')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Difficulty settings
        this.difficulties = {
            easy: { speed: 150, speedIncrease: 2 },
            normal: { speed: 120, speedIncrease: 3 },
            hard: { speed: 90, speedIncrease: 4 },
            insane: { speed: 60, speedIncrease: 5 }
        };
        this.currentDifficulty = 'normal';
        this.gameSpeed = this.difficulties[this.currentDifficulty].speed;
        this.baseSpeed = this.gameSpeed;
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameSpeed = this.difficulties[this.currentDifficulty].speed;
        this.baseSpeed = this.gameSpeed;
        
        this.clearCanvas();
        this.drawGame();
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
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.initializeGame();
        });
        
        // Mobile D-pad controls
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.changeDirection(direction);
            });
        });
        
        // Touch controls for swipe
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!e.changedTouches) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            this.handleSwipe(touchEndX, touchEndY);
        });
        
        // Click to start
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning && !this.gameOver) {
                this.startGame();
            }
        });
    }
    
    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            this.togglePause();
            return;
        }
        
        if (e.code === 'Escape') {
            e.preventDefault();
            this.initializeGame();
            return;
        }
        
        // Movement keys
        const key = e.code;
        if (key === 'ArrowUp' || key === 'KeyW') {
            this.changeDirection('up');
        } else if (key === 'ArrowDown' || key === 'KeyS') {
            this.changeDirection('down');
        } else if (key === 'ArrowLeft' || key === 'KeyA') {
            this.changeDirection('left');
        } else if (key === 'ArrowRight' || key === 'KeyD') {
            this.changeDirection('right');
        }
    }
    
    handleSwipe(endX, endY) {
        const deltaX = endX - this.touchStartX;
        const deltaY = endY - this.touchStartY;
        
        if (Math.abs(deltaX) < this.minSwipeDistance && Math.abs(deltaY) < this.minSwipeDistance) {
            // Not a swipe, treat as tap to start
            if (!this.gameRunning && !this.gameOver) {
                this.startGame();
            }
            return;
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.changeDirection('right');
            } else {
                this.changeDirection('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.changeDirection('down');
            } else {
                this.changeDirection('up');
            }
        }
    }
    
    changeDirection(direction) {
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
        
        if (this.gamePaused || this.gameOver) return;
        
        switch (direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        setTimeout(() => {
            this.update();
            this.drawGame();
            
            if (this.gameRunning) {
                this.gameLoop();
            }
        }, this.gameSpeed);
    }
    
    update() {
        // Move snake head
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.animateScore();
            this.generateFood();
            this.increaseSpeed();
        } else {
            this.snake.pop();
        }
        
        this.updateDisplay();
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ));
        
        this.food = foodPosition;
    }
    
    increaseSpeed() {
        const speedIncrease = this.difficulties[this.currentDifficulty].speedIncrease;
        this.gameSpeed = Math.max(this.gameSpeed - speedIncrease, 30);
    }
    
    drawGame() {
        this.clearCanvas();
        
        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            if (i === 0) {
                // Snake head
                this.ctx.fillStyle = '#2E7D32';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
        
        // Draw food
        this.ctx.fillStyle = '#f44336';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 1,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Draw grid (optional, subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake-high-score', this.highScore.toString());
        }
        
        this.showGameOver();
        this.updateDisplay();
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
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        
        const currentSpeed = Math.round((this.baseSpeed - this.gameSpeed) / this.difficulties[this.currentDifficulty].speedIncrease) + 1;
        document.getElementById('speed').textContent = currentSpeed;
    }
    
    animateScore() {
        const scoreElement = document.getElementById('score');
        scoreElement.classList.add('score-animate');
        setTimeout(() => {
            scoreElement.classList.remove('score-animate');
        }, 300);
    }
    
    showPause() {
        document.getElementById('overlay-title').textContent = 'Game Paused';
        document.getElementById('overlay-message').textContent = 'Press SPACE or click Resume to continue';
        document.getElementById('resume-game').classList.remove('hidden');
        document.getElementById('restart-game').classList.add('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    showGameOver() {
        const isNewHighScore = this.score === this.highScore && this.score > 0;
        document.getElementById('overlay-title').textContent = isNewHighScore ? 'New High Score!' : 'Game Over!';
        document.getElementById('overlay-message').textContent = `Score: ${this.score}${isNewHighScore ? ' 🎉' : ''}`;
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
    new GreedySnake();
});
