window.game = {
    gameMode: null,
    level: 1,
    wave: 0,
    maxWaves: 5,
    health: 20,
    currency: 0,
    points: 0,
    towers: [],
    units: [],
    projectiles: [],
    path: [],
    lastTime: 0,
    waveTimer: 0,
    gameTimer: 0 // For attacker mode
};

// Generate a random winding path
function generatePath() {
    const minLength = 10 + 2 * window.game.level;
    const path = [[0, 0]];
    let row = 0, col = 0;
    while (row < GRID_SIZE - 1 || col < GRID_SIZE - 1) {
        const moves = [];
        if (row < GRID_SIZE - 1) moves.push('down');
        if (col < GRID_SIZE - 1) moves.push('right');
        const move = moves[Math.floor(Math.random() * moves.length)];
        if (move === 'down') row++;
        else col++;
        path.push([row, col]);
        if (path.length >= minLength && row === GRID_SIZE - 1 && col === GRID_SIZE - 1) break;
    }
    window.game.path = path;
}

// Spawn a wave of enemies
function spawnWave() {
    const enemyCount = 5 + window.game.level * 2;
    const spawnInterval = 1000;
    let spawned = 0;
    const spawn = setInterval(() => {
        const type = ['Drone', 'Mech', 'Stealth Bot'][Math.floor(Math.random() * 3)];
        const unit = new Unit(type, cellSize / 2, cellSize / 2);
        unit.hp *= (1 + 0.1 * window.game.level); // Increase difficulty
        unit.speed *= (1 + 0.1 * window.game.level);
        window.game.units.push(unit);
        spawned++;
        if (spawned >= enemyCount) clearInterval(spawn);
    }, spawnInterval);
}

// Start the game
function startGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    GRID_SIZE = 10 + Math.floor(window.game.level / 2) * 2;
    cellSize = canvasSize / GRID_SIZE;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    generatePath();
    window.game.towers = [];
    window.game.units = [];
    window.game.projectiles = [];
    window.game.wave = 0;
    window.game.waveTimer = 0;
    window.game.health = 20;
    window.game.points = window.game.points || 0;

    const selBar = document.getElementById('selection-bar');
    selBar.innerHTML = '';
    if (window.game.gameMode === 'defender') {
        window.game.currency = 100;
        ['Laser Turret', 'Plasma Cannon', 'EMP Disruptor'].forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = `${type} (${new Tower(type, 0, 0).cost})`;
            btn.onclick = () => window.game.selected = type;
            selBar.appendChild(btn);
        });
    } else {
        window.game.currency = 50;
        window.game.gameTimer = 180000; // 180 seconds
        ['Drone', 'Mech', 'Stealth Bot'].forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = `${type} (${new Unit(type, 0, 0).cost})`;
            btn.onclick = () => window.game.selected = type;
            selBar.appendChild(btn);
        });
        // Spawn AI towers
        for (let i = 0; i < 3 + window.game.level; i++) {
            const type = ['Laser Turret', 'Plasma Cannon', 'EMP Disruptor'][Math.floor(Math.random() * 3)];
            const pos = window.game.path[Math.floor(Math.random() * (window.game.path.length - 1)) + 1];
            const tower = new Tower(type, pos[1] * cellSize + cellSize / 2, pos[0] * cellSize + cellSize / 2);
            tower.hp = 20; // AI towers have health
            window.game.towers.push(tower);
        }
    }
    window.game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(time) {
    const deltaTime = time - window.game.lastTime;
    window.game.lastTime = time;

    // Update game state
    if (window.game.gameMode === 'defender') {
        window.game.waveTimer += deltaTime;
        if (window.game.wave < window.game.maxWaves && window.game.waveTimer > 10000) {
            window.game.wave++;
            window.game.waveTimer = 0;
            spawnWave();
        }
        if (window.game.wave === window.game.maxWaves && window.game.units.length === 0) {
            window.game.level++;
            window.game.currency += 50;
            window.game.points += 20;
            startGame(); // Next level
            return;
        }
    } else {
        window.game.gameTimer -= deltaTime;
        if (window.game.gameTimer <= 0) {
            alert('Time’s up! You lose.');
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('title-screen').style.display = 'flex';
            return;
        }
    }

    // Update entities
    window.game.towers.forEach(tower => tower.attack(deltaTime));
    window.game.units.forEach(unit => {
        unit.move(deltaTime);
        unit.attack(deltaTime);
    });
    window.game.projectiles = window.game.projectiles.filter(p => {
        if (!p.active) return false;
        if (p.update(deltaTime)) {
            p.active = false;
            return false;
        }
        return true;
    });

    // Check win/lose conditions
    window.game.towers = window.game.towers.filter(t => !t.hp || t.hp > 0);
    window.game.units = window.game.units.filter(u => u.hp > 0);
    if (window.game.health <= 0) {
        if (window.game.gameMode === 'attacker') {
            alert('Server destroyed! You win!');
            window.game.level++;
            startGame();
        } else {
            alert('Server compromised! You lose.');
            document.getElementById('game-ui').style.display = 'none';
            document.getElementById('title-screen').style.display = 'flex';
        }
        return;
    }

    // Update HUD
    const currencyLabel = window.game.gameMode === 'defender' ? 'Crypto-Credits' : 'Data Chips';
    document.getElementById('currency').textContent = `${currencyLabel}: ${window.game.currency}`;
    document.getElementById('health').textContent = `Server Integrity: ${window.game.health}`;
    document.getElementById('wave-level').textContent = `Wave: ${window.game.wave}/${window.game.maxWaves} | Level: ${window.game.level}`;
    document.getElementById('points').textContent = `Points: ${window.game.points}`;

    render();
    requestAnimationFrame(gameLoop);
}
