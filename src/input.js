canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const gridX = col * cellSize + cellSize / 2;
    const gridY = row * cellSize + cellSize / 2;

    if (!window.game.selected || window.game.path.some(p => p[0] === row && p[1] === col)) return;

    if (window.game.gameMode === 'defender') {
        const tower = new Tower(window.game.selected, gridX, gridY);
        if (window.game.currency >= tower.cost) {
            window.game.currency -= tower.cost;
            window.game.towers.push(tower);
            window.game.selected = null;
        }
    } else {
        const unit = new Unit(window.game.selected, cellSize / 2, cellSize / 2);
        if (window.game.currency >= unit.cost) {
            window.game.currency -= unit.cost;
            window.game.units.push(unit);
            window.game.selected = null;
        }
    }
});
