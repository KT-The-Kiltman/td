class Tower {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.damage = 10; // Adjust base stats as needed
        this.range = 100;
        this.attackSpeed = 1000;

        if (window.game.gameMode === 'defender') {
            this.level = window.game.upgrades[`${type.toLowerCase()}Level`] || 1;
            this.damage *= (1 + 0.1 * (window.game.upgrades.towerDamage || 0));
            this.range += (window.game.upgrades.towerRange || 0) * cellSize;
            this.attackSpeed /= (1 + 0.2 * (window.game.upgrades.towerSpeed || 0));
        } else {
            this.level = 1;
        }
    }


    // Attack enemies within range
    attack(deltaTime) {
        const now = Date.now();
        if (now - this.lastAttack < this.attackSpeed) return;
        const target = window.game.units.find(unit => {
            const dx = unit.x - this.x;
            const dy = unit.y - this.y;
            return Math.sqrt(dx * dx + dy * dy) <= this.range && unit.hp > 0;
        });
        if (target) {
            const projectile = getProjectile(this.x, this.y, target, this.damage, this.type === 'EMP Disruptor' ? 'slow' : null);
            window.game.projectiles.push(projectile);
            this.lastAttack = now;
        }
    }
}

class Unit {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.pathIndex = 0;
        this.level = window.game.upgrades[`${type.toLowerCase()}Level`] || 1;
        const baseStats = {
            'Drone': { speed: 50, hp: 20, damage: 5, range: 80, cost: 10 },
            'Mech': { speed: 30, hp: 50, damage: 10, range: 60, cost: 20 },
            'Stealth Bot': { speed: 40, hp: 30, damage: 8, range: 70, cost: 15 }
        }[type];
        this.speed = baseStats.speed * (1 + 0.1 * window.game.upgrades.unitSpeed);
        this.hp = baseStats.hp;
        this.damage = baseStats.damage * (1 + 0.1 * window.game.upgrades.unitDamage);
        this.range = baseStats.range + window.game.upgrades.unitRange * cellSize;
        this.cost = baseStats.cost;
        this.lastAttack = 0;
    }

    // Move along the path
    move(deltaTime) {
        if (this.pathIndex >= window.game.path.length - 1) {
            if (window.game.gameMode === 'attacker') {
                window.game.health -= 5; // Damage server
                window.game.currency += 100;
                window.game.points += 50;
            } else {
                window.game.health -= 1;
            }
            this.hp = 0; // Remove unit
            return;
        }
        const next = window.game.path[this.pathIndex + 1];
        const tx = next[1] * cellSize + cellSize / 2;
        const ty = next[0] * cellSize + cellSize / 2;
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const move = this.speed * (deltaTime / 1000);
        if (dist <= move) {
            this.x = tx;
            this.y = ty;
            this.pathIndex++;
        } else {
            const angle = Math.atan2(dy, dx);
            this.x += move * Math.cos(angle);
            this.y += move * Math.sin(angle);
        }
    }

    // Attack towers within range (attacker mode)
    attack(deltaTime) {
        if (window.game.gameMode !== 'attacker') return;
        const now = Date.now();
        if (now - this.lastAttack < 1000) return;
        const target = window.game.towers.find(tower => {
            const dx = tower.x - this.x;
            const dy = tower.y - this.y;
            return Math.sqrt(dx * dx + dy * dy) <= this.range && tower.hp > 0;
        });
        if (target) {
            const projectile = getProjectile(this.x, this.y, target, this.damage, null);
            window.game.projectiles.push(projectile);
            this.lastAttack = now;
        }
    }
}

class Projectile {
    constructor(x, y, target, damage, effect) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.effect = effect;
        this.speed = 200;
    }

    // Move toward target and apply damage/effect on hit
    update(deltaTime) {
        if (!this.target || this.target.hp <= 0) return true; // Projectile done
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const move = this.speed * (deltaTime / 1000);
        if (dist <= 5) {
            this.target.hp -= this.damage;
            if (this.effect === 'slow' && this.target.speed) this.target.speed *= 0.5;
            return true; // Hit target
        }
        const angle = Math.atan2(dy, dx);
        this.x += move * Math.cos(angle);
        this.y += move * Math.sin(angle);
        return false;
    }
}

// Object pooling for projectiles
const projectilePool = [];
function getProjectile(x, y, target, damage, effect) {
    let p = projectilePool.find(p => !p.active);
    if (!p) {
        p = new Projectile(x, y, target, damage, effect);
        projectilePool.push(p);
    } else {
        p.x = x;
        p.y = y;
        p.target = target;
        p.damage = damage;
        p.effect = effect;
    }
    p.active = true;
    return p;
}
