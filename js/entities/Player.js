/**
 * Player - Barry Burton player entity
 */
class Player extends Phaser.GameObjects.Container {
    constructor(scene, tx, ty) {
        const px = tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const py = ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        super(scene, px, py);

        this.tileX = tx;
        this.tileY = ty;
        this.facing = 'down'; // up/down/left/right
        this.isMoving = false;
        this.isRunning = false;
        this._stepTimer = 0;
        this._animFrame = 0;
        this._animTimer = 0;

        // Flashlight
        this._flashlightAngle = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(18, 24);
        this.body.setOffset(-9, -8);

        this._buildVisual();
        this._setupInput(scene);
    }

    _buildVisual() {
        // Shadow
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(0, 10, 20, 8);
        this.add(shadow);

        // Main sprite
        if (this.scene.textures.exists('barry')) {
            this._sprite = this.scene.add.image(0, 0, 'barry');
            this._sprite.setDisplaySize(24, 36);
        } else {
            // Barry: tan/brown jacket, broader silhouette
            this._sprite = this.scene.add.graphics();
            this._sprite.fillStyle(0x7a3b2e); // rust-brown jacket
            this._sprite.fillRect(-11, -16, 22, 28);
            this._sprite.fillStyle(0x4a2a1e); // darker trousers
            this._sprite.fillRect(-9, 12, 18, 8);
        }
        this.add(this._sprite);

        // Flashlight cone (visual indicator of direction)
        this._flashlightGfx = this.scene.add.graphics();
        this.add(this._flashlightGfx);
        this._drawFlashlight();
    }

    _drawFlashlight() {
        if (!this._flashlightGfx) return;
        this._flashlightGfx.clear();
        this._flashlightGfx.setAlpha(0.12);
        this._flashlightGfx.fillStyle(0xffffcc, 1);

        const dirAngles = { right: 0, down: Math.PI * 0.5, left: Math.PI, up: Math.PI * 1.5 };
        const angle = dirAngles[this.facing] || 0;
        const spread = 0.45; // radians
        const length = 80;

        this._flashlightGfx.beginPath();
        this._flashlightGfx.moveTo(0, 0);
        this._flashlightGfx.arc(0, 0, length, angle - spread, angle + spread, false);
        this._flashlightGfx.closePath();
        this._flashlightGfx.fillPath();
    }

    _setupInput(scene) {
        this._keys = scene.input.keyboard.addKeys({
            up:     Phaser.Input.Keyboard.KeyCodes.W,
            down:   Phaser.Input.Keyboard.KeyCodes.S,
            left:   Phaser.Input.Keyboard.KeyCodes.A,
            right:  Phaser.Input.Keyboard.KeyCodes.D,
            up2:    Phaser.Input.Keyboard.KeyCodes.UP,
            down2:  Phaser.Input.Keyboard.KeyCodes.DOWN,
            left2:  Phaser.Input.Keyboard.KeyCodes.LEFT,
            right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            run:    Phaser.Input.Keyboard.KeyCodes.SHIFT,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
            inventory: Phaser.Input.Keyboard.KeyCodes.I,
            reload: Phaser.Input.Keyboard.KeyCodes.R,
        });
    }

    update(time, delta) {
        if (this._inputLocked) {
            this.body.setVelocity(0, 0);
            return;
        }

        const keys = this._keys;
        const running = keys.run.isDown;
        const speed = running ? CONFIG.PLAYER.RUN_SPEED : CONFIG.PLAYER.SPEED;

        let vx = 0, vy = 0;

        if (keys.left.isDown || keys.left2.isDown) { vx = -speed; this.facing = 'left'; }
        if (keys.right.isDown || keys.right2.isDown) { vx = speed; this.facing = 'right'; }
        if (keys.up.isDown || keys.up2.isDown) { vy = -speed; this.facing = 'up'; }
        if (keys.down.isDown || keys.down2.isDown) { vy = speed; this.facing = 'down'; }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.body.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);
        this.isRunning = running && this.isMoving;

        // Update tile position
        this.tileX = Math.floor(this.x / CONFIG.TILE_SIZE);
        this.tileY = Math.floor(this.y / CONFIG.TILE_SIZE);

        // Sprite direction
        if (this._sprite && this._sprite.setFlipX) {
            this._sprite.setFlipX(this.facing === 'left');
        }

        this._drawFlashlight();

        // Walk animation
        if (this.isMoving) {
            this._animTimer += delta;
            if (this._animTimer > 150) {
                this._animTimer = 0;
                this._animFrame = 1 - this._animFrame;
                if (this._sprite && this._sprite.setY) {
                    this._sprite.setY(this._animFrame === 1 ? -1 : 0);
                }
            }

            // Footstep sound
            this._stepTimer += delta;
            const stepInterval = running ? 280 : 420;
            if (this._stepTimer > stepInterval) {
                this._stepTimer = 0;
                AudioSynth.sfx('footstep');
            }
        } else {
            this._animFrame = 0;
            this._animTimer = 0;
            if (this._sprite && this._sprite.setY) {
                this._sprite.setY(0);
            }
        }

        // Interact key
        if (Phaser.Input.Keyboard.JustDown(keys.interact)) {
            EventSystem.emit('player_interact', { x: this.x, y: this.y });
        }

        // Inventory key
        if (Phaser.Input.Keyboard.JustDown(keys.inventory)) {
            EventSystem.emit('open_inventory', {});
        }

        // Reload key
        if (Phaser.Input.Keyboard.JustDown(keys.reload)) {
            EventSystem.emit('player_reload', {});
        }
    }

    lockInput(locked) {
        this._inputLocked = locked;
        if (locked) this.body.setVelocity(0, 0);
    }

    takeDamage(amount) {
        const state = SaveSystem.getState();
        if (!state) return;
        state.player.hp = Math.max(0, state.player.hp - amount);
        AudioSynth.sfx('player_hurt');
        EventSystem.emit('player_hp_changed', { hp: state.player.hp, hpMax: state.player.hpMax });

        // Hurt flash
        if (this._sprite && this._sprite.setTint) {
            this._sprite.setTint(0xff0000);
            this.scene.time.delayedCall(300, () => {
                if (this._sprite) this._sprite.clearTint();
            });
        }

        if (state.player.hp <= 0) {
            EventSystem.emit('player_dead', {});
        }
    }

    heal(amount) {
        const state = SaveSystem.getState();
        if (!state) return;
        state.player.hp = Math.min(state.player.hpMax, state.player.hp + amount);
        EventSystem.emit('player_hp_changed', { hp: state.player.hp, hpMax: state.player.hpMax });
    }
}
