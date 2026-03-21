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

        scene.add.existing(this);
        this._buildVisual();
        this._startIdleAnimation();
    }

    _buildVisual() {
        const textureKey = this.npcId.includes('barry') ? 'barry' :
                           this.npcId.includes('lucia') ? 'lucia' : 'leon';

        if (this.scene.textures.exists(textureKey)) {
            this._sprite = this.scene.add.image(0, 0, textureKey);
            this._sprite.setDisplaySize(24, 36);
            this.add(this._sprite);
        } else {
            // Fallback colored rectangle
            const colors = { barry: 0x6a2010, lucia: 0xe0d8d0, leon: 0x1a2040 };
            const col = colors[textureKey] || 0x888888;
            const g = this.scene.add.graphics();
            g.fillStyle(col);
            g.fillRect(-10, -16, 20, 32);
            this.add(g);
        }

        // Name label
        const npcNames = {
            barry: 'BARRY',
            barry_ambient: 'BARRY',
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
}
