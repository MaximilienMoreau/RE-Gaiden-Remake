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
        const glow = this.scene.add.graphics();
        glow.fillStyle(0xffcc00, 0.15);
        glow.fillCircle(0, 0, 20);
        this.add(glow);
        this._glow = glow;

        if (this.data2.itemId) {
            const def = ITEMS[this.data2.itemId?.toUpperCase()] ||
                        Object.values(ITEMS).find(i => i.id === this.data2.itemId);
            if (def && this.scene.textures.exists(def.icon)) {
                const icon = this.scene.add.image(0, 0, def.icon);
                icon.setDisplaySize(20, 20);
                this.add(icon);
            } else {
                const dot = this.scene.add.graphics();
                dot.fillStyle(0xffcc00, 0.9);
                dot.fillCircle(0, 0, 6);
                this.add(dot);
            }
        }

        // Pulse animation
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });
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
