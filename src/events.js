document.getElementById('play-defender').addEventListener('click', () => {
    window.game.gameMode = 'defender';
    startGame();
});

document.getElementById('play-attacker').addEventListener('click', () => {
    window.game.gameMode = 'attacker';
    startGame();
});

document.getElementById('reset-game').addEventListener('click', () => {
    localStorage.clear();
    window.game.upgrades = {
        towerDamage: 0,
        towerRange: 0,
        towerSpeed: 0,
        unitDamage: 0,
        unitSpeed: 0,
        unitRange: 0,
        'laser turretLevel': 1,
        'plasma cannonLevel': 1,
        'emp disruptorLevel': 1,
        'droneLevel': 1,
        'mechLevel': 1,
        'stealth botLevel': 1
    };
    window.game.points = 0;
    window.game.level = 1;
    startGame();
});

document.addEventListener('keydown', e => {
    if (e.key === 'u' || e.key === 'U') {
        document.getElementById('upgrade-button').click();
    }
});
