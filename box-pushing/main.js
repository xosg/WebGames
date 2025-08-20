// Sokoban (Box Pushing) Game
// 0: floor, 1: wall, 2: target, 3: box, 4: player

let currentLevel = 0;
let gameState;
let playerPos;
let moveCount = 0;
let completedLevels = new Set();

function initializeLevelList() {
    const levelList = document.getElementById('level-list');
    levelList.innerHTML = '';
    
    for (let i = 0; i < LEVELS.length; i++) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.innerHTML = `<strong>Level ${i + 1}</strong><br><small>${LEVELS[i].name}</small>`;
        button.onclick = () => selectLevel(i);
        button.setAttribute('data-level', i);
        
        if (i === currentLevel) {
            button.classList.add('active');
        }
        
        if (completedLevels.has(i)) {
            button.classList.add('completed');
        }
        
        li.appendChild(button);
        levelList.appendChild(li);
    }
}

function selectLevel(levelIndex) {
    currentLevel = levelIndex;
    restartGame();
}

function cloneLevel(level) {
    return level.map(row => row.slice());
}

function findPlayer(level) {
    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            if (level[y][x] === 4) return {x, y};
        }
    }
    return null;
}

function updateDisplay() {
    document.getElementById('level-display').textContent = `Level ${currentLevel + 1}: ${LEVELS[currentLevel].name}`;
    document.getElementById('moves-display').textContent = `Moves: ${moveCount}`;
    
    // Update sidebar buttons
    const buttons = document.querySelectorAll('#level-list button');
    buttons.forEach((button, index) => {
        button.classList.remove('active');
        if (index === currentLevel) {
            button.classList.add('active');
        }
        if (completedLevels.has(index)) {
            button.classList.add('completed');
        }
    });
    
    // Update navigation button states
    document.querySelector('button[onclick="previousLevel()"]').disabled = currentLevel === 0;
    document.querySelector('button[onclick="nextLevel()"]').disabled = currentLevel === LEVELS.length - 1;
}

function cloneLevel(level) {
    return level.map(row => row.slice());
}

function findPlayer(level) {
    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            if (level[y][x] === 4) return {x, y};
        }
    }
    return null;
}

function renderGame() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    for (let y = 0; y < gameState.length; y++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let x = 0; x < gameState[y].length; x++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell ';
            let v = gameState[y][x];
            if (v === 1) cellDiv.classList.add('wall');
            else if (v === 0) cellDiv.classList.add('floor');
            else if (v === 2) cellDiv.classList.add('target');
            else if (v === 3) cellDiv.classList.add('box');
            else if (v === 4) cellDiv.classList.add('player');
            else if (v === 5) cellDiv.classList.add('box-on-target');
            // Emoji for fun
            if (v === 1) cellDiv.textContent = '🧱';
            else if (v === 2) cellDiv.textContent = '⭐';
            else if (v === 3) cellDiv.textContent = '📦';
            else if (v === 4) cellDiv.textContent = '😀';
            else if (v === 5) cellDiv.textContent = '📦';
            rowDiv.appendChild(cellDiv);
        }
        container.appendChild(rowDiv);
    }
}

function isWin() {
    for (let y = 0; y < gameState.length; y++) {
        for (let x = 0; x < gameState[y].length; x++) {
            if (LEVELS[currentLevel].map[y][x] === 2 && gameState[y][x] !== 5) return false;
        }
    }
    return true;
}

function move(dx, dy) {
    let {x, y} = playerPos;
    let nx = x + dx, ny = y + dy;
    let nnx = x + 2*dx, nny = y + 2*dy;
    
    // Check bounds
    if (ny < 0 || ny >= gameState.length || nx < 0 || nx >= gameState[0].length) return;
    if (nny < 0 || nny >= gameState.length || nnx < 0 || nnx >= gameState[0].length) return;
    
    let next = gameState[ny][nx];
    if (next === 1) return; // wall
    if (next === 3 || next === 5) {
        // box or box-on-target
        let after = gameState[nny][nnx];
        if (after === 1 || after === 3 || after === 5) return;
        // Move box
        if (after === 2) gameState[nny][nnx] = 5;
        else gameState[nny][nnx] = 3;
        if (next === 5) gameState[ny][nx] = 2;
        else gameState[ny][nx] = 0;
    } else if (next === 2) {
        // move onto target
    } else if (next !== 0) {
        return;
    }
    // Move player
    if (LEVELS[currentLevel].map[y][x] === 2 && gameState[y][x] === 4) gameState[y][x] = 2;
    else gameState[y][x] = 0;
    gameState[ny][nx] = 4;
    playerPos = {x: nx, y: ny};
    moveCount++;
    updateDisplay();
    renderGame();
    if (isWin()) {
        setTimeout(() => {
            completedLevels.add(currentLevel);
            alert(`Level ${currentLevel + 1} "${LEVELS[currentLevel].name}" completed in ${moveCount} moves!`);
            updateDisplay(); // Update to show completion status
            if (currentLevel < LEVELS.length - 1) {
                nextLevel();
            } else {
                alert('Congratulations! You completed all levels!');
            }
        }, 100);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') move(0, -1);
    else if (e.key === 'ArrowDown') move(0, 1);
    else if (e.key === 'ArrowLeft') move(-1, 0);
    else if (e.key === 'ArrowRight') move(1, 0);
});

function restartGame() {
    gameState = cloneLevel(LEVELS[currentLevel].map);
    playerPos = findPlayer(gameState);
    moveCount = 0;
    updateDisplay();
    renderGame();
}

function nextLevel() {
    if (currentLevel < LEVELS.length - 1) {
        currentLevel++;
        restartGame();
    }
}

function previousLevel() {
    if (currentLevel > 0) {
        currentLevel--;
        restartGame();
    }
}

window.onload = function() {
    initializeLevelList();
    restartGame();
};
