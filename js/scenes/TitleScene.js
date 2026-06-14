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

        this._buildBackground(W, H);
        this._buildTitleBlock(W, H);
        this._buildMenuPanel(W, H);
        this._buildFooter(W, H);

        AudioSynth.playBgm('title');

        this._cursors = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.UP,
            down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
            w:     Phaser.Input.Keyboard.KeyCodes.W,
            s:     Phaser.Input.Keyboard.KeyCodes.S,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.time.delayedCall(600, () => { this._canInput = true; });
        this._setupAtmosphere(W, H);
    }

    // ─── BACKGROUND ──────────────────────────────────────────────────────────

    _buildBackground(W, H) {
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Subtle grid
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x07100a, 0.35);
        for (let x = 0; x < W; x += 32) {
            grid.beginPath(); grid.moveTo(x, 0); grid.lineTo(x, H); grid.strokePath();
        }
        for (let y = 0; y < H; y += 32) {
            grid.beginPath(); grid.moveTo(0, y); grid.lineTo(W, y); grid.strokePath();
        }

        this._drawShipSilhouette(W, H);

        // Red horizon fog
        const fog = this.add.graphics();
        fog.fillGradientStyle(0x000000, 0x000000, 0x180000, 0x180000, 0.0, 0.0, 1.0, 1.0);
        fog.fillRect(0, H * 0.55, W, H * 0.22);

        // Deep water
        fog.fillStyle(0x010204, 1);
        fog.fillRect(0, H * 0.79, W, H * 0.21);
    }

    _drawShipSilhouette(W, H) {
        const gfx = this.add.graphics();
        const baseY = H * 0.72;

        // Hull
        gfx.fillStyle(0x07070f, 1);
        gfx.beginPath();
        gfx.moveTo(W * 0.02, baseY + 80);
        gfx.lineTo(W * 0.02, baseY + 5);
        gfx.lineTo(W * 0.09, baseY - 8);
        gfx.lineTo(W * 0.91, baseY - 8);
        gfx.lineTo(W * 0.98, baseY + 5);
        gfx.lineTo(W * 0.98, baseY + 80);
        gfx.closePath();
        gfx.fillPath();

        // Bridge block
        gfx.fillStyle(0x09091a, 1);
        gfx.fillRect(W * 0.30, baseY - 56, W * 0.40, 48);
        gfx.fillRect(W * 0.37, baseY - 92, W * 0.26, 36);
        gfx.fillRect(W * 0.43, baseY - 120, W * 0.14, 28);

        // Funnel / chimney
        gfx.fillStyle(0x050510, 1);
        gfx.fillRect(W * 0.455, baseY - 150, W * 0.055, 30);
        gfx.fillRect(W * 0.516, baseY - 138, W * 0.028, 18);

        // Crane arm
        gfx.lineStyle(1, 0x08080f, 1);
        gfx.beginPath(); gfx.moveTo(W * 0.63, baseY - 56); gfx.lineTo(W * 0.63, baseY - 106); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(W * 0.63, baseY - 106); gfx.lineTo(W * 0.74, baseY - 82); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(W * 0.63, baseY - 98);  gfx.lineTo(W * 0.54, baseY - 76); gfx.strokePath();

        // Hull port-holes (some lit red)
        const litHull = [2, 6, 12, 15];
        for (let i = 0; i < 19; i++) {
            const wx = W * 0.10 + i * W * 0.044;
            gfx.fillStyle(litHull.includes(i) ? 0xaa2200 : 0x080808, 1);
            gfx.fillRect(wx, baseY - 3, 5, 4);
        }

        // Bridge windows
        const litBridge = [1, 4];
        for (let i = 0; i < 6; i++) {
            gfx.fillStyle(litBridge.includes(i) ? 0x661a00 : 0x070707, 1);
            gfx.fillRect(W * 0.32 + i * W * 0.058, baseY - 48, 8, 6);
        }

        // Water with ripples
        gfx.fillStyle(0x010306, 1);
        gfx.fillRect(0, baseY + 80, W, H);

        gfx.lineStyle(1, 0x08121e, 0.5);
        for (let i = 0; i < 5; i++) {
            const wy = baseY + 94 + i * 14;
            gfx.beginPath();
            gfx.moveTo(0,        wy + Math.sin(i * 0.9) * 3);
            gfx.lineTo(W * 0.35, wy - 2);
            gfx.lineTo(W * 0.65, wy + 2);
            gfx.lineTo(W,        wy + Math.cos(i * 0.7) * 2);
            gfx.strokePath();
        }
    }

    // ─── TITLE BLOCK ─────────────────────────────────────────────────────────

    _buildTitleBlock(W, H) {
        this._drawUmbrellaLogo(W * 0.5, H * 0.11, 34);

        // Rule under logo
        const r1 = this.add.graphics();
        r1.lineStyle(1, 0x550000, 0.5);
        r1.beginPath(); r1.moveTo(W * 0.5 - 200, H * 0.195); r1.lineTo(W * 0.5 + 200, H * 0.195); r1.strokePath();

        // "RESIDENT EVIL"
        this.add.text(W / 2, H * 0.225, 'R E S I D E N T   E V I L', {
            fontSize: '16px', fontFamily: 'Share Tech Mono, monospace',
            color: '#880000', letterSpacing: 3,
        }).setOrigin(0.5);

        // "GAIDEN"
        const gaiden = this.add.text(W / 2, H * 0.35, 'GAIDEN', {
            fontSize: '76px', fontFamily: 'Oswald, Impact, sans-serif',
            fontStyle: 'bold', color: '#cc1100', letterSpacing: 16,
            stroke: '#000000', strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 24, fill: true },
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: gaiden, alpha: 1, duration: 1400, ease: 'Power2' });

        // "REMAKE"
        this.add.text(W / 2, H * 0.475, '—   R E M A K E   —', {
            fontSize: '12px', fontFamily: 'Share Tech Mono, monospace',
            color: '#3a3a38', letterSpacing: 6,
        }).setOrigin(0.5);

        // Rule under subtitle
        const r2 = this.add.graphics();
        r2.lineStyle(1, 0x280000, 0.4);
        r2.beginPath(); r2.moveTo(W * 0.5 - 110, H * 0.51); r2.lineTo(W * 0.5 + 110, H * 0.51); r2.strokePath();
    }

    _drawUmbrellaLogo(cx, cy, r) {
        const gfx = this.add.graphics();

        // Outer glow ring
        gfx.lineStyle(1, 0x330000, 0.25);
        gfx.strokeCircle(cx, cy, r + 7);

        // Main ring
        gfx.lineStyle(2, 0x880000, 0.65);
        gfx.strokeCircle(cx, cy, r);

        // Horizontal divider
        gfx.beginPath(); gfx.moveTo(cx - r, cy); gfx.lineTo(cx + r, cy); gfx.strokePath();

        // 6 spokes (upper half only — canonical Umbrella logo)
        for (let i = 0; i < 6; i++) {
            const angle = -Math.PI + (Math.PI / 6) * (2 * i + 1);
            gfx.beginPath();
            gfx.moveTo(cx, cy);
            gfx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            gfx.strokePath();
        }

        // Faint fill on upper half
        gfx.fillStyle(0x440000, 0.07);
        gfx.fillCircle(cx, cy - r / 2, r / 2 + 2);
    }

    // ─── MENU PANEL ──────────────────────────────────────────────────────────

    _buildMenuPanel(W, H) {
        const panelW = 300;
        const panelH = 168;
        const panelX = W / 2 - panelW / 2;
        const panelY = H * 0.545;

        // Panel background + border
        const panel = this.add.graphics();
        panel.fillStyle(0x020406, 0.95);
        panel.fillRect(panelX, panelY, panelW, panelH);
        panel.lineStyle(1, 0x2a0000, 0.9);
        panel.strokeRect(panelX, panelY, panelW, panelH);

        // Corner accents
        const cL = 13;
        panel.lineStyle(2, 0x880000, 0.9);
        [ [panelX, panelY, 1, 1], [panelX + panelW, panelY, -1, 1],
          [panelX, panelY + panelH, 1, -1], [panelX + panelW, panelY + panelH, -1, -1] ]
        .forEach(([px, py, dx, dy]) => {
            panel.beginPath();
            panel.moveTo(px, py + dy * cL); panel.lineTo(px, py); panel.lineTo(px + dx * cL, py);
            panel.strokePath();
        });

        const items = [
            { label: 'NOUVELLE PARTIE', action: 'new_game' },
            { label: 'CHARGER',         action: 'load_game' },
            { label: 'OPTIONS',          action: 'options' },
        ];

        const itemStartY = panelY + 34;
        const spacing = 44;

        items.forEach((item, i) => {
            const cy = itemStartY + i * spacing;

            // Selector bar
            const bar = this.add.graphics();
            bar.fillStyle(0xcc0000, 0.10);
            bar.fillRect(panelX + 6, cy - 16, panelW - 12, 32);
            bar.lineStyle(1, 0x770000, 0.5);
            bar.strokeRect(panelX + 6, cy - 16, panelW - 12, 32);
            bar.setVisible(i === 0);

            // Brackets
            const bL = this.add.text(panelX + 22, cy, '[', {
                fontSize: '15px', fontFamily: 'Share Tech Mono', color: '#880000',
            }).setOrigin(0, 0.5).setVisible(i === 0);
            const bR = this.add.text(panelX + panelW - 22, cy, ']', {
                fontSize: '15px', fontFamily: 'Share Tech Mono', color: '#880000',
            }).setOrigin(1, 0.5).setVisible(i === 0);

            // Label
            const label = this.add.text(W / 2, cy, item.label, {
                fontSize: '13px', fontFamily: 'Share Tech Mono, monospace',
                color: i === 0 ? '#e0d8c8' : '#484840', letterSpacing: 3,
            }).setOrigin(0.5, 0.5);

            this._menuItems.push({ bar, bL, bR, label, action: item.action });
        });

        this._updateMenuSelection(0);
    }

    // ─── FOOTER ──────────────────────────────────────────────────────────────

    _buildFooter(W, H) {
        this.add.text(W / 2, H - 40, '↑ ↓  /  W S  —  Naviguer     ENTRÉE  —  Confirmer', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#242420', letterSpacing: 2,
        }).setOrigin(0.5);

        this.add.text(W / 2, H - 22, 'U S S T R A T C O M   ·   O P É R A T I O N   S T A R L I G H T   ·   C L A S S I F I É', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#171512', letterSpacing: 2,
        }).setOrigin(0.5);
    }

    // ─── ATMOSPHERE ──────────────────────────────────────────────────────────

    _setupAtmosphere(W, H) {
        // Slow scanline
        const scanline = this.add.graphics();
        scanline.fillStyle(0xffffff, 0.012);
        scanline.fillRect(0, 0, W, 4);
        this.tweens.add({ targets: scanline, y: { from: 0, to: H }, duration: 5500, repeat: -1, ease: 'Linear' });

        // Occasional red glitch flicker near GAIDEN
        const flick = this.add.graphics();
        flick.fillStyle(0xcc0000, 0.04);
        flick.fillRect(0, 0, W, 4);
        flick.setY(H * 0.39).setAlpha(0);
        this.time.addEvent({
            delay: 4000 + Math.random() * 4000, loop: true,
            callback: () => {
                this.tweens.add({
                    targets: flick, alpha: { from: 0, to: 0.5 },
                    duration: 55, yoyo: true, repeat: 2 + Math.floor(Math.random() * 3),
                });
            },
        });

        // Pulse the active menu label
        this.time.addEvent({
            delay: 1100, loop: true,
            callback: () => {
                const item = this._menuItems[this._menuIndex];
                if (!item) return;
                this.tweens.add({
                    targets: item.label, alpha: { from: 1, to: 0.55 },
                    duration: 200, yoyo: true,
                });
            },
        });
    }

    // ─── MENU LOGIC ──────────────────────────────────────────────────────────

    _updateMenuSelection(idx) {
        this._menuIndex = idx;
        this._menuItems.forEach((item, i) => {
            const sel = i === idx;
            item.bar.setVisible(sel);
            item.bL.setVisible(sel);
            item.bR.setVisible(sel);
            item.label.setColor(sel ? '#e0d8c8' : '#484840').setAlpha(1);
        });
    }

    update() {
        if (!this._canInput) return;
        const k = this._cursors;

        if (Phaser.Input.Keyboard.JustDown(k.up) || Phaser.Input.Keyboard.JustDown(k.w)) {
            AudioSynth.sfx('menu_select');
            this._updateMenuSelection((this._menuIndex - 1 + this._menuItems.length) % this._menuItems.length);
        }
        if (Phaser.Input.Keyboard.JustDown(k.down) || Phaser.Input.Keyboard.JustDown(k.s)) {
            AudioSynth.sfx('menu_select');
            this._updateMenuSelection((this._menuIndex + 1) % this._menuItems.length);
        }
        if (Phaser.Input.Keyboard.JustDown(k.enter) || Phaser.Input.Keyboard.JustDown(k.space)) {
            AudioSynth.sfx('menu_confirm');
            this._canInput = false;
            this._executeAction(this._menuItems[this._menuIndex].action);
        }
    }

    _executeAction(action) {
        switch (action) {
            case 'new_game':  this._startNewGame(); break;
            case 'load_game': this._showLoadMenu();  break;
            case 'options':   this._showOptions();   break;
        }
    }

    _startNewGame() {
        SaveSystem.newGame();
        AudioSynth.stopBgm();
        this.cameras.main.fadeOut(800, 0, 0, 0, (cam, progress) => {
            if (progress === 1) this.scene.start(CONFIG.SCENES.PROLOGUE);
        });
    }

    // ─── LOAD MODAL ──────────────────────────────────────────────────────────

    _showLoadMenu() {
        const saves = [];
        for (let i = 0; i < CONFIG.SAVE_SLOT_COUNT; i++) saves.push(SaveSystem.getSaveInfo(i));

        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const modal = [];
        const pW = 520, pH = 290;
        const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;

        // Overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.88);
        overlay.fillRect(0, 0, W, H);
        modal.push(overlay);

        // Panel
        modal.push(...this._drawPanel(pX, pY, pW, pH));

        modal.push(this.add.text(W / 2, pY + 20, 'SÉLECTIONNER UN FICHIER', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#555550', letterSpacing: 5,
        }).setOrigin(0.5));

        modal.push(...this._divider(pX + 20, pY + 42, pW - 40));

        saves.forEach((save, i) => {
            const sy = pY + 58 + i * 68;
            const ex = save.exists;

            const bg = this.add.graphics();
            bg.fillStyle(ex ? 0x08080e : 0x040405, 1);
            bg.fillRect(pX + 16, sy, pW - 32, 56);
            bg.lineStyle(1, ex ? 0x1c1c28 : 0x0d0d0d, 1);
            bg.strokeRect(pX + 16, sy, pW - 32, 56);
            modal.push(bg);

            modal.push(this.add.text(pX + 30, sy + 9, `SLOT  ${i + 1}`, {
                fontSize: '10px', fontFamily: 'Share Tech Mono',
                color: ex ? '#7a5c3a' : '#2a2a28', letterSpacing: 3,
            }));

            if (ex) {
                modal.push(this.add.text(pX + 110, sy + 9, save.room, {
                    fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#b8a888',
                }));
                modal.push(this.add.text(pX + 30, sy + 32, save.formattedDate, {
                    fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#3a3a38',
                }));
                const hpPct = save.hp / save.hpMax;
                modal.push(this.add.text(pX + pW - 130, sy + 9, `HP  ${save.hp} / ${save.hpMax}`, {
                    fontSize: '10px', fontFamily: 'Share Tech Mono',
                    color: hpPct > 0.5 ? '#448844' : hpPct > 0.25 ? '#aa8822' : '#cc3322',
                }));
                const actLabel = (save.act || 'act1').replace('act', 'ACT ').toUpperCase();
                modal.push(this.add.text(pX + pW - 130, sy + 32, actLabel, {
                    fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#3a4c5c',
                }));

                const hitArea = this.add.rectangle(pX + pW / 2, sy + 28, pW - 32, 56, 0x000000, 0)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => { bg.clear(); bg.fillStyle(0x12080a, 1); bg.fillRect(pX + 16, sy, pW - 32, 56); bg.lineStyle(1, 0x440000, 1); bg.strokeRect(pX + 16, sy, pW - 32, 56); })
                    .on('pointerout',  () => { bg.clear(); bg.fillStyle(0x08080e, 1); bg.fillRect(pX + 16, sy, pW - 32, 56); bg.lineStyle(1, 0x1c1c28, 1); bg.strokeRect(pX + 16, sy, pW - 32, 56); })
                    .on('pointerdown', () => {
                        SaveSystem.load(i);
                        AudioSynth.stopBgm();
                        this.cameras.main.fadeOut(600, 0, 0, 0, (cam, p) => {
                            if (p === 1) this.scene.start(CONFIG.SCENES.GAME, { fromSave: true, roomId: SaveSystem.getState().player.currentRoom });
                        });
                    });
                modal.push(hitArea);
            } else {
                modal.push(this.add.text(pX + 110, sy + 20, '[ VIDE ]', {
                    fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#1e1e1c',
                }));
            }
        });

        modal.push(this.add.text(W / 2, pY + pH - 16, '[ESC]  Retour', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#2c2c2a', letterSpacing: 3,
        }).setOrigin(0.5));

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const onEsc = () => { modal.forEach(e => e.destroy()); escKey.off('down', onEsc); this._canInput = true; };
        escKey.on('down', onEsc);
    }

    // ─── OPTIONS MODAL ───────────────────────────────────────────────────────

    _showOptions() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const modal = [];
        const pW = 500, pH = 360;
        const pX = W / 2 - pW / 2, pY = H / 2 - pH / 2;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.90);
        overlay.fillRect(0, 0, W, H);
        modal.push(overlay);

        modal.push(...this._drawPanel(pX, pY, pW, pH));

        modal.push(this.add.text(W / 2, pY + 20, 'OPTIONS  /  CONTRÔLES', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#555550', letterSpacing: 5,
        }).setOrigin(0.5));

        modal.push(...this._divider(pX + 20, pY + 42, pW - 40));

        // Section: déplacement
        modal.push(this.add.text(pX + 28, pY + 54, 'DÉPLACEMENT', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#3a4c5a', letterSpacing: 3,
        }));

        const controls = [
            ['Déplacer',                      'WASD  /  FLÈCHES'],
            ['Courir',                         'SHIFT  (maintenu)'],
            ['Interagir / Ramasser',           'E'],
            ['Ouvrir l\'inventaire',           'I'],
            ['Recharger',                      'R'],
        ];
        controls.forEach(([k, v], i) => {
            const yy = pY + 72 + i * 28;
            modal.push(this.add.text(pX + 36, yy, k, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#667788',
            }));
            modal.push(this.add.text(pX + pW - 28, yy, v, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#b0a080',
            }).setOrigin(1, 0));
        });

        modal.push(...this._divider(pX + 20, pY + 216, pW - 40));

        modal.push(this.add.text(pX + 28, pY + 228, 'EN COMBAT', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#3a4c5a', letterSpacing: 3,
        }));

        const combat = [
            ['Tirer / Attaquer',   'ESPACE  (viser le centre = critique)'],
            ['Esquiver',           'ESPACE  (pendant l\'attaque ennemie)'],
            ['Utiliser un soin',   'H'],
        ];
        combat.forEach(([k, v], i) => {
            const yy = pY + 246 + i * 28;
            modal.push(this.add.text(pX + 36, yy, k, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#667788',
            }));
            modal.push(this.add.text(pX + pW - 28, yy, v, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#b0a080',
            }).setOrigin(1, 0));
        });

        modal.push(...this._divider(pX + 20, pY + 326, pW - 40));

        modal.push(this.add.text(W / 2, pY + pH - 18, '[ESC]  Retour', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#2c2c2a', letterSpacing: 3,
        }).setOrigin(0.5));

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', () => { modal.forEach(e => e.destroy()); this._canInput = true; });
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _drawPanel(pX, pY, pW, pH) {
        const objs = [];
        const bg = this.add.graphics();
        bg.fillStyle(0x020406, 0.97);
        bg.fillRect(pX, pY, pW, pH);
        bg.lineStyle(1, 0x2a0000, 0.9);
        bg.strokeRect(pX, pY, pW, pH);

        // Corner accents
        const cL = 12;
        bg.lineStyle(2, 0x880000, 0.85);
        [ [pX, pY, 1, 1], [pX + pW, pY, -1, 1], [pX, pY + pH, 1, -1], [pX + pW, pY + pH, -1, -1] ]
        .forEach(([x, y, dx, dy]) => {
            bg.beginPath();
            bg.moveTo(x, y + dy * cL); bg.lineTo(x, y); bg.lineTo(x + dx * cL, y);
            bg.strokePath();
        });

        objs.push(bg);
        return objs;
    }

    _divider(x, y, w) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x1a0000, 0.8);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.strokePath();
        return [g];
    }
}
