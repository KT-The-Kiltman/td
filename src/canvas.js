const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let canvasSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 600);
canvas.width = canvasSize;
canvas.height = canvasSize;
canvas.style.width = `${canvasSize}px`;
canvas.style.height = `${canvasSize}px`;

let GRID_SIZE = 10;
let cellSize = canvasSize / GRID_SIZE;

// Draw the dark metallic grid
function drawGrid() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
}

// Draw neon cyan path with glow
function drawPath(path) {
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ff';
    ctx.beginPath();
    path.forEach(([row, col], i) => {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Render cyan towers
function drawTower(tower) {
    ctx.fillStyle = '#0ff';
    ctx.fillRect(tower.x - 10, tower.y - 10, 20, 20);
    if (tower.hp) { // AI towers in attacker mode
        ctx.fillStyle = '#f00';
        ctx.fillRect(tower.x - 10, tower.y + 10, 20 * (tower.hp / 20), 5);
    }
}

// Render magenta units
function drawUnit(unit) {
    ctx.fillStyle = '#f0f';
    ctx.fillRect(unit.x - 5, unit.y - 5, 10, 10);
    ctx.fillStyle = '#f00';
    ctx.fillRect(unit.x - 5, unit.y + 5, 10 * (unit.hp / (unit.hp > 30 ? 50 : 30)), 3);
}

// Render neon projectiles with trail
function drawProjectile(projectile) {
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPath(window.game.path);
    window.game.towers.forEach(drawTower);
    window.game.units.forEach(drawUnit);
    window.game.projectiles.filter(p => p.active).forEach(drawProjectile);
}
