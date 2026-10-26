/**
 * Interactable - Base class for interactive world objects (doors, items, triggers)
 */
class Interactable extends Phaser.GameObjects.Container {
    constructor(scene, tx, ty, type, data = {}) {
        const px = tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const py = ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        super(scene, px, py);

        this.tileX = tx;
        this.tileY = ty;
        this.interactType = type;
        this.data2 = data;
        this.isInteractable = true;
        this.interactRange = CONFIG.TILE_SIZE * 1.5;

        scene.add.existing(this);
        this._buildVisual();
    }

    _buildVisual() {
        switch (this.interactType) {
            case 'item':        this._buildItemVisual(); break;
            case 'door':        this._buildDoorVisual(); break;
            case 'save_point':  this._buildSaveVisual(); break;
            case 'examine':     this._buildExamineVisual(); break;
            case 'item_box':    this._buildItemBoxVisual(); break;
        }
    }

    _buildItemVisual() {
        const def = InventorySystem._getDef(this.data2.itemId);
        const isKey = def?.type === 'key';
        // Keys remain legible over actors and the darkness overlay.
        this.setDepth(isKey ? 55 : 6);
        const glow = this.scene.add.graphics();
        glow.fillStyle(isKey ? 0xffd35a : 0xffcc00, isKey ? 0.45 : 0.3);
        glow.fillCircle(0, 0, isKey ? 24 : 18);
        glow.lineStyle(2, 0xffdf80, 0.95);
        glow.strokeCircle(0, 0, isKey ? 21 : 15);
        this.add(glow);
        this._glow = glow;

        if (def && this.scene.textures.exists(def.icon)) {
            const icon = this.scene.add.image(0, 0, def.icon);
            icon.setDisplaySize(isKey ? 30 : 24, isKey ? 30 : 24);
            this.add(icon);
        } else {
            const dot = this.scene.add.graphics();
            dot.fillStyle(0xffcc00, 1);
            dot.fillCircle(0, 0, 7);
            this.add(dot);
        }
        if (isKey) {
            const name = this.scene.add.text(0, -34, def.name, {
                fontFamily: UITheme.font, fontSize: '10px', color: '#ffe69a',
                backgroundColor: '#10151f', padding: { x: 5, y: 3 },
                stroke: '#000000', strokeThickness: 2,
            }).setOrigin(0.5, 1);
            this.add(name);
            const pointer = this.scene.add.text(0, -29, '▼', {
                fontSize: '12px', color: '#ffdf80', stroke: '#000000', strokeThickness: 3,
            }).setOrigin(0.5);
            this.add(pointer);
        }
        this._pickupPrompt = this.scene.add.text(0, isKey ? -56 : -24, `[E] ${def?.name || 'Pick up'}`, {
            fontFamily: UITheme.font, fontSize: '10px', color: '#ffffff',
            backgroundColor: '#10151f', padding: { x: 5, y: 3 },
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5, 1).setVisible(false);
        this.add(this._pickupPrompt);
        this.scene.tweens.add({
            targets: glow, alpha: { from: 0.55, to: 1 },
            duration: 700, yoyo: true, repeat: -1,
        });
    }

    showInteractPrompt(visible) {
        this._pickupPrompt?.setVisible(visible);
    }

    _buildDoorVisual() {
        if (this.scene.textures.exists('door_closed')) {
            const img = this.scene.add.image(0, 0, 'door_closed');
            img.setDisplaySize(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            this.add(img);
            this._doorImg = img;
        }
    }

    _buildSaveVisual() {
        const glow = this.scene.add.graphics();
        glow.fillStyle(0x00ff88, 0.2);
        glow.fillCircle(0, 0, 28);
        this.add(glow);

        if (this.scene.textures.exists('typewriter')) {
            const img = this.scene.add.image(0, 0, 'typewriter');
            img.setDisplaySize(40, 32);
            this.add(img);
        }

        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.1, to: 0.4 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
        });
    }

    _buildExamineVisual() {
        // Small pulsing dot for examine points
    }

    _buildItemBoxVisual() {
        const box = this.scene.add.graphics();
        box.fillStyle(0x2a5040);
        box.fillRect(-18, -14, 36, 28);
        box.lineStyle(2, 0x00ff88, 0.8);
        box.strokeRect(-18, -14, 36, 28);
        this.add(box);
    }

    open() {
        if (this.interactType === 'door' && this._doorImg) {
            this._doorImg.setTexture('door_open');
        }
    }

    destroy() {
        super.destroy();
    }
}
