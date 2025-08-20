class BrickBreakerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game dimensions
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // Game objects
        this.paddle = {
            x: this.canvasWidth / 2 - 50,
            y: this.canvasHeight - 30,
            width: 100,
            height: 15,
            speed: 8,
            normalWidth: 100,
            expandedWidth: 150
        };
        
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.levelComplete = false;
        this.ballLaunched = false;
        
        // Power-up effects
        this.powerUpEffects = {
            expandPaddle: 0,
            slowBall: 0
        };
        
        // Input handling
        this.keys = {};
        this.mouseX = this.canvasWidth / 2;
        this.touchActive = false;
        
        // Colors
        this.colors = {
            paddle: '#feca57',
            ball: '#ff6b6b',
            brick1: '#48dbfb',
            brick2: '#ff9ff3',
            brick3: '#54a0ff',
            brick4: '#5f27cd',
            brick5: '#00d2d3',
            powerUpExpand: '#48dbfb',
            powerUpMulti: '#ff9ff3',
            powerUpLife: '#ff6b6b',
            powerUpSlow: '#feca57'
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeGame() {
        // Create initial ball
        this.balls = [{
            x: this.paddle.x + this.paddle.width / 2,
            y: this.paddle.y - 20,
            dx: 0,
            dy: 0,
            speed: 5,
            radius: 8,
            attached: true
        }];
        
        // Reset paddle
        this.paddle.x = this.canvasWidth / 2 - 50;
        this.paddle.width = this.paddle.normalWidth;
        
        // Reset power-ups
        this.powerUps = [];
        this.powerUpEffects = {
            expandPaddle: 0,
            slowBall: 0
        };
        
        // Reset flags
        this.ballLaunched = false;
        this.levelComplete = false;
        
        this.createBricks();
        this.updateDisplay();
        this.showStartOverlay();
    }
    
    createBricks() {
        this.bricks = [];
        const rows = 5 + Math.floor(this.level / 3);
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 25;
        const padding = 5;
        const offsetX = (this.canvasWidth - (cols * (brickWidth + padding) - padding)) / 2;
        const offsetY = 60;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some bricks for interesting patterns
                if (this.level > 3 && Math.random() < 0.1) continue;
                
                const brick = {
                    x: offsetX + col * (brickWidth + padding),
                    y: offsetY + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    hits: 1,
                    maxHits: Math.min(5, 1 + Math.floor(row / 2) + Math.floor(this.level / 5)),
                    powerUp: Math.random() < 0.15 ? this.getRandomPowerUp() : null
                };
                
                this.bricks.push(brick);
            }
        }
    }
    
    getRandomPowerUp() {
        const powerUps = ['expand', 'multi', 'life', 'slow'];
        return powerUps[Math.floor(Math.random() * powerUps.length)];
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.canvasWidth / rect.width);
        });
        
        this.canvas.addEventListener('click', () => {
            this.launchBall();
        });
        
        // Touch events
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = (touch.clientX - rect.left) * (this.canvasWidth / rect.width);
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.launchBall();
        });
        
        // Button events
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('next-level').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Touch controls
        document.getElementById('touch-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = true;
        });
        
        document.getElementById('touch-left').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
        });
        
        document.getElementById('touch-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = true;
        });
        
        document.getElementById('touch-right').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
        });
        
        document.getElementById('touch-launch').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.launchBall();
        });
    }
    
    handleKeyPress(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (this.gameRunning) {
                    this.launchBall();
                } else {
                    this.togglePause();
                }
                break;
            case 'KeyR':
                e.preventDefault();
                this.restartGame();
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.hideOverlay();
    }
    
    launchBall() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.balls.forEach(ball => {
            if (ball.attached) {
                ball.attached = false;
                ball.dx = (Math.random() - 0.5) * 4;
                ball.dy = -ball.speed;
                this.ballLaunched = true;
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.updatePaddle();
        this.updateBalls();
        this.updatePowerUps();
        this.updatePowerUpEffects();
        this.checkCollisions();
        this.checkGameState();
    }
    
    updatePaddle() {
        // Keyboard controls
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.paddle.x += this.paddle.speed;
        }
        
        // Mouse control
        if (!this.keys['ArrowLeft'] && !this.keys['ArrowRight'] && !this.keys['KeyA'] && !this.keys['KeyD']) {
            this.paddle.x = this.mouseX - this.paddle.width / 2;
        }
        
        // Keep paddle in bounds
        this.paddle.x = Math.max(0, Math.min(this.canvasWidth - this.paddle.width, this.paddle.x));
        
        // Update attached balls
        this.balls.forEach(ball => {
            if (ball.attached) {
                ball.x = this.paddle.x + this.paddle.width / 2;
                ball.y = this.paddle.y - ball.radius - 5;
            }
        });
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (ball.attached) continue;
            
            // Apply slow power-up
            const speedMultiplier = this.powerUpEffects.slowBall > 0 ? 0.5 : 1;
            ball.x += ball.dx * speedMultiplier;
            ball.y += ball.dy * speedMultiplier;
            
            // Wall collisions
            if (ball.x <= ball.radius || ball.x >= this.canvasWidth - ball.radius) {
                ball.dx = -ball.dx;
                ball.x = Math.max(ball.radius, Math.min(this.canvasWidth - ball.radius, ball.x));
            }
            
            if (ball.y <= ball.radius) {
                ball.dy = -ball.dy;
                ball.y = ball.radius;
            }
            
            // Ball fell off screen
            if (ball.y > this.canvasHeight + 50) {
                this.balls.splice(i, 1);
            }
        }
        
        // Check if all balls are gone
        if (this.balls.length === 0) {
            this.loseLife();
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += 3;
            
            // Remove if off screen
            if (powerUp.y > this.canvasHeight) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    updatePowerUpEffects() {
        // Decrease power-up timers
        Object.keys(this.powerUpEffects).forEach(effect => {
            if (this.powerUpEffects[effect] > 0) {
                this.powerUpEffects[effect]--;
                
                // Reset paddle size when expand effect ends
                if (effect === 'expandPaddle' && this.powerUpEffects[effect] === 0) {
                    this.paddle.width = this.paddle.normalWidth;
                }
            }
        });
    }
    
    checkCollisions() {
        this.balls.forEach(ball => {
            if (ball.attached) return;
            
            // Paddle collision
            if (this.checkPaddleCollision(ball)) {
                this.handlePaddleCollision(ball);
            }
            
            // Brick collisions
            for (let i = this.bricks.length - 1; i >= 0; i--) {
                const brick = this.bricks[i];
                if (this.checkBrickCollision(ball, brick)) {
                    this.handleBrickCollision(ball, brick, i);
                }
            }
            
            // Power-up collisions
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                if (this.checkPowerUpCollision(powerUp)) {
                    this.activatePowerUp(powerUp.type);
                    this.powerUps.splice(i, 1);
                }
            }
        });
    }
    
    checkPaddleCollision(ball) {
        return ball.x + ball.radius > this.paddle.x &&
               ball.x - ball.radius < this.paddle.x + this.paddle.width &&
               ball.y + ball.radius > this.paddle.y &&
               ball.y - ball.radius < this.paddle.y + this.paddle.height &&
               ball.dy > 0;
    }
    
    handlePaddleCollision(ball) {
        ball.dy = -Math.abs(ball.dy);
        
        // Add spin based on hit position
        const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
        
        // Ensure minimum upward velocity
        if (Math.abs(ball.dy) < 3) {
            ball.dy = ball.dy < 0 ? -3 : 3;
        }
        
        ball.y = this.paddle.y - ball.radius;
    }
    
    checkBrickCollision(ball, brick) {
        return ball.x + ball.radius > brick.x &&
               ball.x - ball.radius < brick.x + brick.width &&
               ball.y + ball.radius > brick.y &&
               ball.y - ball.radius < brick.y + brick.height;
    }
    
    handleBrickCollision(ball, brick, brickIndex) {
        // Determine collision side
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        
        if (Math.abs(dx) / brick.width > Math.abs(dy) / brick.height) {
            ball.dx = -ball.dx;
        } else {
            ball.dy = -ball.dy;
        }
        
        // Damage brick
        brick.hits--;
        
        if (brick.hits <= 0) {
            // Drop power-up if brick had one
            if (brick.powerUp) {
                this.powerUps.push({
                    x: brick.x + brick.width / 2,
                    y: brick.y + brick.height / 2,
                    width: 20,
                    height: 20,
                    type: brick.powerUp
                });
            }
            
            // Add score
            this.score += 10 * this.level;
            this.animateScore();
            
            // Remove brick
            this.bricks.splice(brickIndex, 1);
        }
    }
    
    checkPowerUpCollision(powerUp) {
        return powerUp.x + powerUp.width > this.paddle.x &&
               powerUp.x < this.paddle.x + this.paddle.width &&
               powerUp.y + powerUp.height > this.paddle.y &&
               powerUp.y < this.paddle.y + this.paddle.height;
    }
    
    activatePowerUp(type) {
        this.score += 50;
        this.animateScore();
        
        switch(type) {
            case 'expand':
                this.paddle.width = this.paddle.expandedWidth;
                this.powerUpEffects.expandPaddle = 600; // 10 seconds at 60fps
                break;
            case 'multi':
                if (this.balls.length < 5) {
                    const originalBall = this.balls[0];
                    const newBall = {
                        x: originalBall.x,
                        y: originalBall.y,
                        dx: -originalBall.dx + (Math.random() - 0.5) * 2,
                        dy: originalBall.dy,
                        speed: originalBall.speed,
                        radius: originalBall.radius,
                        attached: false
                    };
                    this.balls.push(newBall);
                }
                break;
            case 'life':
                this.lives++;
                this.animateLife();
                break;
            case 'slow':
                this.powerUpEffects.slowBall = 600; // 10 seconds at 60fps
                break;
        }
    }
    
    checkGameState() {
        // Check level complete
        if (this.bricks.length === 0 && !this.levelComplete) {
            this.levelComplete = true;
            this.score += 100 * this.level;
            this.showLevelComplete();
        }
    }
    
    loseLife() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.endGame();
        } else {
            // Reset ball
            this.balls = [{
                x: this.paddle.x + this.paddle.width / 2,
                y: this.paddle.y - 20,
                dx: 0,
                dy: 0,
                speed: 5,
                radius: 8,
                attached: true
            }];
            this.ballLaunched = false;
            
            // Animate life loss
            document.getElementById('lives').classList.add('shake');
            setTimeout(() => {
                document.getElementById('lives').classList.remove('shake');
            }, 500);
        }
        
        this.updateDisplay();
    }
    
    nextLevel() {
        this.level++;
        this.initializeGame();
        this.startGame();
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        this.initializeGame();
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.showGameOver();
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showPause();
        } else {
            this.hideOverlay();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw game objects
        this.drawBricks();
        this.drawBalls();
        this.drawPaddle();
        this.drawPowerUps();
        
        // Draw UI elements
        if (!this.ballLaunched && this.balls.some(ball => ball.attached)) {
            this.drawLaunchIndicator();
        }
    }
    
    drawBackground() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Draw grid
        for (let x = 0; x < this.canvasWidth; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasHeight);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvasHeight; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    drawPaddle() {
        // Main paddle
        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Paddle highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, 3);
        
        // Power-up indicator
        if (this.powerUpEffects.expandPaddle > 0) {
            this.ctx.strokeStyle = this.colors.powerUpExpand;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.paddle.x - 2, this.paddle.y - 2, this.paddle.width + 4, this.paddle.height + 4);
        }
    }
    
    drawBalls() {
        this.balls.forEach(ball => {
            // Ball shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main ball
            this.ctx.fillStyle = this.colors.ball;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ball highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Slow effect
            if (this.powerUpEffects.slowBall > 0) {
                this.ctx.strokeStyle = this.colors.powerUpSlow;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    drawBricks() {
        this.bricks.forEach(brick => {
            // Determine color based on hits
            let color;
            switch(brick.hits) {
                case 1: color = this.colors.brick1; break;
                case 2: color = this.colors.brick2; break;
                case 3: color = this.colors.brick3; break;
                case 4: color = this.colors.brick4; break;
                default: color = this.colors.brick5; break;
            }
            
            // Main brick
            this.ctx.fillStyle = color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // Brick border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // Brick highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(brick.x, brick.y, brick.width, 3);
            
            // Power-up indicator
            if (brick.powerUp) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(brick.x + brick.width / 2, brick.y + brick.height / 2, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Hit indicator
            if (brick.maxHits > 1) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(brick.hits.toString(), brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
            }
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            let color;
            switch(powerUp.type) {
                case 'expand': color = this.colors.powerUpExpand; break;
                case 'multi': color = this.colors.powerUpMulti; break;
                case 'life': color = this.colors.powerUpLife; break;
                case 'slow': color = this.colors.powerUpSlow; break;
            }
            
            // Power-up background
            this.ctx.fillStyle = color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // Power-up border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // Power-up icon
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            
            let icon;
            switch(powerUp.type) {
                case 'expand': icon = '↔'; break;
                case 'multi': icon = '●'; break;
                case 'life': icon = '♥'; break;
                case 'slow': icon = '⏰'; break;
            }
            
            this.ctx.fillText(icon, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 4);
        });
    }
    
    drawLaunchIndicator() {
        const ball = this.balls.find(ball => ball.attached);
        if (!ball) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(ball.x, ball.y);
        this.ctx.lineTo(ball.x, ball.y - 100);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Launch text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click or Press SPACE to Launch', this.canvasWidth / 2, this.canvasHeight / 2);
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    animateScore() {
        const scoreElement = document.getElementById('score');
        scoreElement.style.animation = 'scoreBonus 0.3s ease-in-out';
        setTimeout(() => {
            scoreElement.style.animation = '';
        }, 300);
    }
    
    animateLife() {
        const livesElement = document.getElementById('lives');
        livesElement.style.animation = 'levelUp 0.5s ease-in-out';
        setTimeout(() => {
            livesElement.style.animation = '';
        }, 500);
    }
    
    showStartOverlay() {
        document.getElementById('overlay-title').textContent = 'Brick Breaker';
        document.getElementById('overlay-message').textContent = 'Use arrow keys or mouse to move the paddle';
        document.getElementById('start-game').classList.remove('hidden');
        document.getElementById('next-level').classList.add('hidden');
        document.getElementById('restart-game').classList.add('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    showLevelComplete() {
        document.getElementById('overlay-title').textContent = `Level ${this.level} Complete!`;
        document.getElementById('overlay-message').textContent = `Score: ${this.score.toLocaleString()}`;
        document.getElementById('start-game').classList.add('hidden');
        document.getElementById('next-level').classList.remove('hidden');
        document.getElementById('restart-game').classList.remove('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    showGameOver() {
        document.getElementById('overlay-title').textContent = 'Game Over!';
        document.getElementById('overlay-message').textContent = `Final Score: ${this.score.toLocaleString()} | Level: ${this.level}`;
        document.getElementById('start-game').classList.add('hidden');
        document.getElementById('next-level').classList.add('hidden');
        document.getElementById('restart-game').classList.remove('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    showPause() {
        document.getElementById('overlay-title').textContent = 'Game Paused';
        document.getElementById('overlay-message').textContent = 'Press SPACE to resume';
        document.getElementById('start-game').classList.add('hidden');
        document.getElementById('next-level').classList.add('hidden');
        document.getElementById('restart-game').classList.remove('hidden');
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new BrickBreakerGame();
});
