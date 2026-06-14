/**
 * Enemy - World-space enemy entity for the exploration scene
 */
class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, tx, ty, enemyId, enemyIndex, roomId) {
        const px = tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const py = ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        super(scene, px, py);

        this.tileX = tx;
        this.tileY = ty;
        this.enemyId = enemyId;
        this.enemyIndex = enemyIndex;
        this.roomId = roomId;

        const def = ENEMIES[enemyId.toUpperCase()] || Object.values(ENEMIES).find(e => e.id === enemyId);
        this.def = def;
        this.hp = def ? def.hp : 50;
        this.speed = def ? def.speed : 40;
        this.detectionRange = def ? def.detectionRange : 180;
        this.alive = true;

        this._state = 'idle'; // idle, alerted, chasing, attacking
        this._target = null;
        this._lastAttack = 0;
        this._alertTimer = 0;
        this._moveDir = new Phaser.Math.Vector2(0, 0);
        this._patrolDir = 1;
        this._patrolTimer = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(false);
        this.body.setSize(20, 28);

        this._buildVisual();
    }

    _buildVisual() {
        if (!this.def) return;
        const textureKey = this.def.sprite;

        if (this.scene.textures.exists(textureKey)) {
            this._sprite = this.scene.add.image(0, 0, textureKey);
            this._sprite.setDisplaySize(24, 36);
            this.add(this._sprite);
        } else {
            const g = this.scene.add.graphics();
            g.fillStyle(0x4a6a40);
            g.fillRect(-10, -16, 20, 32);
            this.add(g);
        }

        // Health bar (small)
        this._hpBarBg = this.scene.add.graphics();
        this._hpBarBg.fillStyle(0x111111, 0.8);
        this._hpBarBg.fillRect(-12, -22, 24, 4);
        this.add(this._hpBarBg);

        this._hpBar = this.scene.add.graphics();
        this.add(this._hpBar);
        this._updateHpBar();
    }

    _updateHpBar() {
        if (!this._hpBar || !this.def) return;
        this._hpBar.clear();
        const pct = Math.max(0, this.hp / this.def.hp);
        const col = pct > 0.5 ? 0x44cc44 : pct > 0.25 ? 0xffaa00 : 0xff2200;
        this._hpBar.fillStyle(col, 0.9);
        this._hpBar.fillRect(-12, -22, Math.floor(24 * pct), 4);
    }

    update(time, delta, player, walls) {
        if (!this.alive) return;

        const dt = delta / 1000;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // State machine
        switch (this._state) {
            case 'idle':
                this._doPatrol(dt);
                if (dist < this.detectionRange) {
                    this._state = 'alerted';
                    this._alertTimer = 0.5;
                    this._onAlert();
                }
                break;

            case 'alerted':
                this._alertTimer -= dt;
                this.body.setVelocity(0, 0);
                if (this._alertTimer <= 0) {
                    this._state = 'chasing';
                }
                break;

            case 'chasing':
                if (dist > this.detectionRange * 1.5) {
                    this._state = 'idle';
                    break;
                }
                this._chasePlayer(dx, dy, dist, dt);
                // Trigger combat when close enough
                if (dist < 48 && time - this._lastAttack > (this.def?.attackRate || 2000)) {
                    this._lastAttack = time;
                    this._triggerCombat();
                }
                break;
        }

        // Flip sprite based on movement
        if (this._sprite && this.body.velocity.x !== 0) {
            this._sprite.setFlipX(this.body.velocity.x < 0);
        }
    }

    _doPatrol(dt) {
        this._patrolTimer -= dt;
        if (this._patrolTimer <= 0) {
            this._patrolTimer = 1.5 + Math.random() * 2;
            this._patrolDir = Math.random() < 0.5 ? 1 : -1;
            const angle = Math.random() * Math.PI * 2;
            this._moveDir.set(Math.cos(angle), Math.sin(angle));
        }
        this.body.setVelocity(
            this._moveDir.x * this.speed * 0.3,
            this._moveDir.y * this.speed * 0.3
        );
    }

    _chasePlayer(dx, dy, dist, dt) {
        const nx = dx / dist;
        const ny = dy / dist;
        this.body.setVelocity(nx * this.speed, ny * this.speed);
    }

    _onAlert() {
        if (this._sprite) {
            this.scene.tweens.add({
                targets: this._sprite,
                tint: 0xff4400,
                duration: 200,
                yoyo: true,
            });
        }
        // "!" parented to the container so it follows the enemy as it moves.
        const alert = this.scene.add.text(0, -45, '!', {
            fontSize: '16px',
            fontFamily: 'Share Tech Mono',
            color: '#ff4400',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5);
        this.add(alert);
        this.scene.time.delayedCall(600, () => {
            if (alert.active) this.remove(alert, true);
        });
    }

    _triggerCombat() {
        // Tell the game scene to initiate combat
        EventSystem.emit('combat_triggered', {
            enemy: this,
            enemyId: this.enemyId,
            enemyIndex: this.enemyIndex,
            roomId: this.roomId,
        });
    }

    takeDamage(amount) {
        this.hp -= amount;
        this._updateHpBar();

        if (this._sprite) {
            this._sprite.setTint(0xff0000);
            this.scene.time.delayedCall(150, () => {
                if (this._sprite) this._sprite.clearTint();
            });
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.alive = false;
        this._state = 'dead';
        this.body.setVelocity(0, 0);

        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 8,
            duration: 600,
            onComplete: () => {
                // Leave blood pool
                if (this.scene.textures.exists('blood_pool')) {
                    const pool = this.scene.add.image(this.x, this.y, 'blood_pool');
                    pool.setDepth(0);
                    pool.setAlpha(0.7);
                }
                EventSystem.emit('enemy_killed', {
                    enemyId: this.enemyId,
                    enemyIndex: this.enemyIndex,
                    roomId: this.roomId,
                    x: this.x,
                    y: this.y,
                });
                this.destroy();
            },
        });
    }
}
