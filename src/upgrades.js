const defaultUpgrades = {
    towerDamage: 0,
    towerRange: 0,
    towerSpeed: 0,
    unitDamage: 0,
    unitSpeed: 0,
    unitRange: 0,
    'laser turretLevel': 1, // Keep if per-type levels are intended
    'plasma cannonLevel': 1,
    'emp disruptorLevel': 1,
    'droneLevel': 1,
    'mechLevel': 1,
    'stealth botLevel': 1
};

const storedUpgrades = JSON.parse(localStorage.getItem('upgrades')) || {};
window.game.upgrades = { ...defaultUpgrades, ...storedUpgrades };

window.game.upgrades = JSON.parse(localStorage.getItem('upgrades')) || {
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

function updateUpgradesUI() {
    const opts = document.getElementById('upgrade-options');
    opts.innerHTML = '';
    const upgrades = window.game.gameMode === 'defender' ? [
        { id: 'towerDamage', name: 'Tower Damage +10%', cost: 50 },
        { id: 'towerRange', name: 'Tower Range +1', cost: 75 },
        { id: 'towerSpeed', name: 'Tower Speed +20%', cost: 60 }
    ] : [
        { id: 'unitDamage', name: 'Unit Damage +10%', cost: 40 },
        { id: 'unitSpeed', name: 'Unit Speed +10%', cost: 50 },
        { id: 'unitRange', name: 'Unit Range +1', cost: 60 }
    ];
    upgrades.forEach(u => {
        const btn = document.createElement('button');
        btn.textContent = `${u.name} (${u.cost}) [${window.game.upgrades[u.id]}]`;
        btn.onclick = () => {
            if (window.game.currency >= u.cost) {
                window.game.currency -= u.cost;
                window.game.upgrades[u.id]++;
                localStorage.setItem('upgrades', JSON.stringify(window.game.upgrades));
                updateUpgradesUI();
            }
        };
        opts.appendChild(btn);
    });
}

document.getElementById('upgrade-button').addEventListener('click', () => {
    document.getElementById('upgrade-menu').style.display = 'flex';
    updateUpgradesUI();
});

document.getElementById('close-upgrade').addEventListener('click', () => {
    document.getElementById('upgrade-menu').style.display = 'none';
});
