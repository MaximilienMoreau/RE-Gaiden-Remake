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
        this._menuItems = [];
        this._menuIndex = 0;
        this._canInput = false;
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
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x182432, 0x101a28, 0x080c12, 0x080c12, 1);
        bg.fillRect(0, 0, W, H);
        // A cold moon, distant ship and reflected navigation lights.
        if (!this.textures.exists('title_moon_glow')) {
            const texture = this.textures.createCanvas('title_moon_glow', 256, 256);
            const ctx = texture.getContext();
            const gradient = ctx.createRadialGradient(128, 128, 16, 128, 128, 128);
            gradient.addColorStop(0, 'rgba(158,175,191,0.14)');
            gradient.addColorStop(1, 'rgba(158,175,191,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
            texture.refresh();
        }
        this.add.image(W * 0.76, H * 0.22, 'title_moon_glow');
        bg.fillStyle(0xc6cdd2, 0.65);
        bg.fillCircle(W * 0.76, H * 0.22, 25);
        this._drawShipSilhouette(W, H);
        const shade = this.add.graphics();
        shade.fillGradientStyle(0x080c12, 0x080c12, 0x080c12, 0x080c12, 0.98, 0.05, 1, 0.15);
        shade.fillRect(0, 0, W, H);
        shade.lineStyle(1, 0x536170, 0.3);
        shade.lineBetween(48, 48, W - 48, 48);
        this.add.text(48, 27, 'USSTRATCOM  /  OPERATION STARLIGHT', {
            fontFamily: UITheme.mono, fontSize: '10px', color: '#8f9ba9', letterSpacing: 2,
        });
        this.add.text(W - 48, 27, 'SIGNAL LOST', {
            fontFamily: UITheme.mono, fontSize: '10px', color: '#d65a54', letterSpacing: 2,
        }).setOrigin(1, 0);
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
        this.add.text(64, 119, 'RESIDENT EVIL', {
            fontSize: '14px', fontFamily: UITheme.font, color: '#d65a54', letterSpacing: 6,
        });
        const title = this.add.text(58, 137, 'GAIDEN', {
            fontSize: '100px', fontFamily: UITheme.displayFont, fontStyle: 'bold',
            color: '#eef0ed', letterSpacing: 8,
        }).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, duration: 1100 });
        this.add.text(65, 276, 'THE STARLIGHT INCIDENT', {
            fontSize: '11px', fontFamily: UITheme.mono, color: '#99a5b4', letterSpacing: 3,
        });
        this.add.text(65, 308, 'Un navire à la dérive.\nAucun signal. Aucun retour.', {
            fontSize: '14px', fontFamily: UITheme.font, color: '#b0bac7', lineSpacing: 7,
        });
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
        const x = 64, y = 391, width = 324;
        const items = [
            { label: 'Nouvelle partie', action: 'new_game' },
            { label: 'Charger une partie', action: 'load_game' },
            { label: 'Options & commandes', action: 'options' },
        ];
        items.forEach((item, i) => {
            const cy = y + i * 49;
            const bar = UITheme.panel(this, x, cy - 19, width, 42, { alpha: 0.95 });
            const bL = this.add.rectangle(x + 1, cy + 2, 3, 24, UITheme.colors.accent);
            const bR = this.add.text(x + width - 22, cy + 1, '→', {
                fontFamily: UITheme.font, fontSize: '18px', color: '#e9edf2',
            }).setOrigin(0.5);
            const label = this.add.text(x + 20, cy + 1, item.label, {
                fontSize: '15px', fontFamily: UITheme.font, color: '#e9edf2',
            }).setOrigin(0, 0.5);
            const hit = this.add.zone(x + width / 2, cy + 2, width, 42).setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => {
                if (this._canInput) this._updateMenuSelection(i);
            });
            hit.on('pointerdown', () => {
                if (!this._canInput) return;
                this._updateMenuSelection(i);
                this._canInput = false;
                AudioSynth.sfx('menu_confirm');
                this._executeAction(item.action);
            });
            this._menuItems.push({ bar, bL, bR, label, action: item.action });
        });
        this._updateMenuSelection(0);
    }

    // ─── FOOTER ──────────────────────────────────────────────────────────────

    _buildFooter(W, H) {
        this.add.text(64, H - 43, '↑ ↓  NAVIGUER     ↵  CONFIRMER', {
            fontSize: '10px', fontFamily: UITheme.mono, color: '#8f9ba9', letterSpacing: 1,
        });
        this.add.text(W - 48, H - 43, 'FAN REMAKE  /  2001 — 2026', {
            fontSize: '10px', fontFamily: UITheme.mono, color: '#738191',
        }).setOrigin(1, 0);
    }

    _setupAtmosphere(W, H) {
        const mist = this.add.graphics().setAlpha(0.25);
        mist.fillGradientStyle(0x8095aa, 0x8095aa, 0x080c12, 0x080c12, 0, 0.08, 0, 0);
        mist.fillRect(W * 0.47, H * 0.57, W * 0.65, 90);
        this.tweens.add({ targets: mist, x: -40, duration: 12000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // ─── MENU LOGIC ──────────────────────────────────────────────────────────

    _updateMenuSelection(idx) {
        this._menuIndex = idx;
        this._menuItems.forEach((item, i) => {
            const sel = i === idx;
            item.bar.setVisible(sel);
            item.bL.setVisible(sel);
            item.bR.setVisible(sel);
            item.label.setColor(sel ? '#eef0ed' : '#99a5b4').setAlpha(1);
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

        modal.push(this.add.text(W / 2, pY + 20, 'SELECT SAVE FILE', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#8d9aaa', letterSpacing: 5,
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
                fontSize: '12px', fontFamily: UITheme.font,
                color: ex ? '#7a5c3a' : '#2a2a28', letterSpacing: 3,
            }));

            if (ex) {
                modal.push(this.add.text(pX + 110, sy + 9, save.room, {
                    fontSize: '12px', fontFamily: UITheme.font, color: '#b8a888',
                }));
                modal.push(this.add.text(pX + 30, sy + 32, save.formattedDate, {
                    fontSize: '11px', fontFamily: UITheme.font, color: '#3a3a38',
                }));
                const hpPct = save.hp / save.hpMax;
                modal.push(this.add.text(pX + pW - 130, sy + 9, `HP  ${save.hp} / ${save.hpMax}`, {
                    fontSize: '12px', fontFamily: UITheme.font,
                    color: hpPct > 0.5 ? '#448844' : hpPct > 0.25 ? '#aa8822' : '#cc3322',
                }));
                const actLabel = (save.act || 'act1').replace('act', 'ACT ').toUpperCase();
                modal.push(this.add.text(pX + pW - 130, sy + 32, actLabel, {
                    fontSize: '11px', fontFamily: UITheme.font, color: '#3a4c5c',
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
                    fontSize: '12px', fontFamily: UITheme.font, color: '#1e1e1c',
                }));
            }
        });

        modal.push(this.add.text(W / 2, pY + pH - 16, '[ESC]  Back', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#94a1b1', letterSpacing: 3,
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

        modal.push(this.add.text(W / 2, pY + 20, 'OPTIONS  /  CONTROLS', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#8d9aaa', letterSpacing: 5,
        }).setOrigin(0.5));

        modal.push(...this._divider(pX + 20, pY + 42, pW - 40));

        modal.push(this.add.text(pX + 28, pY + 54, 'MOVEMENT', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#94a1b1', letterSpacing: 3,
        }));

        const controls = [
            ['Move',                           'WASD  /  ARROWS'],
            ['Run',                            'SHIFT  (hold)'],
            ['Interact / Pick up',             'E'],
            ['Open Inventory',                 'I'],
            ['Reload',                         'R'],
        ];
        controls.forEach(([k, v], i) => {
            const yy = pY + 72 + i * 28;
            modal.push(this.add.text(pX + 36, yy, k, {
                fontSize: '12px', fontFamily: UITheme.font, color: '#667788',
            }));
            modal.push(this.add.text(pX + pW - 28, yy, v, {
                fontSize: '12px', fontFamily: UITheme.font, color: '#b0a080',
            }).setOrigin(1, 0));
        });

        modal.push(...this._divider(pX + 20, pY + 216, pW - 40));

        modal.push(this.add.text(pX + 28, pY + 228, 'IN COMBAT', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#94a1b1', letterSpacing: 3,
        }));

        const combat = [
            ['Fire / Attack',      'SPACE  (aim center = critical)'],
            ['Dodge',              'SPACE  (during enemy attack)'],
            ['Use heal item',      'H'],
        ];
        combat.forEach(([k, v], i) => {
            const yy = pY + 246 + i * 28;
            modal.push(this.add.text(pX + 36, yy, k, {
                fontSize: '12px', fontFamily: UITheme.font, color: '#667788',
            }));
            modal.push(this.add.text(pX + pW - 28, yy, v, {
                fontSize: '12px', fontFamily: UITheme.font, color: '#b0a080',
            }).setOrigin(1, 0));
        });

        modal.push(...this._divider(pX + 20, pY + 326, pW - 40));

        modal.push(this.add.text(W / 2, pY + pH - 18, '[ESC]  Back', {
            fontSize: '11px', fontFamily: UITheme.font, color: '#94a1b1', letterSpacing: 3,
        }).setOrigin(0.5));

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', () => { modal.forEach(e => e.destroy()); this._canInput = true; });
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _drawPanel(pX, pY, pW, pH) {
        return [UITheme.panel(this, pX, pY, pW, pH)];
    }

    _divider(x, y, w) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x1a0000, 0.8);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.strokePath();
        return [g];
    }
}
