/**
 * NPC - Non-player characters (Barry, Lucia)
 */
class NPC extends Phaser.GameObjects.Container {
    constructor(scene, tx, ty, npcId, dialogueId) {
        const px = tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const py = ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        super(scene, px, py);

        this.tileX = tx;
        this.tileY = ty;
        this.npcId = npcId;
        this.dialogueId = dialogueId;
        this.isInteractable = true;
        this.interactRange = CONFIG.TILE_SIZE * 2;
        this.hasSpoken = false;
        this.isFollowing = false;
        this._followSpeed = 65;
        this._attackRange = CONFIG.TILE_SIZE * 1.8;
        this._attackDamage = 30;
        this._attackCooldown = 0;
        this._companionDialogueId = null;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(18, 24);
        this.body.setOffset(-9, -8);
        this._buildVisual();
        this._startIdleAnimation();
    }

    _buildVisual() {
        const textureKey = this.npcId.includes('barry') ? 'barry' :
                           this.npcId.includes('lucia') ? 'lucia' : 'leon';

        // Shadow (same as player)
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(0, 10, 20, 8);
        this.add(shadow);

        if (this.scene.textures.exists(textureKey)) {
            this._sprite = this.scene.add.image(0, 0, textureKey);
            this._sprite.setDisplaySize(24, 36);
            this.add(this._sprite);
        } else {
            // Fallback colored rectangle — same proportions as Barry (22×36)
            const colors = { barry: 0x6a2010, lucia: 0xe0d8d0, leon: 0x1a2040 };
            const legColors = { barry: 0x3a1a10, lucia: 0xa0a0b0, leon: 0x0a1030 };
            const col = colors[textureKey] || 0x888888;
            const legCol = legColors[textureKey] || 0x555555;
            const g = this.scene.add.graphics();
            g.fillStyle(col);
            g.fillRect(-11, -16, 22, 28);
            g.fillStyle(legCol);
            g.fillRect(-9, 12, 18, 8);
            this.add(g);
        }

        // Name label
        const npcNames = {
            barry: 'BARRY',
            barry_ambient: 'BARRY',
            leon: 'LEON',
            lucia_first_meeting: 'LUCIA',
            lucia_lab: 'LUCIA',
        };
        const name = npcNames[this.npcId] || '';
        if (name) {
            this._nameLabel = this.scene.add.text(0, -26, name, {
                fontSize: '8px',
                fontFamily: 'Share Tech Mono, monospace',
                color: CONFIG.COLORS.TEXT_DIM,
                stroke: '#000',
                strokeThickness: 2,
            }).setOrigin(0.5);
            this.add(this._nameLabel);
        }

        // Interact indicator
        this._interactIcon = this.scene.add.text(0, -38, '[E]', {
            fontSize: '9px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#ffcc44',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5).setVisible(false);
        this.add(this._interactIcon);
    }

    _startIdleAnimation() {
        if (!this._sprite) return;
        this.scene.tweens.add({
            targets: this._sprite,
            y: { from: 0, to: -2 },
            duration: 1000 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    showInteractPrompt(visible) {
        if (this._interactIcon) this._interactIcon.setVisible(visible);
    }

    interact(gameScene) {
        if (this.dialogueId && DIALOGUES[this.dialogueId]) {
            gameScene.scene.launch(CONFIG.SCENES.DIALOGUE, {
                dialogueId: this.dialogueId,
                npcId: this.npcId,
                callerScene: CONFIG.SCENES.GAME,
            });
            this.hasSpoken = true;
        }
    }

    update(time, delta, player, enemies) {
        if (!this.isFollowing || !player) {
            if (this.body) this.body.setVelocity(0, 0);
            return;
        }

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const minDist = CONFIG.TILE_SIZE * 1.5;

        if (dist > minDist) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.body.setVelocity(
                Math.cos(angle) * this._followSpeed,
                Math.sin(angle) * this._followSpeed
            );
        } else {
            this.body.setVelocity(0, 0);
        }

        this._attackCooldown -= delta;
        if (this._attackCooldown <= 0) {
            for (const enemy of enemies) {
                if (!enemy || !enemy.alive) continue;
                const eDist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (eDist < this._attackRange) {
                    enemy.takeDamage(this._attackDamage);
                    this._attackCooldown = 1500;
                    break;
                }
            }
        }
    }
}
