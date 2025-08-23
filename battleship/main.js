// Simple Battleship - Player vs Computer
const SIZE = 10;
const SHIPS = [{name:'Carrier',size:5},{name:'Battleship',size:4},{name:'Cruiser',size:3},{name:'Submarine',size:3},{name:'Destroyer',size:2}];

let playerBoard, enemyBoard, playerShips, enemyShips, gameStarted, playerTurn, info;

function startGame() {
  playerBoard = Array(SIZE).fill().map(()=>Array(SIZE).fill(0));
  enemyBoard = Array(SIZE).fill().map(()=>Array(SIZE).fill(0));
  playerShips = [];
  enemyShips = [];
  gameStarted = false;
  playerTurn = true;
  info = document.getElementById('info');
  
  renderBoards();
  setInfo('Place your ships or use Random Setup');
  
  document.getElementById('random-setup').onclick = randomSetup;
  document.getElementById('start-game').onclick = startBattle;
}

function renderBoards() {
  renderBoard('player-board', playerBoard, true);
  renderBoard('enemy-board', enemyBoard, false);
}

function renderBoard(id, board, isPlayer) {
  const boardDiv = document.getElementById(id);
  boardDiv.innerHTML = '';
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.r = r;
    cell.dataset.c = c;
    
    const val = board[r][c];
    if(val === 1 && isPlayer) cell.classList.add('ship');
    else if(val === 2) cell.classList.add('hit');
    else if(val === 3) cell.classList.add('miss');
    else if(val === 4) cell.classList.add('sunk');
    
    if(!isPlayer && gameStarted) {
      cell.onclick = ()=>playerShoot(r,c);
    }
    
    boardDiv.appendChild(cell);
  }
}

function randomSetup() {
  playerBoard = Array(SIZE).fill().map(()=>Array(SIZE).fill(0));
  playerShips = [];
  
  for(const ship of SHIPS) {
    let placed = false;
    while(!placed) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horizontal ? SIZE : SIZE-ship.size+1));
      const c = Math.floor(Math.random() * (horizontal ? SIZE-ship.size+1 : SIZE));
      
      if(canPlaceShip(playerBoard, r, c, ship.size, horizontal)) {
        placeShip(playerBoard, r, c, ship.size, horizontal);
        playerShips.push({...ship, r, c, horizontal, hits:0});
        placed = true;
      }
    }
  }
  
  // Setup enemy ships
  enemyBoard = Array(SIZE).fill().map(()=>Array(SIZE).fill(0));
  enemyShips = [];
  for(const ship of SHIPS) {
    let placed = false;
    while(!placed) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horizontal ? SIZE : SIZE-ship.size+1));
      const c = Math.floor(Math.random() * (horizontal ? SIZE-ship.size+1 : SIZE));
      
      if(canPlaceShip(enemyBoard, r, c, ship.size, horizontal)) {
        placeShip(enemyBoard, r, c, ship.size, horizontal);
        enemyShips.push({...ship, r, c, horizontal, hits:0});
        placed = true;
      }
    }
  }
  
  renderBoards();
  setInfo('Ships placed! Click Start Game to begin.');
}

function canPlaceShip(board, r, c, size, horizontal) {
  for(let i=0;i<size;i++) {
    const nr = r + (horizontal ? 0 : i);
    const nc = c + (horizontal ? i : 0);
    if(nr>=SIZE || nc>=SIZE || board[nr][nc]) return false;
  }
  return true;
}

function placeShip(board, r, c, size, horizontal) {
  for(let i=0;i<size;i++) {
    const nr = r + (horizontal ? 0 : i);
    const nc = c + (horizontal ? i : 0);
    board[nr][nc] = 1;
  }
}

function startBattle() {
  if(playerShips.length !== SHIPS.length) {
    setInfo('Place all ships first!');
    return;
  }
  gameStarted = true;
  playerTurn = true;
  setInfo('Your turn! Click on enemy waters to shoot.');
  renderBoards();
}

function playerShoot(r, c) {
  if(!gameStarted || !playerTurn || enemyBoard[r][c] >= 2) return;
  
  if(enemyBoard[r][c] === 1) {
    enemyBoard[r][c] = 2; // Hit
    const ship = enemyShips.find(s => isPartOfShip(s, r, c));
    ship.hits++;
    
    if(ship.hits === ship.size) {
      markSunk(enemyBoard, ship);
      setInfo(`You sunk the ${ship.name}!`);
      if(enemyShips.every(s => s.hits === s.size)) {
        setInfo('You win! All enemy ships destroyed!');
        gameStarted = false;
        return;
      }
    } else {
      setInfo('Hit! Shoot again.');
    }
  } else {
    enemyBoard[r][c] = 3; // Miss
    setInfo('Miss! Enemy turn...');
    playerTurn = false;
    setTimeout(enemyTurn, 1000);
  }
  
  renderBoards();
}

function enemyTurn() {
  if(!gameStarted) return;
  
  let r, c;
  do {
    r = Math.floor(Math.random() * SIZE);
    c = Math.floor(Math.random() * SIZE);
  } while(playerBoard[r][c] >= 2);
  
  if(playerBoard[r][c] === 1) {
    playerBoard[r][c] = 2; // Hit
    const ship = playerShips.find(s => isPartOfShip(s, r, c));
    ship.hits++;
    
    if(ship.hits === ship.size) {
      markSunk(playerBoard, ship);
      setInfo(`Enemy sunk your ${ship.name}!`);
      if(playerShips.every(s => s.hits === s.size)) {
        setInfo('You lose! All your ships destroyed!');
        gameStarted = false;
        return;
      }
    } else {
      setInfo('Enemy hit your ship!');
    }
    setTimeout(enemyTurn, 1000);
  } else {
    playerBoard[r][c] = 3; // Miss
    setInfo('Enemy missed! Your turn.');
    playerTurn = true;
  }
  
  renderBoards();
}

function isPartOfShip(ship, r, c) {
  for(let i=0;i<ship.size;i++) {
    const nr = ship.r + (ship.horizontal ? 0 : i);
    const nc = ship.c + (ship.horizontal ? i : 0);
    if(nr === r && nc === c) return true;
  }
  return false;
}

function markSunk(board, ship) {
  for(let i=0;i<ship.size;i++) {
    const nr = ship.r + (ship.horizontal ? 0 : i);
    const nc = ship.c + (ship.horizontal ? i : 0);
    board[nr][nc] = 4;
  }
}

function setInfo(msg) { info.textContent = msg; }

window.onload = startGame;
