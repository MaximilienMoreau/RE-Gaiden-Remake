/**
 * TitleScene - Main title screen with menu
 */
class TitleScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.TITLE);
        this._menuIndex = 0;
        this._menuItems = [];
        this._canInput = false;
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        // Background - dark, atmospheric
        this._buildBackground(W, H);
        this._buildTitleText(W, H);
        this._buildMenu(W, H);
        this._buildFooter(W, H);

        // Start music
        AudioSynth.playBgm('title');

        // Input
        this._cursors = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.UP,
            down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        // Delay input to prevent accidental selection
        this.time.delayedCall(600, () => { this._canInput = true; });

        // Atmospheric flickering
        this._setupAtmosphere(W, H);
    }

    _buildBackground(W, H) {
        // Deep black background
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Grid of faint lines (data/tech feel)
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x0a1a28, 0.3);
        for (let x = 0; x < W; x += 40) {
            grid.beginPath(); grid.moveTo(x, 0); grid.lineTo(x, H); grid.strokePath();
        }
        for (let y = 0; y < H; y += 40) {
            grid.beginPath(); grid.moveTo(0, y); grid.lineTo(W, y); grid.strokePath();
        }

        // Blood red vignette at bottom
        const vignette = this.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x220000, 0x220000, 0.8);
        vignette.fillRect(0, H * 0.6, W, H * 0.4);

        // Umbrella-inspired logo (decorative)
        this._drawUmbrellaDecor(W, H);

        // Ship silhouette
        this._drawShipSilhouette(W, H);
    }

    _drawUmbrellaDecor(W, H) {
        const gfx = this.add.graphics();
        const cx = W / 2, cy = H * 0.18;
        const r = 45;

        gfx.lineStyle(2, 0x550000, 0.6);
        gfx.strokeCircle(cx, cy, r);
        gfx.lineStyle(1, 0x440000, 0.4);
        gfx.beginPath(); gfx.moveTo(cx - r, cy); gfx.lineTo(cx + r, cy); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(cx, cy - r); gfx.lineTo(cx, cy + r); gfx.strokePath();

        // Outer ring glow
        gfx.lineStyle(1, 0x880000, 0.2);
        gfx.strokeCircle(cx, cy, r + 8);
    }

    _drawShipSilhouette(W, H) {
        const gfx = this.add.graphics();
        const y = H * 0.75;

        // Ship hull
        gfx.fillStyle(0x0a0a12, 1);
        gfx.beginPath();
        gfx.moveTo(W * 0.05, y + 60);
        gfx.lineTo(W * 0.05, y);
        gfx.lineTo(W * 0.15, y - 10);
        gfx.lineTo(W * 0.5, y - 10);
        gfx.lineTo(W * 0.85, y - 5);
        gfx.lineTo(W * 0.95, y + 60);
        gfx.closePath();
        gfx.fillPath();

        // Superstructure
        gfx.fillStyle(0x0d0d1a, 1);
        gfx.fillRect(W * 0.35, y - 50, W * 0.3, 40);
        gfx.fillRect(W * 0.4, y - 80, W * 0.15, 30);
        gfx.fillRect(W * 0.45, y - 100, W * 0.05, 20);

        // Faint windows (some lit, ominously)
        for (let i = 0; i < 12; i++) {
            const wx = W * 0.15 + i * (W * 0.06);
            const wy = y - 5;
            const lit = Math.random() < 0.3;
            gfx.fillStyle(lit ? 0x884422 : 0x0a0a0a, 1);
            gfx.fillRect(wx, wy, 6, 5);
        }

        // Water
        gfx.fillStyle(0x040810, 1);
        gfx.fillRect(0, y + 60, W, H - y - 60);
        gfx.lineStyle(1, 0x0a1530, 0.4);
        for (let i = 0; i < 6; i++) {
            const wy = y + 70 + i * 12;
            gfx.beginPath();
            gfx.moveTo(0, wy + Math.sin(i) * 3);
            gfx.lineTo(W, wy + Math.cos(i) * 3);
            gfx.strokePath();
        }
    }

    _buildTitleText(W, H) {
        // "RESIDENT EVIL"
        this.add.text(W / 2, H * 0.35, 'RESIDENT EVIL', {
            fontSize: '14px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#8a0000',
            letterSpacing: 8,
        }).setOrigin(0.5);

        // "GAIDEN"
        this.add.text(W / 2, H * 0.43, 'GAIDEN', {
            fontSize: '52px',
            fontFamily: 'Oswald, sans-serif',
            fontStyle: 'bold',
            color: '#cc0000',
            letterSpacing: 12,
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0).setData('titleBig', true);

        // Glow tween
        const titleBig = this.children.getAll().find(c => c.getData && c.getData('titleBig'));
        if (titleBig) {
            this.tweens.add({
                targets: titleBig,
                alpha: 1,
                duration: 1200,
                ease: 'Power2',
            });
        }

        // "REMAKE" subtitle
        this.add.text(W / 2, H * 0.52, '— R E M A K E —', {
            fontSize: '11px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#555555',
            letterSpacing: 5,
        }).setOrigin(0.5);
    }

    _buildMenu(W, H) {
        const items = [
            { label: 'NEW GAME', action: 'new_game' },
            { label: 'LOAD GAME', action: 'load_game' },
            { label: 'OPTIONS', action: 'options' },
        ];

        const startY = H * 0.63;
        const spacing = 36;

        items.forEach((item, i) => {
            const container = this.add.container(W / 2, startY + i * spacing);

            // Selector bar (hidden by default)
            const bar = this.add.graphics();
            bar.fillStyle(0xcc0000, 0.15);
            bar.fillRect(-100, -14, 200, 28);
            bar.setVisible(i === 0);
            container.add(bar);

            // Arrow indicator
            const arrow = this.add.text(-80, 0, '>', {
                fontSize: '12px',
                fontFamily: 'Share Tech Mono',
                color: '#cc0000',
            }).setOrigin(0, 0.5).setVisible(i === 0);
            container.add(arrow);

            // Label
            const label = this.add.text(0, 0, item.label, {
                fontSize: '14px',
                fontFamily: 'Share Tech Mono, monospace',
                color: i === 0 ? '#ffffff' : '#888880',
            }).setOrigin(0.5);
            container.add(label);

            this._menuItems.push({ container, bar, arrow, label, action: item.action });
        });

        this._updateMenuSelection(0);
    }

    _buildFooter(W, H) {
        this.add.text(W / 2, H - 30, 'USSTRATCOM CLASSIFIED · OPERATION STARLIGHT', {
            fontSize: '9px',
            fontFamily: 'Share Tech Mono',
            color: '#2a2a2a',
            letterSpacing: 3,
        }).setOrigin(0.5);
    }

    _setupAtmosphere(W, H) {
        // Flicker effect on title area
        const flickerLine = this.add.graphics();
        flickerLine.fillStyle(0xcc0000, 0.05);
        flickerLine.fillRect(0, 0, W, 2);
        flickerLine.setY(H * 0.42);

        this.time.addEvent({
            delay: 3000 + Math.random() * 4000,
            loop: true,
            callback: () => {
                // Random "glitch" flicker
                this.tweens.add({
                    targets: flickerLine,
                    alpha: { from: 0, to: 0.3 },
                    duration: 50,
                    yoyo: true,
                    repeat: 2 + Math.floor(Math.random() * 4),
                });
            },
        });

        // Animated scanline
        const scanline = this.add.graphics();
        scanline.fillStyle(0xffffff, 0.02);
        scanline.fillRect(0, 0, W, 3);

        this.tweens.add({
            targets: scanline,
            y: { from: 0, to: H },
            duration: 4000,
            repeat: -1,
            ease: 'Linear',
        });
    }

    _updateMenuSelection(idx) {
        this._menuIndex = idx;
        this._menuItems.forEach((item, i) => {
            const selected = i === idx;
            item.bar.setVisible(selected);
            item.arrow.setVisible(selected);
            item.label.setColor(selected ? '#ffffff' : '#888880');
        });
    }

    update() {
        if (!this._canInput) return;

        const keys = this._cursors;

        if (Phaser.Input.Keyboard.JustDown(keys.up)) {
            AudioSynth.sfx('menu_select');
            this._updateMenuSelection(
                (this._menuIndex - 1 + this._menuItems.length) % this._menuItems.length
            );
        }

        if (Phaser.Input.Keyboard.JustDown(keys.down)) {
            AudioSynth.sfx('menu_select');
            this._updateMenuSelection(
                (this._menuIndex + 1) % this._menuItems.length
            );
        }

        if (Phaser.Input.Keyboard.JustDown(keys.enter) ||
            Phaser.Input.Keyboard.JustDown(keys.space)) {
            AudioSynth.sfx('menu_confirm');
            this._canInput = false;
            this._executeAction(this._menuItems[this._menuIndex].action);
        }
    }

    _executeAction(action) {
        switch (action) {
            case 'new_game':
                this._startNewGame();
                break;
            case 'load_game':
                this._showLoadMenu();
                break;
            case 'options':
                this._showOptions();
                break;
        }
    }

    _startNewGame() {
        SaveSystem.newGame();
        AudioSynth.stopBgm();
        this.cameras.main.fadeOut(800, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this.scene.start(CONFIG.SCENES.PROLOGUE);
            }
        });
    }

    _showLoadMenu() {
        // Check for saves
        const saves = [];
        for (let i = 0; i < CONFIG.SAVE_SLOT_COUNT; i++) {
            saves.push(SaveSystem.getSaveInfo(i));
        }

        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const modalElements = [];

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, W, H);
        modalElements.push(overlay);

        const panel = this.add.graphics();
        panel.fillStyle(0x0a0a14, 1);
        panel.fillRect(W / 2 - 200, H / 2 - 120, 400, 240);
        panel.lineStyle(1, 0x333, 1);
        panel.strokeRect(W / 2 - 200, H / 2 - 120, 400, 240);
        modalElements.push(panel);

        modalElements.push(this.add.text(W / 2, H / 2 - 100, 'SELECT SAVE FILE', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#888880', letterSpacing: 4,
        }).setOrigin(0.5));

        saves.forEach((save, i) => {
            const yy = H / 2 - 60 + i * 55;
            const color = save.exists ? '#c0b0a0' : '#444';
            const txt = this.add.text(W / 2, yy, save.exists ?
                `SLOT ${i + 1}  ·  ${save.room}  ·  ${save.formattedDate}` :
                `SLOT ${i + 1}  ·  [EMPTY]`,
                { fontSize: '11px', fontFamily: 'Share Tech Mono', color }
            ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
                if (save.exists) {
                    SaveSystem.load(i);
                    AudioSynth.stopBgm();
                    this.cameras.main.fadeOut(600, 0, 0, 0, (cam, progress) => {
                        if (progress === 1) {
                            this.scene.start(CONFIG.SCENES.GAME, {
                                fromSave: true,
                                roomId: SaveSystem.getState().player.currentRoom,
                            });
                        }
                    });
                }
            });
            modalElements.push(txt);
        });

        modalElements.push(this.add.text(W / 2, H / 2 + 95, '[ESC] BACK', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#444', letterSpacing: 3,
        }).setOrigin(0.5));

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const onEsc = () => {
            modalElements.forEach(e => e.destroy());
            escKey.off('down', onEsc);
            this._canInput = true;
        };
        escKey.on('down', onEsc);
    }

    _showOptions() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const modalElements = [];

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.9);
        overlay.fillRect(0, 0, W, H);
        modalElements.push(overlay);

        modalElements.push(this.add.text(W / 2, H / 2 - 80, 'OPTIONS', {
            fontSize: '14px', fontFamily: 'Share Tech Mono', color: '#888', letterSpacing: 5,
        }).setOrigin(0.5));

        modalElements.push(this.add.text(W / 2, H / 2, 'VOLUME: Use AudioSynth.masterGain.gain.value', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#555',
        }).setOrigin(0.5));

        modalElements.push(this.add.text(W / 2, H / 2 + 60, 'CONTROLS: WASD/ARROWS — Move\nE — Interact\nI — Inventory\nR — Reload\nSHIFT — Run\nSPACE — Action / Dodge (Combat)', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#666',
            align: 'center',
        }).setOrigin(0.5));

        modalElements.push(this.add.text(W / 2, H / 2 + 140, '[ESC] BACK', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#444',
        }).setOrigin(0.5));

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', () => {
            modalElements.forEach(e => e.destroy());
            this._canInput = true;
        });
    }
}
