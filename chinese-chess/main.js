class ChineseChess {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        // Board configuration
        this.boardWidth = 800;
        this.boardHeight = 900;
        this.rows = 10;
        this.cols = 9;
        this.cellSize = 80;
        this.marginX = 60;
        this.marginY = 60;
        
        // Game state
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.board = [];
        this.moveHistory = [];
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.inCheck = { red: false, black: false };
        
        // Piece definitions
        this.pieces = {
            // Red pieces (bottom)
            red: {
                general: { symbol: '帥', name: 'General' },
                advisor: { symbol: '仕', name: 'Advisor' },
                elephant: { symbol: '相', name: 'Elephant' },
                horse: { symbol: '馬', name: 'Horse' },
                chariot: { symbol: '車', name: 'Chariot' },
                cannon: { symbol: '炮', name: 'Cannon' },
                soldier: { symbol: '兵', name: 'Soldier' }
            },
            // Black pieces (top)
            black: {
                general: { symbol: '將', name: 'General' },
                advisor: { symbol: '士', name: 'Advisor' },
                elephant: { symbol: '象', name: 'Elephant' },
                horse: { symbol: '馬', name: 'Horse' },
                chariot: { symbol: '車', name: 'Chariot' },
                cannon: { symbol: '砲', name: 'Cannon' },
                soldier: { symbol: '卒', name: 'Soldier' }
            }
        };
        
        this.initializeBoard();
        this.setupEventListeners();
        this.drawBoard();
        this.updateDisplay();
    }
    
    initializeBoard() {
        // Create empty board
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        
        // Place pieces in starting positions
        this.setupInitialPieces();
        
        // Reset game state
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.inCheck = { red: false, black: false };
    }
    
    setupInitialPieces() {
        // Black pieces (top)
        this.board[0] = [
            { type: 'chariot', color: 'black' },
            { type: 'horse', color: 'black' },
            { type: 'elephant', color: 'black' },
            { type: 'advisor', color: 'black' },
            { type: 'general', color: 'black' },
            { type: 'advisor', color: 'black' },
            { type: 'elephant', color: 'black' },
            { type: 'horse', color: 'black' },
            { type: 'chariot', color: 'black' }
        ];
        
        // Black cannons
        this.board[2][1] = { type: 'cannon', color: 'black' };
        this.board[2][7] = { type: 'cannon', color: 'black' };
        
        // Black soldiers
        for (let i = 0; i < 9; i += 2) {
            this.board[3][i] = { type: 'soldier', color: 'black' };
        }
        
        // Red soldiers
        for (let i = 0; i < 9; i += 2) {
            this.board[6][i] = { type: 'soldier', color: 'red' };
        }
        
        // Red cannons
        this.board[7][1] = { type: 'cannon', color: 'red' };
        this.board[7][7] = { type: 'cannon', color: 'red' };
        
        // Red pieces (bottom)
        this.board[9] = [
            { type: 'chariot', color: 'red' },
            { type: 'horse', color: 'red' },
            { type: 'elephant', color: 'red' },
            { type: 'advisor', color: 'red' },
            { type: 'general', color: 'red' },
            { type: 'advisor', color: 'red' },
            { type: 'elephant', color: 'red' },
            { type: 'horse', color: 'red' },
            { type: 'chariot', color: 'red' }
        ];
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.boardWidth / rect.width);
            const y = (e.clientY - rect.top) * (this.boardHeight / rect.height);
            this.handleClick(x, y);
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = (touch.clientX - rect.left) * (this.boardWidth / rect.width);
            const y = (touch.clientY - rect.top) * (this.boardHeight / rect.height);
            this.handleClick(x, y);
        });
        
        // Game controls
        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('undo-move').addEventListener('click', () => {
            this.undoMove();
        });
        
        document.getElementById('show-rules').addEventListener('click', () => {
            this.showRules();
        });
        
        document.getElementById('close-rules').addEventListener('click', () => {
            this.hideRules();
        });
        
        document.getElementById('new-game-overlay').addEventListener('click', () => {
            this.newGame();
            this.hideOverlay();
        });
        
        document.getElementById('close-overlay').addEventListener('click', () => {
            this.hideOverlay();
        });
    }
    
    handleClick(x, y) {
        if (this.gameOver) return;
        
        const col = Math.round((x - this.marginX) / this.cellSize);
        const row = Math.round((y - this.marginY) / this.cellSize);
        
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
        
        const clickedPiece = this.board[row][col];
        
        if (this.selectedPiece) {
            if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
                // Deselect if clicking the same piece
                this.selectedPiece = null;
            } else if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                // Make the move
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
            } else if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                // Select new piece of same color
                this.selectedPiece = { row, col };
            } else {
                // Invalid move, deselect
                this.selectedPiece = null;
            }
        } else if (clickedPiece && clickedPiece.color === this.currentPlayer) {
            // Select piece
            this.selectedPiece = { row, col };
        }
        
        this.drawBoard();
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        if (!piece) return false;
        if (piece.color !== this.currentPlayer) return false;
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        // Check piece-specific movement rules
        if (!this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol)) return false;
        
        // Check if move would put own general in check
        if (this.wouldBeInCheck(fromRow, fromCol, toRow, toCol)) return false;
        
        return true;
    }
    
    isValidPieceMove(piece, fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);
        
        switch (piece.type) {
            case 'general':
                return this.isValidGeneralMove(fromRow, fromCol, toRow, toCol);
            case 'advisor':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol);
            case 'elephant':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol);
            case 'horse':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case 'chariot':
                return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
            case 'cannon':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case 'soldier':
                return this.isValidSoldierMove(piece.color, fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }
    
    isValidGeneralMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Can only move one step horizontally or vertically
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // Must stay within palace
            if (this.isInPalace(toRow, toCol)) {
                // Check flying general rule
                return !this.wouldCreateFlyingGeneral(fromRow, fromCol, toRow, toCol);
            }
        }
        return false;
    }
    
    isValidAdvisorMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Must move diagonally one step
        if (rowDiff === 1 && colDiff === 1) {
            // Must stay within palace
            return this.isInPalace(toRow, toCol);
        }
        return false;
    }
    
    isValidElephantMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        
        // Must move exactly two points diagonally
        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            // Check for blocking piece
            const blockRow = fromRow + rowDiff / 2;
            const blockCol = fromCol + colDiff / 2;
            if (this.board[blockRow][blockCol]) return false;
            
            // Cannot cross river
            const piece = this.board[fromRow][fromCol];
            if (piece.color === 'red' && toRow < 5) return false;
            if (piece.color === 'black' && toRow > 4) return false;
            
            return true;
        }
        return false;
    }
    
    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);
        
        // L-shaped move
        if ((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)) {
            // Check for blocking piece
            let blockRow, blockCol;
            if (absRowDiff === 2) {
                blockRow = fromRow + (rowDiff > 0 ? 1 : -1);
                blockCol = fromCol;
            } else {
                blockRow = fromRow;
                blockCol = fromCol + (colDiff > 0 ? 1 : -1);
            }
            
            return !this.board[blockRow][blockCol];
        }
        return false;
    }
    
    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        // Must move horizontally or vertically
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // Check path is clear
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }
    
    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // Must move horizontally or vertically
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        const targetPiece = this.board[toRow][toCol];
        const jumpCount = this.countPiecesInPath(fromRow, fromCol, toRow, toCol);
        
        if (targetPiece) {
            // Capturing: must jump over exactly one piece
            return jumpCount === 1;
        } else {
            // Moving: path must be clear
            return jumpCount === 0;
        }
    }
    
    isValidSoldierMove(color, fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        // Can only move one step
        if (Math.abs(rowDiff) + colDiff !== 1) return false;
        
        if (color === 'red') {
            // Red soldiers move up (decreasing row)
            if (rowDiff > 0) return false; // Cannot move backward
            
            // Can move sideways only after crossing river
            if (colDiff === 1 && fromRow > 4) return false;
        } else {
            // Black soldiers move down (increasing row)
            if (rowDiff < 0) return false; // Cannot move backward
            
            // Can move sideways only after crossing river
            if (colDiff === 1 && fromRow < 5) return false;
        }
        
        return true;
    }
    
    isInPalace(row, col) {
        return (row >= 0 && row <= 2 && col >= 3 && col <= 5) ||
               (row >= 7 && row <= 9 && col >= 3 && col <= 5);
    }
    
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    countPiecesInPath(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
        
        let count = 0;
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) count++;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return count;
    }
    
    wouldCreateFlyingGeneral(fromRow, fromCol, toRow, toCol) {
        // Temporarily make the move
        const originalPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        const generals = this.findGenerals();
        let flyingGeneral = false;
        
        if (generals.red && generals.black && generals.red.col === generals.black.col) {
            // Check if there are no pieces between the generals
            flyingGeneral = this.isPathClear(generals.red.row, generals.red.col, generals.black.row, generals.black.col);
        }
        
        // Restore the board
        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = originalPiece;
        
        return flyingGeneral;
    }
    
    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        // Temporarily make the move
        const originalPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isInCheck(this.currentPlayer);
        
        // Restore the board
        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }
    
    isInCheck(color) {
        const general = this.findGeneral(color);
        if (!general) return false;
        
        const opponent = color === 'red' ? 'black' : 'red';
        
        // Check if any opponent piece can attack the general
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponent) {
                    if (this.canAttack(piece, row, col, general.row, general.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    canAttack(piece, fromRow, fromCol, toRow, toCol) {
        // Similar to isValidPieceMove but doesn't check for self-check
        return this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol);
    }
    
    findGeneral(color) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'general' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    findGenerals() {
        return {
            red: this.findGeneral('red'),
            black: this.findGeneral('black')
        };
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Save move for history
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null,
            player: this.currentPlayer
        };
        
        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Handle captured piece
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
            this.updateCapturedPieces();
        }
        
        // Add to move history
        this.moveHistory.push(move);
        this.updateMoveHistory();
        
        // Check for check/checkmate
        this.updateCheckStatus();
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.updateDisplay();
        
        // Check for game over
        if (this.isCheckmate(this.currentPlayer)) {
            this.endGame(this.currentPlayer === 'red' ? 'black' : 'red');
        }
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore the move
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
        
        // Restore captured piece
        if (lastMove.capturedPiece) {
            const capturedList = this.capturedPieces[lastMove.player];
            const index = capturedList.findIndex(p => 
                p.type === lastMove.capturedPiece.type && 
                p.color === lastMove.capturedPiece.color
            );
            if (index > -1) {
                capturedList.splice(index, 1);
            }
            this.updateCapturedPieces();
        }
        
        // Switch back to previous player
        this.currentPlayer = lastMove.player;
        
        this.updateMoveHistory();
        this.updateCheckStatus();
        this.updateDisplay();
        this.drawBoard();
    }
    
    updateCheckStatus() {
        this.inCheck.red = this.isInCheck('red');
        this.inCheck.black = this.isInCheck('black');
    }
    
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        
        // Try all possible moves to see if check can be escaped
        for (let fromRow = 0; fromRow < this.rows; fromRow++) {
            for (let fromCol = 0; fromCol < this.cols; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (!piece || piece.color !== color) continue;
                
                for (let toRow = 0; toRow < this.rows; toRow++) {
                    for (let toCol = 0; toCol < this.cols; toCol++) {
                        if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                            return false; // Found a valid move, not checkmate
                        }
                    }
                }
            }
        }
        
        return true; // No valid moves found, it's checkmate
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight);
        
        // Draw grid lines
        this.drawGrid();
        
        // Draw river
        this.drawRiver();
        
        // Draw palace markings
        this.drawPalaces();
        
        // Draw pieces
        this.drawPieces();
        
        // Highlight selected piece and valid moves
        if (this.selectedPiece) {
            this.highlightSelectedPiece();
            this.highlightValidMoves();
        }
        
        // Highlight check
        this.highlightCheck();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        
        // Horizontal lines
        for (let row = 0; row <= this.rows; row++) {
            if (row === 5) continue; // Skip river middle
            const y = this.marginY + row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.marginX, y);
            this.ctx.lineTo(this.marginX + (this.cols - 1) * this.cellSize, y);
            this.ctx.stroke();
        }
        
        // Vertical lines
        for (let col = 0; col < this.cols; col++) {
            const x = this.marginX + col * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.marginY);
            this.ctx.lineTo(x, this.marginY + 4 * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.marginY + 5 * this.cellSize);
            this.ctx.lineTo(x, this.marginY + 9 * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawRiver() {
        const riverY = this.marginY + 4.5 * this.cellSize;
        const riverHeight = this.cellSize;
        
        // River background
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        this.ctx.fillRect(this.marginX, riverY, (this.cols - 1) * this.cellSize, riverHeight);
        
        // River text
        this.ctx.fillStyle = '#4169E1';
        this.ctx.font = 'bold 24px serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('楚河', this.marginX + 2 * this.cellSize, riverY + riverHeight / 2 + 8);
        this.ctx.fillText('漢界', this.marginX + 6 * this.cellSize, riverY + riverHeight / 2 + 8);
    }
    
    drawPalaces() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        
        // Top palace (black)
        const topPalaceX = this.marginX + 3 * this.cellSize;
        const topPalaceY = this.marginY;
        this.ctx.beginPath();
        this.ctx.moveTo(topPalaceX, topPalaceY);
        this.ctx.lineTo(topPalaceX + 2 * this.cellSize, topPalaceY + 2 * this.cellSize);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(topPalaceX + 2 * this.cellSize, topPalaceY);
        this.ctx.lineTo(topPalaceX, topPalaceY + 2 * this.cellSize);
        this.ctx.stroke();
        
        // Bottom palace (red)
        const bottomPalaceX = this.marginX + 3 * this.cellSize;
        const bottomPalaceY = this.marginY + 7 * this.cellSize;
        this.ctx.beginPath();
        this.ctx.moveTo(bottomPalaceX, bottomPalaceY);
        this.ctx.lineTo(bottomPalaceX + 2 * this.cellSize, bottomPalaceY + 2 * this.cellSize);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(bottomPalaceX + 2 * this.cellSize, bottomPalaceY);
        this.ctx.lineTo(bottomPalaceX, bottomPalaceY + 2 * this.cellSize);
        this.ctx.stroke();
    }
    
    drawPieces() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.drawPiece(piece, row, col);
                }
            }
        }
    }
    
    drawPiece(piece, row, col) {
        const x = this.marginX + col * this.cellSize;
        const y = this.marginY + row * this.cellSize;
        const radius = 30;
        
        // Piece background
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Piece border
        this.ctx.strokeStyle = piece.color === 'red' ? '#DC143C' : '#2F4F4F';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Piece symbol
        this.ctx.fillStyle = piece.color === 'red' ? '#DC143C' : '#2F4F4F';
        this.ctx.font = 'bold 32px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const symbol = this.pieces[piece.color][piece.type].symbol;
        this.ctx.fillText(symbol, x, y);
    }
    
    highlightSelectedPiece() {
        if (!this.selectedPiece) return;
        
        const x = this.marginX + this.selectedPiece.col * this.cellSize;
        const y = this.marginY + this.selectedPiece.row * this.cellSize;
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 35, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    highlightValidMoves() {
        if (!this.selectedPiece) return;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                    const x = this.marginX + col * this.cellSize;
                    const y = this.marginY + row * this.cellSize;
                    
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.strokeStyle = '#00FF00';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    highlightCheck() {
        if (this.inCheck.red) {
            const general = this.findGeneral('red');
            if (general) {
                const x = this.marginX + general.col * this.cellSize;
                const y = this.marginY + general.row * this.cellSize;
                
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 5;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 40, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
        
        if (this.inCheck.black) {
            const general = this.findGeneral('black');
            if (general) {
                const x = this.marginX + general.col * this.cellSize;
                const y = this.marginY + general.row * this.cellSize;
                
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 5;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 40, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }
    
    updateDisplay() {
        // Update current player
        const playerElement = document.getElementById('current-player');
        playerElement.textContent = this.currentPlayer === 'red' ? 'Red (红)' : 'Black (黑)';
        playerElement.className = `player-name ${this.currentPlayer}`;
        
        // Update undo button
        document.getElementById('undo-move').disabled = this.moveHistory.length === 0;
    }
    
    updateCapturedPieces() {
        // Update captured by red
        const capturedByRedElement = document.getElementById('captured-by-red');
        capturedByRedElement.innerHTML = '';
        this.capturedPieces.red.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `captured-piece ${piece.color}`;
            pieceElement.textContent = this.pieces[piece.color][piece.type].symbol;
            capturedByRedElement.appendChild(pieceElement);
        });
        
        // Update captured by black
        const capturedByBlackElement = document.getElementById('captured-by-black');
        capturedByBlackElement.innerHTML = '';
        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `captured-piece ${piece.color}`;
            pieceElement.textContent = this.pieces[piece.color][piece.type].symbol;
            capturedByBlackElement.appendChild(pieceElement);
        });
    }
    
    updateMoveHistory() {
        const movesElement = document.getElementById('moves-list');
        movesElement.innerHTML = '';
        
        this.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = `move-item ${move.player}`;
            
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${index + 1}.`;
            
            const moveText = document.createElement('span');
            const fromPos = String.fromCharCode(97 + move.from.row) + (9 - move.from.col);
            const toPos = String.fromCharCode(97 + move.to.row) + (9 - move.to.col);
            const pieceSymbol = this.pieces[move.piece.color][move.piece.type].symbol;
            moveText.textContent = `${pieceSymbol} ${fromPos}-${toPos}`;
            
            moveElement.appendChild(moveNumber);
            moveElement.appendChild(moveText);
            movesElement.appendChild(moveElement);
        });
        
        // Scroll to bottom
        movesElement.scrollTop = movesElement.scrollHeight;
    }
    
    newGame() {
        this.initializeBoard();
        this.drawBoard();
        this.updateDisplay();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
    
    endGame(winner) {
        this.gameOver = true;
        document.getElementById('overlay-title').textContent = 'Game Over!';
        document.getElementById('overlay-message').textContent = 
            `${winner === 'red' ? 'Red (红)' : 'Black (黑)'} wins by checkmate!`;
        this.showOverlay();
    }
    
    showRules() {
        document.getElementById('rules-overlay').classList.remove('hidden');
    }
    
    hideRules() {
        document.getElementById('rules-overlay').classList.add('hidden');
    }
    
    showOverlay() {
        document.getElementById('game-overlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new ChineseChess();
});
