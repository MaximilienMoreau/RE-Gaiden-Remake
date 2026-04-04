/**
 * AssetGenerator - Procedurally generates all game textures using Phaser Graphics
 * No external image files required.
 */
const AssetGenerator = {

    generate(scene) {
        this.scene = scene;
        this._genTiles();
        this._genCharacters();
        this._genEnemies();
        this._genUI();
        this._genEffects();
        this._genItems();
    },

    // =========================================================
    // TILES
    // =========================================================
    _genTiles() {
        const S = CONFIG.TILE_SIZE;
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        const tiles = {
            floor_metal: () => {
                gfx.clear();
                gfx.fillStyle(0x18222e);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(1, 0x223040, 0.6);
                gfx.strokeRect(1, 1, S - 2, S - 2);
                gfx.lineStyle(1, 0x0d1520, 0.4);
                for (let i = 8; i < S; i += 8) {
                    gfx.beginPath();
                    gfx.moveTo(i, 0); gfx.lineTo(i, S);
                    gfx.strokePath();
                    gfx.beginPath();
                    gfx.moveTo(0, i); gfx.lineTo(S, i);
                    gfx.strokePath();
                }
                gfx.generateTexture('floor_metal', S, S);
            },
            floor_carpet: () => {
                gfx.clear();
                gfx.fillStyle(0x1a0d0d);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(1, 0x2d1515, 0.5);
                gfx.strokeRect(2, 2, S - 4, S - 4);
                for (let i = 0; i < 6; i++) {
                    const x = 4 + Math.random() * (S - 8);
                    const y = 4 + Math.random() * (S - 8);
                    gfx.fillStyle(0x260f0f, 0.5);
                    gfx.fillRect(x, y, 3, 3);
                }
                gfx.generateTexture('floor_carpet', S, S);
            },
            floor_grate: () => {
                gfx.clear();
                gfx.fillStyle(0x141e14);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(2, 0x2a3a2a, 1);
                for (let i = 0; i < S; i += 8) {
                    gfx.beginPath(); gfx.moveTo(i, 0); gfx.lineTo(i, S); gfx.strokePath();
                    gfx.beginPath(); gfx.moveTo(0, i); gfx.lineTo(S, i); gfx.strokePath();
                }
                gfx.fillStyle(0x0a100a, 0.5);
                for (let x = 0; x < S; x += 8) {
                    for (let y = 0; y < S; y += 8) {
                        gfx.fillRect(x + 1, y + 1, 6, 6);
                    }
                }
                gfx.generateTexture('floor_grate', S, S);
            },
            floor_water: () => {
                gfx.clear();
                gfx.fillStyle(0x0a1520);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(1, 0x1a3050, 0.4);
                for (let i = 4; i < S; i += 6) {
                    gfx.beginPath();
                    gfx.moveTo(0, i); gfx.lineTo(S, i + 2);
                    gfx.strokePath();
                }
                gfx.generateTexture('floor_water', S, S);
            },
            wall_metal: () => {
                gfx.clear();
                gfx.fillStyle(0x0e1520);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x182030);
                gfx.fillRect(0, 0, S, S / 2 - 2);
                gfx.lineStyle(2, 0x223040, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.lineStyle(1, 0x0a1020, 0.8);
                gfx.strokeRect(2, 2, S - 4, S / 2 - 4);
                gfx.generateTexture('wall_metal', S, S);
            },
            wall_pipe: () => {
                gfx.clear();
                gfx.fillStyle(0x0e1520);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x243040);
                gfx.fillRect(6, 0, 8, S);
                gfx.fillRect(20, 0, 6, S);
                gfx.lineStyle(1, 0x304858, 1);
                gfx.strokeRect(6, 0, 8, S);
                gfx.strokeRect(20, 0, 6, S);
                gfx.generateTexture('wall_pipe', S, S);
            },
            wall_dark: () => {
                gfx.clear();
                gfx.fillStyle(0x080c12);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(1, 0x151d28, 0.7);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('wall_dark', S, S);
            },
            door_closed: () => {
                gfx.clear();
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x2a1e10);
                gfx.fillRect(4, 4, S - 8, S - 8);
                gfx.fillStyle(0xaa8833);
                gfx.fillCircle(S - 8, S / 2, 3);
                gfx.lineStyle(2, 0x5a4020, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.lineStyle(1, 0x4a3015, 0.6);
                gfx.strokeRect(4, 4, S - 8, S - 8);
                gfx.generateTexture('door_closed', S, S);
            },
            door_open: () => {
                gfx.clear();
                gfx.fillStyle(0x05080f);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(0, 0, 4, S);
                gfx.fillRect(S - 4, 0, 4, S);
                gfx.generateTexture('door_open', S, S);
            },
            door_locked: () => {
                gfx.clear();
                gfx.fillStyle(0x1a1000);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x2a2000);
                gfx.fillRect(4, 4, S - 8, S - 8);
                gfx.fillStyle(0xcc8800);
                gfx.fillRect(S / 2 - 4, S / 2 - 6, 8, 10);
                gfx.fillStyle(0xaa6600);
                gfx.fillCircle(S / 2, S / 2 - 7, 5);
                gfx.lineStyle(2, 0xaa7700, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('door_locked', S, S);
            },
            save_room: () => {
                gfx.clear();
                gfx.fillStyle(0x0a1a10);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(1, 0x15351a, 0.6);
                gfx.strokeRect(1, 1, S - 2, S - 2);
                gfx.generateTexture('save_room', S, S);
            },
            obstacle: () => {
                gfx.clear();
                gfx.fillStyle(0x252525);
                gfx.fillRect(0, 0, S, S);
                gfx.lineStyle(2, 0x333, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('obstacle', S, S);
            },
            door_passage: () => {
                gfx.clear();
                // Frame extérieur en acier sombre
                gfx.fillStyle(0x1a2230);
                gfx.fillRect(0, 0, S, S);
                // Panneau gauche de la porte coulissante
                gfx.fillStyle(0x2a3a50);
                gfx.fillRect(1, 1, S / 2 - 2, S - 2);
                // Panneau droit
                gfx.fillStyle(0x243245);
                gfx.fillRect(S / 2 + 1, 1, S / 2 - 2, S - 2);
                // Ligne centrale (fente de séparation)
                gfx.fillStyle(0x080c14);
                gfx.fillRect(S / 2 - 1, 0, 2, S);
                // Bandes horizontales (nervures métal)
                gfx.lineStyle(1, 0x354a62, 0.7);
                gfx.beginPath(); gfx.moveTo(1, S * 0.3); gfx.lineTo(S / 2 - 2, S * 0.3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(1, S * 0.7); gfx.lineTo(S / 2 - 2, S * 0.7); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2 + 2, S * 0.3); gfx.lineTo(S - 1, S * 0.3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2 + 2, S * 0.7); gfx.lineTo(S - 1, S * 0.7); gfx.strokePath();
                // Bande lumineuse verte en bas (indicateur passage ouvert)
                gfx.fillStyle(0x00cc66);
                gfx.fillRect(3, S - 4, S - 6, 2);
                // Léger reflet en haut
                gfx.fillStyle(0x4a6080, 0.5);
                gfx.fillRect(2, 2, S - 4, 3);
                // Bordure extérieure
                gfx.lineStyle(2, 0x3a5070, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('door_passage', S, S);
            },
        };

        for (const key of Object.keys(tiles)) {
            tiles[key]();
        }
        gfx.destroy();
    },

    // =========================================================
    // CHARACTERS
    // =========================================================
    _genCharacters() {
        const W = 24, H = 36;
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Leon Kennedy - USSTRATCOM operative
        // Dark navy tactical gear, blonde
        this._drawLeon(gfx, W, H);
        gfx.generateTexture('leon', W * 4, H * 4); // 4 directions x 4 frames but simplified
        gfx.clear();

        // Leon (hurt state)
        this._drawLeon(gfx, W, H, true);
        gfx.generateTexture('leon_hurt', W, H);
        gfx.clear();

        // Barry Burton - stocky, red/brown jacket, beard
        this._drawBarry(gfx, W, H);
        gfx.generateTexture('barry', W, H);
        gfx.clear();

        // Lucia - young girl, white top, dark hair
        this._drawLucia(gfx, W, H);
        gfx.generateTexture('lucia', W, H);
        gfx.clear();

        gfx.destroy();

        // Generate spritesheet for Leon (4 directions, 3 frames each)
        this._genPlayerSpritesheet();
    },

    _drawLeon(gfx, W, H, hurt = false) {
        const col = hurt ? 0x6a2020 : 0x1a2040;
        const skinCol = hurt ? 0xb08060 : 0xd4a880;

        // Body / tactical vest
        gfx.fillStyle(col);
        gfx.fillRect(6, 14, W - 12, 18);

        // Head
        gfx.fillStyle(skinCol);
        gfx.fillRect(8, 2, W - 16, 12);

        // Hair (blonde)
        gfx.fillStyle(0xc8a040);
        gfx.fillRect(8, 2, W - 16, 4);
        gfx.fillRect(8, 2, 3, 8);
        gfx.fillRect(W - 11, 2, 3, 6);

        // Legs
        gfx.fillStyle(0x101830);
        gfx.fillRect(7, 28, 8, H - 28);
        gfx.fillRect(W - 15, 28, 8, H - 28);

        // Boots
        gfx.fillStyle(0x101010);
        gfx.fillRect(6, H - 5, 9, 5);
        gfx.fillRect(W - 15, H - 5, 9, 5);

        // USSTRATCOM patch (small detail)
        gfx.fillStyle(0x3050a0);
        gfx.fillRect(7, 15, 5, 3);
    },

    _drawBarry(gfx, W, H) {
        // Stockier build - red/brown jacket
        gfx.fillStyle(0x6a2010);
        gfx.fillRect(5, 14, W - 10, 18);

        // Body (wider)
        gfx.fillStyle(0x5a1a08);
        gfx.fillRect(4, 16, W - 8, 14);

        // Head
        gfx.fillStyle(0xc09060);
        gfx.fillRect(7, 2, W - 14, 12);

        // Hair and beard (reddish-brown)
        gfx.fillStyle(0x7a4020);
        gfx.fillRect(7, 2, W - 14, 4);
        gfx.fillRect(7, 8, W - 14, 5); // beard

        // Legs
        gfx.fillStyle(0x2a1808);
        gfx.fillRect(6, 28, 9, H - 28);
        gfx.fillRect(W - 15, 28, 9, H - 28);

        // Boots
        gfx.fillStyle(0x1a1010);
        gfx.fillRect(5, H - 5, 10, 5);
        gfx.fillRect(W - 15, H - 5, 10, 5);
    },

    _drawLucia(gfx, W, H) {
        // White/light top
        gfx.fillStyle(0xe0ddd8);
        gfx.fillRect(6, 14, W - 12, 16);

        // Dark skirt
        gfx.fillStyle(0x303038);
        gfx.fillRect(6, 26, W - 12, 8);

        // Head
        gfx.fillStyle(0xd4a880);
        gfx.fillRect(8, 2, W - 16, 12);

        // Dark hair
        gfx.fillStyle(0x1a1010);
        gfx.fillRect(8, 2, W - 16, 4);
        gfx.fillRect(8, 4, 3, 10);
        gfx.fillRect(W - 11, 4, 3, 8);

        // Legs
        gfx.fillStyle(0xd4a880);
        gfx.fillRect(8, 32, 7, H - 32);
        gfx.fillRect(W - 15, 32, 7, H - 32);

        // Shoes
        gfx.fillStyle(0x402010);
        gfx.fillRect(7, H - 4, 8, 4);
        gfx.fillRect(W - 15, H - 4, 8, 4);
    },

    _genPlayerSpritesheet() {
        // Generate 8 direction sprites (4 dirs x 2 animation frames)
        // Each frame is 24x36
        const FW = 24, FH = 36;
        const COLS = 8, ROWS = 1;
        const rt = this.scene.add.renderTexture(0, 0, FW * COLS, FH * ROWS);
        rt.setVisible(false);

        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Frame 0: facing down, idle
        // Frame 1: facing down, walk
        // Frame 2: facing up, idle
        // Frame 3: facing up, walk
        // Frame 4: facing left, idle
        // Frame 5: facing left, walk
        // Frame 6: facing right, idle
        // Frame 7: facing right, walk

        const drawFrame = (col, direction, walking) => {
            gfx.clear();
            const ox = col * FW;

            // Shared body
            gfx.fillStyle(0x1a2040);
            gfx.fillRect(ox + 6, FH * 0 + 14, FW - 12, 16);

            // Head
            gfx.fillStyle(0xd4a880);
            gfx.fillRect(ox + 8, FH * 0 + 2, FW - 16, 12);

            // Hair
            gfx.fillStyle(0xc8a040);
            gfx.fillRect(ox + 8, FH * 0 + 2, FW - 16, 4);

            // Legs (slightly different for walk frame)
            const lly = walking ? FH * 0 + 28 : FH * 0 + 30;
            const rly = walking ? FH * 0 + 30 : FH * 0 + 28;
            gfx.fillStyle(0x101830);
            gfx.fillRect(ox + 7, lly, 7, FH - lly + FH * 0 - 4);
            gfx.fillRect(ox + FW - 14, rly, 7, FH - rly + FH * 0 - 4);

            // Boots
            gfx.fillStyle(0x101010);
            gfx.fillRect(ox + 6, FH * 0 + FH - 5, 8, 5);
            gfx.fillRect(ox + FW - 14, FH * 0 + FH - 5, 8, 5);

            rt.draw(gfx, 0, 0);
        };

        for (let i = 0; i < COLS; i++) {
            drawFrame(i, Math.floor(i / 2), i % 2 === 1);
        }

        rt.saveTexture('leon_sheet');
        rt.destroy();
        gfx.destroy();

        this.scene.textures.get('leon_sheet').add('__BASE', 0, 0, 0, FW * COLS, FH);
        for (let i = 0; i < COLS; i++) {
            this.scene.textures.get('leon_sheet').add(
                'frame_' + i, 0, i * FW, 0, FW, FH
            );
        }
    },

    // =========================================================
    // ENEMIES
    // =========================================================
    _genEnemies() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Zombie
        this._drawZombie(gfx);
        gfx.generateTexture('zombie', 24, 36);
        gfx.clear();

        // Zombie Sailor
        this._drawZombieSailor(gfx);
        gfx.generateTexture('zombie_sailor', 24, 36);
        gfx.clear();

        // Lurker (aquatic BOW)
        this._drawLurker(gfx);
        gfx.generateTexture('lurker', 32, 28);
        gfx.clear();

        // Zombie Dog
        this._drawZombieDog(gfx);
        gfx.generateTexture('zombie_dog', 40, 24);
        gfx.clear();

        // Licker
        this._drawLicker(gfx);
        gfx.generateTexture('licker', 36, 28);
        gfx.clear();

        // The Creature - Phase 1
        this._drawCreature(gfx, 1);
        gfx.generateTexture('creature_p1', 48, 64);
        gfx.clear();

        // The Creature - Phase 2
        this._drawCreature(gfx, 2);
        gfx.generateTexture('creature_p2', 64, 72);
        gfx.clear();

        gfx.destroy();
    },

    _drawZombie(gfx) {
        const W = 24, H = 36;
        gfx.fillStyle(0x4a6a40); // pale greenish skin
        gfx.fillRect(8, 2, W - 16, 12);
        // Torn shirt
        gfx.fillStyle(0x2a2020);
        gfx.fillRect(6, 14, W - 12, 16);
        // Blood stain
        gfx.fillStyle(0x7a1010);
        gfx.fillRect(8, 16, 6, 8);
        // Legs
        gfx.fillStyle(0x1a1a1a);
        gfx.fillRect(7, 30, 7, H - 30);
        gfx.fillRect(W - 14, 30, 7, H - 30);
        // Eyes - milky white
        gfx.fillStyle(0xddddcc);
        gfx.fillRect(9, 5, 3, 3);
        gfx.fillRect(W - 12, 5, 3, 3);
        // Open mouth
        gfx.fillStyle(0x3a0808);
        gfx.fillRect(9, 10, 6, 3);
    },

    _drawZombieSailor(gfx) {
        const W = 24, H = 36;
        gfx.fillStyle(0x50605a);
        gfx.fillRect(8, 2, W - 16, 12);
        gfx.fillStyle(0x1a3050); // sailor uniform
        gfx.fillRect(6, 14, W - 12, 16);
        gfx.fillStyle(0x7a1010);
        gfx.fillRect(10, 14, 4, 10);
        gfx.fillStyle(0x0a1830);
        gfx.fillRect(7, 30, 7, H - 30);
        gfx.fillRect(W - 14, 30, 7, H - 30);
        gfx.fillStyle(0x2a3a50); // sailor hat
        gfx.fillRect(7, 0, W - 14, 4);
    },

    _drawLurker(gfx) {
        const W = 32, H = 28;
        // Body - aquatic, dark blue-green
        gfx.fillStyle(0x1a3a30);
        gfx.fillEllipse(W / 2, H / 2, W - 4, H - 4);
        // Tentacle-like limbs
        gfx.fillStyle(0x102820);
        gfx.fillRect(0, H / 2 - 4, 8, 8);
        gfx.fillRect(W - 8, H / 2 - 4, 8, 8);
        gfx.fillRect(W / 2 - 4, H - 8, 8, 8);
        // Eyes
        gfx.fillStyle(0xffee00);
        gfx.fillCircle(W / 2 - 5, H / 2 - 3, 3);
        gfx.fillCircle(W / 2 + 5, H / 2 - 3, 3);
        gfx.fillStyle(0x000);
        gfx.fillCircle(W / 2 - 5, H / 2 - 3, 1);
        gfx.fillCircle(W / 2 + 5, H / 2 - 3, 1);
    },

    _drawZombieDog(gfx) {
        const W = 40, H = 24;
        // Body
        gfx.fillStyle(0x3a2a20);
        gfx.fillRect(6, 8, W - 14, H - 12);
        // Exposed ribs / rot
        gfx.fillStyle(0x6a4030);
        gfx.fillRect(10, 8, 4, H - 14);
        gfx.fillRect(16, 8, 4, H - 14);
        // Head
        gfx.fillStyle(0x4a3020);
        gfx.fillRect(W - 14, 4, 14, H - 8);
        // Jaw open
        gfx.fillStyle(0x3a0808);
        gfx.fillRect(W - 12, H / 2, 12, 6);
        // Eyes
        gfx.fillStyle(0xff4400);
        gfx.fillRect(W - 12, 6, 4, 4);
        // Legs
        gfx.fillStyle(0x2a1a10);
        gfx.fillRect(4, H - 6, 6, 6);
        gfx.fillRect(14, H - 6, 6, 6);
        gfx.fillRect(24, H - 6, 6, 6);
        gfx.fillRect(34, H - 6, 6, 6);
    },

    _drawLicker(gfx) {
        const W = 36, H = 28;
        // Body - no skin, all muscle
        gfx.fillStyle(0x8a2a2a);
        gfx.fillRect(8, 6, W - 16, H - 10);
        // Long tongue
        gfx.fillStyle(0xcc4444);
        gfx.fillRect(W / 2 - 2, 2, 4, 20);
        // Claws
        gfx.fillStyle(0x5a1010);
        gfx.fillRect(0, H / 2, 10, 6);
        gfx.fillRect(W - 10, H / 2, 10, 6);
        // Head
        gfx.fillStyle(0x701818);
        gfx.fillRect(W / 2 - 6, 2, 12, 10);
        // Eyes (none visible - blind)
        gfx.fillStyle(0x3a0808);
        gfx.fillRect(W / 2 - 4, 4, 3, 3);
        gfx.fillRect(W / 2 + 1, 4, 3, 3);
    },

    _drawCreature(gfx, phase) {
        if (phase === 1) {
            const W = 48, H = 64;
            // Phase 1 - massive humanoid, dark chitinous armor
            gfx.fillStyle(0x0a0a18);
            gfx.fillRect(12, 18, W - 24, H - 24);
            // Armored chest
            gfx.fillStyle(0x1a1a30);
            gfx.fillRect(10, 16, W - 20, 24);
            // Head - elongated
            gfx.fillStyle(0x151525);
            gfx.fillRect(W / 2 - 8, 2, 16, 16);
            // Eyes - red glow
            gfx.fillStyle(0xff2200);
            gfx.fillRect(W / 2 - 5, 6, 4, 4);
            gfx.fillRect(W / 2 + 1, 6, 4, 4);
            // Massive arms
            gfx.fillStyle(0x0a0a18);
            gfx.fillRect(0, 18, 14, 28);
            gfx.fillRect(W - 14, 18, 14, 28);
            // Claws
            gfx.fillStyle(0x303050);
            gfx.fillRect(0, 42, 6, 10);
            gfx.fillRect(W - 6, 42, 6, 10);
            // Legs
            gfx.fillRect(14, H - 20, 10, 20);
            gfx.fillRect(W - 24, H - 20, 10, 20);
        } else {
            const W = 64, H = 72;
            // Phase 2 - mutated, larger, more organic
            gfx.fillStyle(0x1a0820);
            gfx.fillRect(14, 20, W - 28, H - 26);
            // Organic growths
            gfx.fillStyle(0x300840);
            gfx.fillEllipse(W / 2, H / 2 - 5, W - 10, H / 2);
            // Multiple heads / appendages
            gfx.fillStyle(0x200a30);
            gfx.fillRect(W / 2 - 10, 2, 20, 18);
            gfx.fillRect(W / 2 - 25, 8, 14, 12);
            gfx.fillRect(W / 2 + 11, 6, 14, 12);
            // Eyes - multiple, pulsing (rendered as static)
            gfx.fillStyle(0xff4400);
            gfx.fillCircle(W / 2 - 5, 10, 4);
            gfx.fillCircle(W / 2 + 5, 10, 4);
            gfx.fillStyle(0xff8800);
            gfx.fillCircle(W / 2 - 18, 12, 3);
            gfx.fillCircle(W / 2 + 18, 12, 3);
            // Tendrils
            gfx.fillStyle(0x180620);
            for (let i = 0; i < 6; i++) {
                const tx = 4 + i * 10;
                gfx.fillRect(tx, H - 16, 4, 16);
            }
        }
    },

    // =========================================================
    // UI ELEMENTS
    // =========================================================
    _genUI() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Health bar background
        gfx.fillStyle(0x0a0a0a);
        gfx.fillRect(0, 0, 200, 20);
        gfx.lineStyle(1, 0x333, 1);
        gfx.strokeRect(0, 0, 200, 20);
        gfx.generateTexture('healthbar_bg', 200, 20);
        gfx.clear();

        // Crosshair
        gfx.lineStyle(2, 0xcc2222, 0.9);
        gfx.beginPath(); gfx.moveTo(16, 0); gfx.lineTo(16, 10); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(16, 22); gfx.lineTo(16, 32); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(0, 16); gfx.lineTo(10, 16); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(22, 16); gfx.lineTo(32, 16); gfx.strokePath();
        gfx.fillStyle(0xcc2222, 0.6);
        gfx.fillCircle(16, 16, 2);
        gfx.generateTexture('crosshair', 32, 32);
        gfx.clear();

        // Combat reticle
        gfx.fillStyle(0xff0000, 0.9);
        gfx.fillRect(0, 0, 6, 40);
        gfx.lineStyle(1, 0xff6666, 1);
        gfx.strokeRect(0, 0, 6, 40);
        gfx.generateTexture('reticle', 6, 40);
        gfx.clear();

        // Item slot background
        gfx.fillStyle(0x111111);
        gfx.fillRect(0, 0, 48, 48);
        gfx.lineStyle(1, 0x334, 1);
        gfx.strokeRect(0, 0, 48, 48);
        gfx.generateTexture('item_slot', 48, 48);
        gfx.clear();

        // Typewriter (save point indicator)
        gfx.fillStyle(0x0a2010);
        gfx.fillRect(0, 0, 40, 32);
        gfx.fillStyle(0x103020);
        gfx.fillRect(4, 4, 32, 20);
        gfx.fillStyle(0x205040);
        gfx.fillRect(6, 6, 28, 4);
        for (let i = 0; i < 5; i++) {
            gfx.fillStyle(0x305040);
            gfx.fillRect(6 + i * 6, 12, 4, 6);
        }
        gfx.fillStyle(0x103020);
        gfx.fillRect(14, 24, 12, 5);
        gfx.generateTexture('typewriter', 40, 32);
        gfx.clear();

        // Interaction prompt icon
        gfx.fillStyle(0xddcc88);
        gfx.fillRect(0, 0, 24, 24);
        gfx.fillStyle(0x1a1a00);
        gfx.fillRect(9, 6, 6, 12);
        gfx.fillRect(4, 10, 16, 4);
        gfx.generateTexture('interact_icon', 24, 24);
        gfx.clear();

        // Map icon
        gfx.fillStyle(0x102030);
        gfx.fillRect(0, 0, 16, 16);
        gfx.lineStyle(1, 0x4080b0, 1);
        gfx.strokeRect(0, 0, 16, 16);
        gfx.lineStyle(2, 0x60a0d0, 1);
        gfx.beginPath();
        gfx.moveTo(2, 8); gfx.lineTo(6, 4); gfx.lineTo(10, 10); gfx.lineTo(14, 6);
        gfx.strokePath();
        gfx.generateTexture('map_icon', 16, 16);
        gfx.clear();

        gfx.destroy();
    },

    // =========================================================
    // VISUAL EFFECTS
    // =========================================================
    _genEffects() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Muzzle flash
        gfx.fillStyle(0xffee88, 0.9);
        gfx.fillCircle(16, 16, 12);
        gfx.fillStyle(0xffffff, 0.7);
        gfx.fillCircle(16, 16, 6);
        gfx.generateTexture('muzzle_flash', 32, 32);
        gfx.clear();

        // Blood splatter (small)
        for (let i = 0; i < 12; i++) {
            const x = 8 + Math.random() * 16;
            const y = 8 + Math.random() * 16;
            const r = 1 + Math.random() * 3;
            gfx.fillStyle(0xaa1010, 0.8);
            gfx.fillCircle(x, y, r);
        }
        gfx.generateTexture('blood_small', 32, 32);
        gfx.clear();

        // Blood pool
        gfx.fillStyle(0x6a0808, 0.7);
        gfx.fillEllipse(24, 18, 36, 22);
        gfx.fillStyle(0x880a0a, 0.5);
        gfx.fillEllipse(22, 16, 24, 14);
        gfx.generateTexture('blood_pool', 48, 36);
        gfx.clear();

        // Bullet hole
        gfx.fillStyle(0x000000);
        gfx.fillCircle(8, 8, 6);
        gfx.fillStyle(0x2a2a2a);
        gfx.fillCircle(8, 8, 4);
        gfx.lineStyle(1, 0x3a3a3a, 0.5);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            gfx.beginPath();
            gfx.moveTo(8, 8);
            gfx.lineTo(8 + Math.cos(angle) * 8, 8 + Math.sin(angle) * 8);
            gfx.strokePath();
        }
        gfx.generateTexture('bullet_hole', 16, 16);
        gfx.clear();

        // Noise/grain overlay
        const noiseSize = 256;
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * noiseSize;
            const y = Math.random() * noiseSize;
            const a = Math.random() * 0.08;
            const c = Math.random() > 0.5 ? 0xffffff : 0x000000;
            gfx.fillStyle(c, a);
            gfx.fillRect(x, y, 1, 1);
        }
        gfx.generateTexture('noise', noiseSize, noiseSize);
        gfx.clear();

        // Flashlight mask
        const flSize = 320;
        gfx.fillStyle(0x000000, 0.95);
        gfx.fillRect(0, 0, flSize, flSize);
        gfx.generateTexture('darkness_mask', flSize, flSize);
        gfx.clear();

        gfx.destroy();
    },

    // =========================================================
    // ITEMS
    // =========================================================
    _genItems() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const S = 32;

        const items = {
            item_handgun: () => {
                gfx.clear();
                gfx.fillStyle(0x2a2a2a);
                gfx.fillRect(4, 12, 22, 10);
                gfx.fillRect(16, 8, 12, 6);
                gfx.fillStyle(0x3a3a3a);
                gfx.fillRect(18, 10, 10, 4);
                gfx.fillStyle(0x1a1a1a);
                gfx.fillRect(4, 20, 10, 6);
                gfx.generateTexture('item_handgun', S, S);
            },
            item_shotgun: () => {
                gfx.clear();
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(2, 14, 28, 8);
                gfx.fillRect(2, 12, 28, 4);
                gfx.fillStyle(0x2a1a0a);
                gfx.fillRect(2, 16, 12, 10);
                gfx.fillStyle(0x1a1a1a);
                gfx.fillRect(16, 13, 14, 4);
                gfx.generateTexture('item_shotgun', S, S);
            },
            item_herb_green: () => {
                gfx.clear();
                gfx.fillStyle(0x1a4a10);
                gfx.fillRect(14, 20, 4, 10);
                // Leaves
                gfx.fillStyle(0x2a6a18);
                gfx.fillEllipse(10, 16, 10, 14);
                gfx.fillEllipse(20, 14, 10, 12);
                gfx.fillStyle(0x3a8a20);
                gfx.fillEllipse(15, 10, 12, 16);
                gfx.generateTexture('item_herb_green', S, S);
            },
            item_herb_red: () => {
                gfx.clear();
                gfx.fillStyle(0x4a1010);
                gfx.fillRect(14, 20, 4, 10);
                gfx.fillStyle(0x8a1818);
                gfx.fillEllipse(10, 16, 10, 14);
                gfx.fillEllipse(20, 14, 10, 12);
                gfx.fillStyle(0xcc2222);
                gfx.fillEllipse(15, 10, 12, 16);
                gfx.generateTexture('item_herb_red', S, S);
            },
            item_herb_mixed: () => {
                gfx.clear();
                gfx.fillStyle(0x2a5a10);
                gfx.fillEllipse(11, 14, 10, 16);
                gfx.fillStyle(0xaa2020);
                gfx.fillEllipse(21, 14, 10, 16);
                gfx.fillStyle(0x1a4a10);
                gfx.fillRect(12, 22, 3, 8);
                gfx.fillStyle(0x4a1010);
                gfx.fillRect(18, 22, 3, 8);
                gfx.generateTexture('item_herb_mixed', S, S);
            },
            item_faspray: () => {
                gfx.clear();
                gfx.fillStyle(0x2050a0);
                gfx.fillRect(10, 6, 12, 22);
                gfx.fillStyle(0x3070d0);
                gfx.fillRect(11, 8, 10, 18);
                gfx.fillStyle(0xffffff);
                gfx.fillRect(12, 10, 8, 10);
                gfx.fillStyle(0x1040aa);
                gfx.fillRect(10, 6, 12, 4);
                gfx.generateTexture('item_faspray', S, S);
            },
            item_ammo_9mm: () => {
                gfx.clear();
                for (let i = 0; i < 5; i++) {
                    gfx.fillStyle(0x8a7040);
                    gfx.fillRect(6 + i * 4, 16, 3, 10);
                    gfx.fillStyle(0xaa9050);
                    gfx.fillRect(6 + i * 4, 10, 3, 8);
                    gfx.fillStyle(0xd0a060);
                    gfx.fillRect(7 + i * 4, 8, 1, 4);
                }
                gfx.generateTexture('item_ammo_9mm', S, S);
            },
            item_ammo_12g: () => {
                gfx.clear();
                for (let i = 0; i < 3; i++) {
                    gfx.fillStyle(0x7a3020);
                    gfx.fillRect(8 + i * 7, 10, 5, 16);
                    gfx.fillStyle(0xaa4030);
                    gfx.fillRect(8 + i * 7, 10, 5, 12);
                    gfx.fillStyle(0xddcc88);
                    gfx.fillRect(8 + i * 7, 22, 5, 4);
                }
                gfx.generateTexture('item_ammo_12g', S, S);
            },
            item_key_cabin: () => {
                gfx.clear();
                gfx.fillStyle(0xaa8830);
                gfx.fillCircle(10, 10, 8);
                gfx.fillStyle(0x0a0a0a);
                gfx.fillCircle(10, 10, 4);
                gfx.fillStyle(0xaa8830);
                gfx.fillRect(16, 8, 14, 4);
                gfx.fillRect(22, 12, 3, 5);
                gfx.fillRect(27, 12, 3, 7);
                gfx.generateTexture('item_key_cabin', S, S);
            },
            item_key_cargo: () => {
                gfx.clear();
                gfx.fillStyle(0x303030);
                gfx.fillRect(10, 6, 12, 8);
                gfx.fillRect(4, 10, 24, 4);
                gfx.fillStyle(0x505050);
                gfx.fillRect(12, 14, 8, 12);
                gfx.fillRect(14, 22, 10, 4);
                gfx.generateTexture('item_key_cargo', S, S);
            },
            item_key_lab: () => {
                gfx.clear();
                gfx.fillStyle(0x202060);
                gfx.fillRect(8, 4, 16, 10);
                gfx.fillStyle(0x3030aa);
                gfx.fillRect(9, 5, 14, 8);
                gfx.fillStyle(0x0000ff);
                gfx.fillRect(11, 7, 10, 4);
                gfx.fillStyle(0x202060);
                gfx.fillRect(14, 14, 4, 14);
                gfx.fillRect(12, 20, 8, 3);
                gfx.generateTexture('item_key_lab', S, S);
            },
            item_diary: () => {
                gfx.clear();
                gfx.fillStyle(0x4a3020);
                gfx.fillRect(6, 4, 20, 24);
                gfx.fillStyle(0x3a2010);
                gfx.fillRect(6, 4, 4, 24);
                gfx.fillStyle(0xe8ddc0);
                gfx.fillRect(10, 5, 15, 22);
                for (let i = 0; i < 6; i++) {
                    gfx.fillStyle(0xb0a898);
                    gfx.fillRect(12, 8 + i * 3, 10, 1);
                }
                gfx.generateTexture('item_diary', S, S);
            },
            item_antibiotic: () => {
                gfx.clear();
                gfx.fillStyle(0xcc4444);
                gfx.fillRect(12, 4, 8, 14);
                gfx.fillStyle(0xdddddd);
                gfx.fillRect(12, 14, 8, 14);
                gfx.lineStyle(1, 0x888, 1);
                gfx.strokeRect(12, 4, 8, 24);
                gfx.generateTexture('item_antibiotic', S, S);
            },
        };

        for (const key of Object.keys(items)) {
            items[key]();
        }

        gfx.destroy();
    },
};
