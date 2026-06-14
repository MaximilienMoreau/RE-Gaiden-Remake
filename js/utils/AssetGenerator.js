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
                // Top lighting
                gfx.fillStyle(0x202c3c, 0.45);
                gfx.fillRect(0, 0, S, S / 2);
                // Large panel divisions
                const h = S / 2;
                gfx.lineStyle(1, 0x0c1522, 1);
                gfx.beginPath(); gfx.moveTo(h, 0); gfx.lineTo(h, S); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(0, h); gfx.lineTo(S, h); gfx.strokePath();
                // Rivets
                gfx.fillStyle(0x2a3a50);
                const rivets = [[2,2],[S-4,2],[2,S-4],[S-4,S-4],[h-2,2],[h-2,S-4],[2,h-2],[S-4,h-2]];
                for (const [rx, ry] of rivets) {
                    gfx.fillCircle(rx + 1, ry + 1, 1.5);
                    gfx.fillStyle(0x0e1828);
                    gfx.fillCircle(rx, ry, 1);
                    gfx.fillStyle(0x2a3a50);
                }
                // Edge bevel highlight (top/left)
                gfx.lineStyle(1, 0x2e4258, 0.7);
                gfx.beginPath(); gfx.moveTo(0, 0); gfx.lineTo(S, 0); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(0, 0); gfx.lineTo(0, S); gfx.strokePath();
                // Edge shadow (bottom/right)
                gfx.lineStyle(1, 0x0a1018, 0.8);
                gfx.beginPath(); gfx.moveTo(S - 1, 0); gfx.lineTo(S - 1, S); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(0, S - 1); gfx.lineTo(S, S - 1); gfx.strokePath();
                // Scratch marks
                gfx.lineStyle(1, 0x0e1826, 0.4);
                gfx.beginPath(); gfx.moveTo(3, 6); gfx.lineTo(10, 14); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S - 8, S - 12); gfx.lineTo(S - 3, S - 6); gfx.strokePath();
                gfx.generateTexture('floor_metal', S, S);
            },

            floor_carpet: () => {
                gfx.clear();
                gfx.fillStyle(0x1c0c0c);
                gfx.fillRect(0, 0, S, S);
                // Diagonal weave
                gfx.lineStyle(1, 0x280e0e, 0.8);
                for (let i = -S; i < S * 2; i += 4) {
                    gfx.beginPath(); gfx.moveTo(i, 0); gfx.lineTo(i + S, S); gfx.strokePath();
                    gfx.beginPath(); gfx.moveTo(i, 0); gfx.lineTo(i - S, S); gfx.strokePath();
                }
                // Border stripe (double)
                gfx.lineStyle(1, 0x3a1515, 0.9);
                gfx.strokeRect(2, 2, S - 4, S - 4);
                gfx.lineStyle(1, 0x1a0808, 0.6);
                gfx.strokeRect(4, 4, S - 8, S - 8);
                // Wear stains
                gfx.fillStyle(0x130808, 0.6);
                gfx.fillEllipse(S * 0.3, S * 0.4, 8, 6);
                gfx.fillStyle(0x2a1010, 0.4);
                gfx.fillEllipse(S * 0.7, S * 0.65, 6, 4);
                // Top shading
                gfx.fillStyle(0x241010, 0.3);
                gfx.fillRect(0, 0, S, 4);
                gfx.generateTexture('floor_carpet', S, S);
            },

            floor_grate: () => {
                gfx.clear();
                // Void below
                gfx.fillStyle(0x050a05);
                gfx.fillRect(0, 0, S, S);
                // Horizontal bars
                gfx.fillStyle(0x223022);
                for (let y = 0; y < S; y += 8) { gfx.fillRect(0, y, S, 4); }
                // Vertical bars
                for (let x = 0; x < S; x += 8) { gfx.fillRect(x, 0, 4, S); }
                // Bar top-edge highlights
                gfx.fillStyle(0x2e4030, 0.9);
                for (let y = 0; y < S; y += 8) { gfx.fillRect(0, y, S, 1); }
                for (let x = 0; x < S; x += 8) { gfx.fillRect(x, 0, 1, S); }
                // Bar bottom-edge shadows
                gfx.fillStyle(0x0e1a0e, 0.8);
                for (let y = 0; y < S; y += 8) { gfx.fillRect(0, y + 3, S, 1); }
                for (let x = 0; x < S; x += 8) { gfx.fillRect(x + 3, 0, 1, S); }
                // Rust stain corner
                gfx.fillStyle(0x5a3010, 0.3);
                gfx.fillEllipse(S - 4, 4, 10, 8);
                gfx.generateTexture('floor_grate', S, S);
            },

            floor_water: () => {
                gfx.clear();
                gfx.fillStyle(0x081218);
                gfx.fillRect(0, 0, S, S);
                // Mid-depth layer
                gfx.fillStyle(0x0c1e2c, 0.6);
                gfx.fillRect(0, S / 3, S, S / 3);
                // Ripple lines (organic / staggered)
                gfx.lineStyle(1, 0x1a3855, 0.5);
                for (let i = 2; i < S; i += 7) {
                    gfx.beginPath();
                    gfx.moveTo(0, i);
                    gfx.lineTo(S * 0.4, i + 2);
                    gfx.lineTo(S * 0.7, i - 1);
                    gfx.lineTo(S, i + 1);
                    gfx.strokePath();
                }
                // Crest highlights
                gfx.lineStyle(1, 0x2a5070, 0.35);
                for (let i = 4; i < S; i += 7) {
                    gfx.beginPath();
                    gfx.moveTo(0, i);
                    gfx.lineTo(S * 0.5, i + 1);
                    gfx.lineTo(S, i);
                    gfx.strokePath();
                }
                // Reflection glints
                gfx.fillStyle(0x3a6880, 0.25);
                gfx.fillEllipse(S * 0.6, S * 0.35, 10, 4);
                gfx.fillStyle(0x5090a8, 0.15);
                gfx.fillEllipse(S * 0.2, S * 0.6, 6, 2);
                gfx.generateTexture('floor_water', S, S);
            },

            wall_metal: () => {
                gfx.clear();
                gfx.fillStyle(0x0e1520);
                gfx.fillRect(0, 0, S, S);
                // Upper panel (closer to light)
                gfx.fillStyle(0x1a2535);
                gfx.fillRect(0, 0, S, S * 0.45);
                // Panel seam
                gfx.fillStyle(0x080e18);
                gfx.fillRect(0, S * 0.45 - 1, S, 2);
                // Bevel top/left
                gfx.fillStyle(0x2a3a50, 0.55);
                gfx.fillRect(0, 0, S, 2);
                gfx.fillStyle(0x1e2e42, 0.4);
                gfx.fillRect(0, 0, 2, S);
                // Shadow right/bottom
                gfx.fillStyle(0x060c14, 0.7);
                gfx.fillRect(S - 2, 0, 2, S);
                gfx.fillRect(0, S - 2, S, 2);
                // Bolts
                gfx.fillStyle(0x283848);
                const wBolts = [[3,3],[S-5,3],[3,S*0.4-4],[S-5,S*0.4-4]];
                for (const [rx, ry] of wBolts) {
                    gfx.fillCircle(rx + 1, ry + 1, 1.5);
                    gfx.fillStyle(0x0a1020);
                    gfx.fillCircle(rx, ry, 1);
                    gfx.fillStyle(0x283848);
                }
                // Vertical scratches
                gfx.lineStyle(1, 0x0a1420, 0.5);
                gfx.beginPath(); gfx.moveTo(S * 0.35, 2); gfx.lineTo(S * 0.33, S * 0.4); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S * 0.7, 4); gfx.lineTo(S * 0.71, S * 0.38); gfx.strokePath();
                gfx.generateTexture('wall_metal', S, S);
            },

            wall_pipe: () => {
                gfx.clear();
                // Background wall
                gfx.fillStyle(0x0e1520);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x141c28, 0.45);
                gfx.fillRect(0, 0, S, S / 2);
                // Large pipe
                gfx.fillStyle(0x1e2e3e);
                gfx.fillRect(5, 0, 10, S);
                gfx.fillStyle(0x0c161e, 0.9); // dark edges = rounded
                gfx.fillRect(5, 0, 2, S);
                gfx.fillRect(13, 0, 2, S);
                gfx.fillStyle(0x3a5060, 0.65); // bright center = highlight
                gfx.fillRect(9, 0, 2, S);
                // Pipe flange
                gfx.fillStyle(0x2a3c4e);
                gfx.fillRect(3, S / 2 - 4, 14, 8);
                gfx.lineStyle(1, 0x4a6070, 0.8);
                gfx.strokeRect(3, S / 2 - 4, 14, 8);
                gfx.fillStyle(0x3a5060);
                gfx.fillCircle(5, S / 2 - 2, 1.5);
                gfx.fillCircle(15, S / 2 + 2, 1.5);
                // Small pipe (right)
                gfx.fillStyle(0x1c2a36);
                gfx.fillRect(S - 8, 0, 5, S);
                gfx.fillStyle(0x0c141c, 0.8);
                gfx.fillRect(S - 8, 0, 1, S);
                gfx.fillRect(S - 4, 0, 1, S);
                gfx.fillStyle(0x304050, 0.55);
                gfx.fillRect(S - 6, 0, 2, S);
                gfx.generateTexture('wall_pipe', S, S);
            },

            wall_dark: () => {
                gfx.clear();
                gfx.fillStyle(0x080c12);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x0c1018, 0.4);
                gfx.fillRect(0, 0, S, S / 2);
                // Crack
                gfx.lineStyle(1, 0x0e1420, 0.6);
                gfx.beginPath();
                gfx.moveTo(S * 0.3, 2);
                gfx.lineTo(S * 0.35, S * 0.4);
                gfx.lineTo(S * 0.32, S * 0.7);
                gfx.strokePath();
                // Moisture stain
                gfx.fillStyle(0x081008, 0.4);
                gfx.fillEllipse(S * 0.6, S * 0.7, 12, 16);
                gfx.lineStyle(1, 0x141e2c, 0.7);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('wall_dark', S, S);
            },

            door_closed: () => {
                gfx.clear();
                // Frame
                gfx.fillStyle(0x4a3a2a);
                gfx.fillRect(0, 0, S, S);
                // Door panel inset
                gfx.fillStyle(0x3a2c1c);
                gfx.fillRect(3, 3, S - 6, S - 6);
                // Panel bevel
                gfx.fillStyle(0x5a4a30, 0.5);
                gfx.fillRect(3, 3, S - 6, 2);
                gfx.fillRect(3, 3, 2, S - 6);
                gfx.fillStyle(0x201408, 0.6);
                gfx.fillRect(3, S - 5, S - 6, 2);
                gfx.fillRect(S - 5, 3, 2, S - 6);
                // Wood grain
                gfx.lineStyle(1, 0x2e2010, 0.5);
                for (let i = 8; i < S - 4; i += 6) {
                    gfx.beginPath(); gfx.moveTo(4, i); gfx.lineTo(S - 5, i + 1); gfx.strokePath();
                }
                // Handle plate
                gfx.fillStyle(0x887040);
                gfx.fillRect(S - 12, S / 2 - 6, 8, 12);
                gfx.fillStyle(0xbb9a50);
                gfx.fillRect(S - 11, S / 2 - 5, 6, 3);
                gfx.fillStyle(0xccaa55);
                gfx.fillCircle(S - 8, S / 2 + 2, 3);
                gfx.fillStyle(0xddbb66, 0.55);
                gfx.fillCircle(S - 9, S / 2 + 1, 1.5);
                gfx.lineStyle(2, 0x2e1e0c, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('door_closed', S, S);
            },

            door_open: () => {
                gfx.clear();
                gfx.fillStyle(0x040608);
                gfx.fillRect(0, 0, S, S);
                // Left jamb
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(0, 0, 4, S);
                gfx.fillStyle(0x4a3a28, 0.55);
                gfx.fillRect(0, 0, 2, S);
                // Right jamb
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(S - 4, 0, 4, S);
                gfx.fillStyle(0x201408, 0.55);
                gfx.fillRect(S - 2, 0, 2, S);
                // Floor suggestion
                gfx.fillStyle(0x0c1018, 0.5);
                gfx.fillRect(4, S - 3, S - 8, 3);
                gfx.generateTexture('door_open', S, S);
            },

            door_locked: () => {
                gfx.clear();
                gfx.fillStyle(0x1a0e00);
                gfx.fillRect(0, 0, S, S);
                gfx.fillStyle(0x241606);
                gfx.fillRect(3, 3, S - 6, S - 6);
                // Bevel
                gfx.fillStyle(0x302010, 0.5);
                gfx.fillRect(3, 3, S - 6, 2);
                gfx.fillStyle(0x100800, 0.7);
                gfx.fillRect(3, S - 5, S - 6, 2);
                // Wood grain
                gfx.lineStyle(1, 0x1c1000, 0.5);
                for (let i = 8; i < S - 4; i += 6) {
                    gfx.beginPath(); gfx.moveTo(4, i); gfx.lineTo(S - 5, i + 1); gfx.strokePath();
                }
                // Padlock body
                gfx.fillStyle(0xcc8800);
                gfx.fillRect(S / 2 - 5, S / 2 - 4, 10, 10);
                gfx.fillStyle(0xeeaa22, 0.45);
                gfx.fillRect(S / 2 - 4, S / 2 - 3, 3, 2);
                // Shackle
                gfx.fillStyle(0xaa7200);
                gfx.fillCircle(S / 2 - 3, S / 2 - 8, 3);
                gfx.fillCircle(S / 2 + 3, S / 2 - 8, 3);
                gfx.lineStyle(3, 0xaa7200, 1);
                gfx.beginPath(); gfx.moveTo(S / 2 - 3, S / 2 - 8); gfx.lineTo(S / 2 - 3, S / 2 - 4); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2 + 3, S / 2 - 8); gfx.lineTo(S / 2 + 3, S / 2 - 4); gfx.strokePath();
                // Keyhole
                gfx.fillStyle(0x1a0800);
                gfx.fillCircle(S / 2, S / 2 + 1, 2);
                gfx.fillRect(S / 2 - 1, S / 2 + 1, 2, 4);
                gfx.lineStyle(2, 0x995500, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('door_locked', S, S);
            },

            save_room: () => {
                gfx.clear();
                gfx.fillStyle(0x0a1a10);
                gfx.fillRect(0, 0, S, S);
                // Soft glow center
                gfx.fillStyle(0x102018, 0.5);
                gfx.fillEllipse(S / 2, S / 2, S * 0.8, S * 0.8);
                // Subtle grid
                gfx.lineStyle(1, 0x15301a, 0.45);
                for (let i = 4; i < S; i += 8) {
                    gfx.beginPath(); gfx.moveTo(i, 0); gfx.lineTo(i, S); gfx.strokePath();
                    gfx.beginPath(); gfx.moveTo(0, i); gfx.lineTo(S, i); gfx.strokePath();
                }
                gfx.lineStyle(1, 0x1c4822, 0.8);
                gfx.strokeRect(1, 1, S - 2, S - 2);
                gfx.lineStyle(1, 0x0f2e14, 0.5);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('save_room', S, S);
            },

            obstacle: () => {
                gfx.clear();
                // Wooden crate base
                gfx.fillStyle(0x3a2e1a);
                gfx.fillRect(0, 0, S, S);
                // Top face lighter
                gfx.fillStyle(0x4a3c22, 0.4);
                gfx.fillRect(0, 0, S, S / 3);
                // Plank lines
                gfx.lineStyle(1, 0x281e0e, 0.9);
                gfx.beginPath(); gfx.moveTo(0, S / 3); gfx.lineTo(S, S / 3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(0, S * 2 / 3); gfx.lineTo(S, S * 2 / 3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2, 0); gfx.lineTo(S / 2, S); gfx.strokePath();
                // Metal corner brackets
                gfx.fillStyle(0x484848);
                gfx.fillRect(0, 0, 4, 4);
                gfx.fillRect(S - 4, 0, 4, 4);
                gfx.fillRect(0, S - 4, 4, 4);
                gfx.fillRect(S - 4, S - 4, 4, 4);
                // X brace
                gfx.lineStyle(1, 0x282010, 0.55);
                gfx.beginPath(); gfx.moveTo(2, 2); gfx.lineTo(S - 2, S - 2); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S - 2, 2); gfx.lineTo(2, S - 2); gfx.strokePath();
                gfx.lineStyle(2, 0x1a120a, 1);
                gfx.strokeRect(0, 0, S, S);
                gfx.generateTexture('obstacle', S, S);
            },

            door_passage: () => {
                gfx.clear();
                // Frame
                gfx.fillStyle(0x1a2230);
                gfx.fillRect(0, 0, S, S);
                // Left panel
                gfx.fillStyle(0x2a3a50);
                gfx.fillRect(1, 1, S / 2 - 2, S - 2);
                // Right panel
                gfx.fillStyle(0x243245);
                gfx.fillRect(S / 2 + 1, 1, S / 2 - 2, S - 2);
                // Bevel highlights
                gfx.fillStyle(0x3a5065, 0.5);
                gfx.fillRect(1, 1, S / 2 - 2, 2);
                gfx.fillRect(1, 1, 2, S - 2);
                gfx.fillRect(S / 2 + 1, 1, S / 2 - 2, 2);
                // Center seam
                gfx.fillStyle(0x080c14);
                gfx.fillRect(S / 2 - 1, 0, 2, S);
                // Horizontal ribs
                gfx.lineStyle(1, 0x354a62, 0.7);
                gfx.beginPath(); gfx.moveTo(1, S * 0.3); gfx.lineTo(S / 2 - 2, S * 0.3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(1, S * 0.7); gfx.lineTo(S / 2 - 2, S * 0.7); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2 + 2, S * 0.3); gfx.lineTo(S - 1, S * 0.3); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(S / 2 + 2, S * 0.7); gfx.lineTo(S - 1, S * 0.7); gfx.strokePath();
                // Green status indicator
                gfx.fillStyle(0x00cc66);
                gfx.fillRect(3, S - 4, S - 6, 2);
                gfx.fillStyle(0x00ff88, 0.4);
                gfx.fillRect(3, S - 5, S - 6, 1);
                // Top glare
                gfx.fillStyle(0x4a6080, 0.4);
                gfx.fillRect(2, 2, S - 4, 2);
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

        this._drawLeon(gfx, W, H);
        gfx.generateTexture('leon', W, H);
        gfx.clear();

        this._drawLeon(gfx, W, H, true);
        gfx.generateTexture('leon_hurt', W, H);
        gfx.clear();

        this._drawBarry(gfx, W, H);
        gfx.generateTexture('barry', W, H);
        gfx.clear();

        this._drawLucia(gfx, W, H);
        gfx.generateTexture('lucia', W, H);
        gfx.clear();

        gfx.destroy();

        this._genPlayerSpritesheet();
    },

    _drawLeon(gfx, W, H, hurt = false) {
        const bodyCol  = hurt ? 0x5a1818 : 0x18203c;
        const skinCol  = hurt ? 0xa07060 : 0xd4a880;
        const pantsCol = hurt ? 0x180c0c : 0x0e1528;
        const vestHigh = hurt ? 0x6e2020 : 0x222e50;

        // Floor shadow
        gfx.fillStyle(0x000000, 0.25);
        gfx.fillEllipse(W / 2, H - 1, 18, 5);

        // Boots
        gfx.fillStyle(0x121212);
        gfx.fillRect(5, H - 6, 8, 6);
        gfx.fillRect(W - 13, H - 6, 8, 6);
        gfx.fillStyle(0x1e1e1e, 0.45);
        gfx.fillRect(5, H - 6, 8, 2);
        gfx.fillRect(W - 13, H - 6, 8, 2);

        // Pants
        gfx.fillStyle(pantsCol);
        gfx.fillRect(6, 26, 7, H - 32);
        gfx.fillRect(W - 13, 26, 7, H - 32);
        // Pants seam highlight
        gfx.fillStyle(0x16203a, 0.45);
        gfx.fillRect(8, 26, 2, H - 32);
        gfx.fillRect(W - 11, 26, 2, H - 32);

        // Tactical vest body
        gfx.fillStyle(bodyCol);
        gfx.fillRect(5, 13, W - 10, 16);
        // Vest top highlight
        gfx.fillStyle(vestHigh, 0.5);
        gfx.fillRect(5, 13, W - 10, 4);
        // Vest bottom shadow
        gfx.fillStyle(0x080c18, 0.4);
        gfx.fillRect(5, 25, W - 10, 4);
        // Pockets
        gfx.fillStyle(hurt ? 0x4a1010 : 0x2a3860);
        gfx.fillRect(6, 17, 5, 4);
        gfx.fillRect(W - 11, 17, 5, 4);
        gfx.fillStyle(hurt ? 0x3a0808 : 0x202c50);
        gfx.fillRect(6, 17, 5, 1);
        gfx.fillRect(W - 11, 17, 5, 1);
        // USSTRATCOM patch
        gfx.fillStyle(0x3050a0);
        gfx.fillRect(7, 14, 5, 2);
        // Belt
        gfx.fillStyle(0x1a1a1a);
        gfx.fillRect(5, 25, W - 10, 2);
        gfx.fillStyle(0x444444);
        gfx.fillRect(W / 2 - 3, 25, 6, 2);

        // Neck
        gfx.fillStyle(skinCol);
        gfx.fillRect(W / 2 - 2, 10, 4, 4);

        // Head
        gfx.fillStyle(skinCol);
        gfx.fillRect(7, 2, W - 14, 11);
        // Side shadows
        gfx.fillStyle(0x000000, 0.14);
        gfx.fillRect(7, 2, 2, 11);
        gfx.fillRect(W - 9, 2, 2, 11);
        // Jaw shadow
        gfx.fillStyle(0x000000, 0.12);
        gfx.fillRect(7, 10, W - 14, 3);

        // Hair (blonde)
        gfx.fillStyle(0xc8a040);
        gfx.fillRect(7, 2, W - 14, 5);
        gfx.fillRect(7, 2, 3, 8);
        gfx.fillRect(W - 10, 2, 3, 6);
        gfx.fillStyle(0xdcb858, 0.5);
        gfx.fillRect(9, 2, W - 18, 2);

        // Eyes
        gfx.fillStyle(0x2a1800);
        gfx.fillRect(9, 7, 3, 2);
        gfx.fillRect(W - 12, 7, 3, 2);
        gfx.fillStyle(0x6a9ad0);
        gfx.fillRect(10, 7, 2, 2);
        gfx.fillRect(W - 11, 7, 2, 2);

        // Mouth
        gfx.fillStyle(0x885040, 0.65);
        gfx.fillRect(10, 11, W - 20, 1);
    },

    _drawBarry(gfx, W, H) {
        const skinCol = 0xbe8a5a;

        // Floor shadow
        gfx.fillStyle(0x000000, 0.25);
        gfx.fillEllipse(W / 2, H - 1, 20, 5);

        // Boots
        gfx.fillStyle(0x1e1818);
        gfx.fillRect(4, H - 6, 9, 6);
        gfx.fillRect(W - 13, H - 6, 9, 6);
        gfx.fillStyle(0x2c2020, 0.45);
        gfx.fillRect(4, H - 6, 9, 2);
        gfx.fillRect(W - 13, H - 6, 9, 2);

        // Pants
        gfx.fillStyle(0x241808);
        gfx.fillRect(5, 26, 8, H - 32);
        gfx.fillRect(W - 13, 26, 8, H - 32);

        // Jacket body (stockier — wider)
        gfx.fillStyle(0x6a2010);
        gfx.fillRect(4, 13, W - 8, 16);
        gfx.fillStyle(0x7e3020, 0.5);
        gfx.fillRect(4, 13, W - 8, 4);
        gfx.fillStyle(0x4a1008, 0.5);
        gfx.fillRect(4, 25, W - 8, 4);
        // Lapels / collar
        gfx.fillStyle(0x5a1808);
        gfx.fillRect(10, 13, 4, 6);
        gfx.fillRect(W - 14, 13, 4, 6);
        // Buttons
        gfx.fillStyle(0x2a1a0e);
        gfx.fillCircle(W / 2, 16, 1);
        gfx.fillCircle(W / 2, 19, 1);
        gfx.fillCircle(W / 2, 22, 1);
        // Belt
        gfx.fillStyle(0x1a1a1a);
        gfx.fillRect(4, 25, W - 8, 2);
        gfx.fillStyle(0x555555);
        gfx.fillRect(W / 2 - 3, 25, 6, 2);

        // Neck
        gfx.fillStyle(skinCol);
        gfx.fillRect(W / 2 - 3, 10, 6, 4);

        // Head (slightly wider)
        gfx.fillStyle(skinCol);
        gfx.fillRect(6, 2, W - 12, 11);
        gfx.fillStyle(0x000000, 0.12);
        gfx.fillRect(6, 2, 2, 11);
        gfx.fillRect(W - 8, 2, 2, 11);

        // Hair (reddish-brown, receding)
        gfx.fillStyle(0x7a4020);
        gfx.fillRect(6, 2, W - 12, 4);
        gfx.fillRect(6, 2, 3, 7);
        gfx.fillRect(W - 9, 2, 3, 5);

        // Beard (lower half of face)
        gfx.fillStyle(0x7a4020);
        gfx.fillRect(6, 7, W - 12, 6);
        gfx.fillStyle(0x8a5030, 0.45);
        gfx.fillRect(7, 7, W - 14, 2);
        gfx.fillRect(7, 10, W - 14, 2);

        // Eyes
        gfx.fillStyle(0x1a0800);
        gfx.fillRect(8, 5, 3, 2);
        gfx.fillRect(W - 11, 5, 3, 2);
        gfx.fillStyle(0x5a3a20);
        gfx.fillRect(9, 5, 2, 2);
        gfx.fillRect(W - 10, 5, 2, 2);
    },

    _drawLucia(gfx, W, H) {
        const skinCol = 0xd4a880;

        // Floor shadow
        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, 16, 4);

        // Shoes
        gfx.fillStyle(0x3a2010);
        gfx.fillRect(7, H - 4, 7, 4);
        gfx.fillRect(W - 14, H - 4, 7, 4);

        // Bare legs
        gfx.fillStyle(skinCol);
        gfx.fillRect(8, 30, 6, H - 34);
        gfx.fillRect(W - 14, 30, 6, H - 34);
        gfx.fillStyle(0x000000, 0.1);
        gfx.fillRect(8, 30, 1, H - 34);
        gfx.fillRect(W - 9, 30, 1, H - 34);

        // Skirt (dark)
        gfx.fillStyle(0x2c2832);
        gfx.fillRect(6, 24, W - 12, 10);
        gfx.fillStyle(0x383444, 0.4);
        gfx.fillRect(6, 24, W - 12, 3);
        gfx.lineStyle(1, 0x201c2a, 0.7);
        gfx.beginPath(); gfx.moveTo(6, 33); gfx.lineTo(W - 6, 34); gfx.strokePath();

        // White blouse
        gfx.fillStyle(0xe0ddd8);
        gfx.fillRect(7, 13, W - 14, 14);
        gfx.fillStyle(0x000000, 0.08);
        gfx.fillRect(7, 13, 2, 14);
        gfx.fillRect(W - 9, 13, 2, 14);
        gfx.fillStyle(0xffffff, 0.15);
        gfx.fillRect(7, 13, W - 14, 3);
        // Collar
        gfx.fillStyle(0xd0ccc8);
        gfx.fillRect(10, 13, W - 20, 3);
        // Waistband
        gfx.fillStyle(0x202028);
        gfx.fillRect(6, 23, W - 12, 2);

        // Neck
        gfx.fillStyle(skinCol);
        gfx.fillRect(W / 2 - 2, 10, 4, 4);

        // Head
        gfx.fillStyle(skinCol);
        gfx.fillRect(8, 2, W - 16, 11);
        gfx.fillStyle(0x000000, 0.1);
        gfx.fillRect(8, 2, 2, 11);
        gfx.fillRect(W - 10, 2, 2, 11);
        gfx.fillStyle(0x000000, 0.1);
        gfx.fillRect(8, 10, W - 16, 3);

        // Dark hair (longer sides)
        gfx.fillStyle(0x150f0f);
        gfx.fillRect(8, 2, W - 16, 4);
        gfx.fillRect(8, 2, 3, 14);
        gfx.fillRect(W - 11, 2, 3, 12);
        gfx.fillStyle(0x2a2020, 0.6);
        gfx.fillRect(10, 2, W - 20, 2);

        // Eyes
        gfx.fillStyle(0x150800);
        gfx.fillRect(10, 7, 3, 2);
        gfx.fillRect(W - 13, 7, 3, 2);
        gfx.fillStyle(0x4a3030);
        gfx.fillRect(11, 7, 2, 2);
        gfx.fillRect(W - 12, 7, 2, 2);

        // Mouth
        gfx.fillStyle(0xc07060, 0.75);
        gfx.fillRect(11, 11, W - 22, 1);
    },

    _genPlayerSpritesheet() {
        const FW = 24, FH = 36;
        const COLS = 8, ROWS = 1;
        const rt = this.scene.add.renderTexture(0, 0, FW * COLS, FH * ROWS);
        rt.setVisible(false);

        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        const drawFrame = (col, direction, walking) => {
            gfx.clear();
            const ox = col * FW;

            // Body
            gfx.fillStyle(0x18203c);
            gfx.fillRect(ox + 5, FH * 0 + 13, FW - 10, 16);
            gfx.fillStyle(0x222e50, 0.4);
            gfx.fillRect(ox + 5, FH * 0 + 13, FW - 10, 4);

            // Head
            gfx.fillStyle(0xd4a880);
            gfx.fillRect(ox + 7, FH * 0 + 2, FW - 14, 11);

            // Hair
            gfx.fillStyle(0xc8a040);
            gfx.fillRect(ox + 7, FH * 0 + 2, FW - 14, 5);

            // Eyes
            gfx.fillStyle(0x2a1800);
            gfx.fillRect(ox + 9, FH * 0 + 7, 3, 2);
            gfx.fillRect(ox + FW - 12, FH * 0 + 7, 3, 2);
            gfx.fillStyle(0x6a9ad0);
            gfx.fillRect(ox + 10, FH * 0 + 7, 2, 2);
            gfx.fillRect(ox + FW - 11, FH * 0 + 7, 2, 2);

            // Belt
            gfx.fillStyle(0x1a1a1a);
            gfx.fillRect(ox + 5, FH * 0 + 25, FW - 10, 2);

            // Legs (walk animation offset)
            const lly = walking ? FH * 0 + 26 : FH * 0 + 28;
            const rly = walking ? FH * 0 + 28 : FH * 0 + 26;
            gfx.fillStyle(0x0e1528);
            gfx.fillRect(ox + 6, lly, 7, FH - lly + FH * 0 - 4);
            gfx.fillRect(ox + FW - 13, rly, 7, FH - rly + FH * 0 - 4);

            // Boots
            gfx.fillStyle(0x121212);
            gfx.fillRect(ox + 5, FH * 0 + FH - 6, 8, 6);
            gfx.fillRect(ox + FW - 13, FH * 0 + FH - 6, 8, 6);

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
            this.scene.textures.get('leon_sheet').add('frame_' + i, 0, i * FW, 0, FW, FH);
        }
    },

    // =========================================================
    // ENEMIES
    // =========================================================
    _genEnemies() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        this._drawZombie(gfx);
        gfx.generateTexture('zombie', 24, 36);
        gfx.clear();

        this._drawZombieSailor(gfx);
        gfx.generateTexture('zombie_sailor', 24, 36);
        gfx.clear();

        this._drawLurker(gfx);
        gfx.generateTexture('lurker', 32, 28);
        gfx.clear();

        this._drawZombieDog(gfx);
        gfx.generateTexture('zombie_dog', 40, 24);
        gfx.clear();

        this._drawLicker(gfx);
        gfx.generateTexture('licker', 36, 28);
        gfx.clear();

        this._drawCreature(gfx, 1);
        gfx.generateTexture('creature_p1', 48, 64);
        gfx.clear();

        this._drawCreature(gfx, 2);
        gfx.generateTexture('creature_p2', 64, 72);
        gfx.clear();

        gfx.destroy();
    },

    _drawZombie(gfx) {
        const W = 24, H = 36;

        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, 18, 4);

        // Boots (asymmetric — dragging gait)
        gfx.fillStyle(0x181818);
        gfx.fillRect(5, H - 6, 8, 6);
        gfx.fillRect(W - 13, H - 5, 8, 5);

        // Torn pants
        gfx.fillStyle(0x181818);
        gfx.fillRect(6, 26, 7, H - 32);
        gfx.fillRect(W - 13, 27, 7, H - 33);
        gfx.fillStyle(0x4a3830, 0.45);
        gfx.fillRect(8, 28, 3, 2);
        gfx.fillRect(W - 10, 30, 3, 2);

        // Torn shirt
        gfx.fillStyle(0x252020);
        gfx.fillRect(5, 13, W - 10, 16);
        gfx.fillStyle(0x3a3030, 0.4);
        gfx.fillRect(5, 13, W - 10, 3);
        // Shirt tears
        gfx.fillStyle(0x4a3a35);
        gfx.fillRect(14, 17, 4, 5);
        gfx.fillRect(7, 22, 3, 4);

        // Blood stain (large, dark)
        gfx.fillStyle(0x7a0808, 0.85);
        gfx.fillEllipse(11, 18, 12, 10);
        gfx.fillStyle(0x4a0404, 0.6);
        gfx.fillEllipse(10, 20, 8, 6);
        // Blood drip
        gfx.fillStyle(0x6a0606, 0.7);
        gfx.fillRect(9, 22, 2, 4);

        // Neck (greenish)
        gfx.fillStyle(0x4a6040);
        gfx.fillRect(W / 2 - 2, 10, 4, 4);

        // Head (pale greenish skin)
        gfx.fillStyle(0x4a6a40);
        gfx.fillRect(7, 2, W - 14, 11);
        // Decomposition patches
        gfx.fillStyle(0x3a5030, 0.65);
        gfx.fillEllipse(10, 5, 5, 4);
        gfx.fillEllipse(W - 9, 7, 4, 5);
        gfx.fillStyle(0x5a7a50, 0.3);
        gfx.fillRect(7, 2, W - 14, 3);

        // Sparse matted hair
        gfx.fillStyle(0x2a2010);
        gfx.fillRect(7, 2, W - 14, 3);
        gfx.fillStyle(0x3a3020, 0.5);
        gfx.fillRect(9, 2, 3, 2);
        gfx.fillRect(14, 2, 4, 2);

        // Milky sunken eyes
        gfx.fillStyle(0x1a0a00);
        gfx.fillRect(8, 5, 5, 4);
        gfx.fillRect(W - 13, 5, 5, 4);
        gfx.fillStyle(0xddddcc);
        gfx.fillRect(9, 6, 3, 3);
        gfx.fillRect(W - 12, 6, 3, 3);
        gfx.fillStyle(0x8a8870, 0.65);
        gfx.fillCircle(10, 7, 1);
        gfx.fillCircle(W - 11, 7, 1);

        // Open jaw / slack mouth
        gfx.fillStyle(0x100404);
        gfx.fillRect(9, 10, W - 18, 3);
        // Ragged teeth
        gfx.fillStyle(0xc8c0a0);
        gfx.fillRect(10, 10, 2, 2);
        gfx.fillRect(13, 10, 2, 2);
        gfx.fillRect(16, 10, 1, 2);
    },

    _drawZombieSailor(gfx) {
        const W = 24, H = 36;

        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, 18, 4);

        gfx.fillStyle(0x1e1a18);
        gfx.fillRect(5, H - 6, 8, 6);
        gfx.fillRect(W - 13, H - 6, 8, 6);

        // Navy pants
        gfx.fillStyle(0x0e1e30);
        gfx.fillRect(6, 26, 7, H - 32);
        gfx.fillRect(W - 13, 26, 7, H - 32);

        // Sailor uniform
        gfx.fillStyle(0x1a3050);
        gfx.fillRect(5, 13, W - 10, 16);
        gfx.fillStyle(0x243a60, 0.4);
        gfx.fillRect(5, 13, W - 10, 3);
        // Naval collar / V-neck
        gfx.fillStyle(0x243a60);
        gfx.fillRect(9, 13, 6, 5);
        gfx.fillStyle(0x0c1e38);
        gfx.fillRect(10, 13, 4, 4);
        // White rank stripe
        gfx.fillStyle(0xd0d0c8);
        gfx.fillRect(5, 21, W - 10, 2);

        // Blood wound
        gfx.fillStyle(0x880808, 0.9);
        gfx.fillEllipse(12, 17, 8, 7);
        gfx.fillStyle(0x550404, 0.7);
        gfx.fillRect(11, 20, 2, 5);

        // Neck
        gfx.fillStyle(0x506050);
        gfx.fillRect(W / 2 - 2, 10, 4, 4);

        // Head (grey-green)
        gfx.fillStyle(0x506050);
        gfx.fillRect(7, 2, W - 14, 11);
        gfx.fillStyle(0x405040, 0.5);
        gfx.fillEllipse(12, 6, 6, 5);

        // Sailor hat
        gfx.fillStyle(0x1a2e48);
        gfx.fillRect(6, 0, W - 12, 4);
        gfx.fillRect(4, 1, W - 8, 2);
        gfx.fillStyle(0xd0d0c8);
        gfx.fillRect(8, 0, W - 16, 1);

        // Milky eyes
        gfx.fillStyle(0x0a0804);
        gfx.fillRect(8, 5, 5, 4);
        gfx.fillRect(W - 13, 5, 5, 4);
        gfx.fillStyle(0xddddcc);
        gfx.fillRect(9, 6, 3, 3);
        gfx.fillRect(W - 12, 6, 3, 3);

        // Open mouth
        gfx.fillStyle(0x100404);
        gfx.fillRect(9, 10, W - 18, 3);
        gfx.fillStyle(0xc8c0a0);
        gfx.fillRect(10, 10, 2, 2);
        gfx.fillRect(14, 10, 2, 2);
    },

    _drawLurker(gfx) {
        const W = 32, H = 28;

        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, W - 4, 6);

        // Body base
        gfx.fillStyle(0x1a3a30);
        gfx.fillEllipse(W / 2, H / 2, W - 4, H - 4);
        // Body highlight
        gfx.fillStyle(0x2a5045, 0.4);
        gfx.fillEllipse(W / 2, H / 2 - 3, W * 0.6, H * 0.4);
        // Scale texture
        gfx.fillStyle(0x102820, 0.6);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                gfx.fillRect(6 + col * 6 + (row % 2) * 3, 8 + row * 5, 4, 3);
            }
        }

        // Tentacle limbs
        gfx.fillStyle(0x102820);
        gfx.fillEllipse(4, H / 2, 10, 8);
        gfx.fillEllipse(W - 4, H / 2, 10, 8);
        gfx.fillEllipse(W / 2, H - 4, 8, 10);
        gfx.fillStyle(0x1a3828, 0.5);
        gfx.fillEllipse(4, H / 2 - 1, 6, 4);
        gfx.fillEllipse(W - 4, H / 2 - 1, 6, 4);

        // Bioluminescent yellow eyes
        gfx.fillStyle(0x1a1000);
        gfx.fillCircle(W / 2 - 5, H / 2 - 4, 5);
        gfx.fillCircle(W / 2 + 5, H / 2 - 4, 5);
        gfx.fillStyle(0xffee00);
        gfx.fillCircle(W / 2 - 5, H / 2 - 4, 3);
        gfx.fillCircle(W / 2 + 5, H / 2 - 4, 3);
        gfx.fillStyle(0xffffaa, 0.6);
        gfx.fillCircle(W / 2 - 5, H / 2 - 4, 1.5);
        gfx.fillCircle(W / 2 + 5, H / 2 - 4, 1.5);
        // Pupils
        gfx.fillStyle(0x000000);
        gfx.fillCircle(W / 2 - 4, H / 2 - 4, 1);
        gfx.fillCircle(W / 2 + 6, H / 2 - 4, 1);

        // Maw
        gfx.fillStyle(0x0a1808);
        gfx.fillRect(W / 2 - 4, H / 2 + 2, 8, 3);
        gfx.fillStyle(0x6a0808, 0.65);
        gfx.fillRect(W / 2 - 3, H / 2 + 3, 6, 1);
    },

    _drawZombieDog(gfx) {
        const W = 40, H = 24;

        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, W - 6, 5);

        // Body
        gfx.fillStyle(0x382820);
        gfx.fillRect(6, 8, W - 14, H - 12);
        gfx.fillStyle(0x4a3828, 0.4);
        gfx.fillRect(6, 8, W - 14, 4);
        gfx.fillStyle(0x201810, 0.5);
        gfx.fillRect(6, H - 8, W - 14, 4);

        // Exposed ribs / bare muscle
        gfx.fillStyle(0xaa2020, 0.65);
        gfx.fillRect(10, 9, 3, H - 16);
        gfx.fillRect(15, 9, 2, H - 16);
        gfx.fillRect(19, 9, 3, H - 16);
        // Bone white
        gfx.fillStyle(0xd8c8a0, 0.5);
        gfx.fillRect(11, 10, 1, H - 17);
        gfx.fillRect(16, 10, 1, H - 17);
        gfx.fillRect(20, 10, 1, H - 17);

        // Tail stump
        gfx.fillStyle(0x2a1810);
        gfx.fillRect(4, H / 2 - 3, 5, 5);

        // Head
        gfx.fillStyle(0x4a3020);
        gfx.fillRect(W - 16, 3, 16, H - 7);
        gfx.fillStyle(0x5a4030, 0.4);
        gfx.fillRect(W - 16, 3, 16, 4);
        // Snout
        gfx.fillStyle(0x301808);
        gfx.fillRect(W - 8, H / 2 - 2, 8, 8);
        gfx.fillStyle(0x200c06);
        gfx.fillRect(W - 6, H / 2, 2, 2);

        // Open jaw
        gfx.fillStyle(0x3a1010);
        gfx.fillRect(W - 14, H / 2 + 2, 14, 6);
        gfx.fillStyle(0x8a2020);
        gfx.fillRect(W - 13, H / 2 + 2, 12, 2);
        // Teeth
        gfx.fillStyle(0xe8e0c0);
        for (let i = 0; i < 4; i++) {
            gfx.fillRect(W - 13 + i * 3, H / 2 + 2, 2, 3);
        }

        // Red sunken eyes
        gfx.fillStyle(0x1a0808);
        gfx.fillRect(W - 15, 5, 5, 4);
        gfx.fillStyle(0xff4400);
        gfx.fillRect(W - 14, 6, 3, 2);
        gfx.fillStyle(0xff8844, 0.5);
        gfx.fillRect(W - 14, 6, 2, 1);

        // Legs (4)
        gfx.fillStyle(0x281808);
        gfx.fillRect(4, H - 8, 5, 8);
        gfx.fillRect(12, H - 8, 5, 8);
        gfx.fillRect(22, H - 7, 5, 7);
        gfx.fillRect(30, H - 8, 5, 8);
        // Claws
        gfx.fillStyle(0x1e1e1e);
        gfx.fillRect(4, H - 2, 6, 2);
        gfx.fillRect(12, H - 2, 6, 2);
        gfx.fillRect(22, H - 1, 6, 1);
        gfx.fillRect(30, H - 2, 6, 2);
    },

    _drawLicker(gfx) {
        const W = 36, H = 28;

        gfx.fillStyle(0x000000, 0.2);
        gfx.fillEllipse(W / 2, H - 1, W - 4, 6);

        // Exposed muscle body
        gfx.fillStyle(0x8a1818);
        gfx.fillRect(8, 6, W - 16, H - 10);
        gfx.fillStyle(0xa02020, 0.5);
        gfx.fillRect(8, 6, W - 16, 5);
        gfx.fillStyle(0x5a0808, 0.5);
        gfx.fillRect(8, H - 8, W - 16, 4);

        // Spine ridge
        gfx.fillStyle(0xc02020, 0.65);
        gfx.fillRect(W / 2 - 1, 6, 2, H - 10);
        gfx.fillStyle(0xd84040, 0.4);
        gfx.fillRect(W / 2, 6, 1, H - 10);

        // Visible ribs
        gfx.fillStyle(0xd8c8a8, 0.5);
        for (let i = 0; i < 4; i++) {
            gfx.fillRect(9, 9 + i * 4, W - 18, 1);
        }

        // Left claws
        gfx.fillStyle(0x4a1010);
        gfx.fillRect(0, H / 2 - 2, 12, 6);
        gfx.fillStyle(0xd0c0a0);
        gfx.fillRect(0, H / 2 - 2, 2, 1);
        gfx.fillRect(3, H / 2 - 2, 2, 1);
        gfx.fillRect(6, H / 2 - 2, 2, 1);
        // Right claws
        gfx.fillStyle(0x4a1010);
        gfx.fillRect(W - 12, H / 2 - 2, 12, 6);
        gfx.fillStyle(0xd0c0a0);
        gfx.fillRect(W - 2, H / 2 - 2, 2, 1);
        gfx.fillRect(W - 5, H / 2 - 2, 2, 1);
        gfx.fillRect(W - 8, H / 2 - 2, 2, 1);

        // Head (exposed brain mass — blind)
        gfx.fillStyle(0x7a1515);
        gfx.fillRect(W / 2 - 7, 1, 14, 12);
        gfx.fillStyle(0xaa2020, 0.55);
        gfx.fillEllipse(W / 2 - 2, 5, 8, 6);
        gfx.fillEllipse(W / 2 + 2, 7, 8, 5);
        // Sunken eye sockets (no irises)
        gfx.fillStyle(0x2a0808);
        gfx.fillRect(W / 2 - 5, 5, 3, 3);
        gfx.fillRect(W / 2 + 2, 5, 3, 3);

        // Long barbed tongue
        gfx.fillStyle(0xdd3333);
        gfx.fillRect(W / 2 - 2, 1, 4, 22);
        gfx.fillStyle(0xee5555, 0.5);
        gfx.fillRect(W / 2 - 1, 1, 2, 22);
        // Tongue barb
        gfx.fillStyle(0xcc2020);
        gfx.fillRect(W / 2 - 3, 20, 6, 4);
        gfx.fillStyle(0xaa1818);
        gfx.fillRect(W / 2 - 4, 22, 2, 4);
        gfx.fillRect(W / 2 + 2, 22, 2, 4);
    },

    _drawCreature(gfx, phase) {
        if (phase === 1) {
            const W = 48, H = 64;

            gfx.fillStyle(0x000000, 0.3);
            gfx.fillEllipse(W / 2, H - 2, W - 8, 8);

            // Legs
            gfx.fillStyle(0x0c0c1e);
            gfx.fillRect(12, H - 22, 12, 22);
            gfx.fillRect(W - 24, H - 22, 12, 22);
            gfx.fillStyle(0x1a1a30, 0.4);
            gfx.fillRect(12, H - 22, 4, 22);
            gfx.fillRect(W - 24, H - 22, 4, 22);
            // Chitin leg plates
            gfx.fillStyle(0x1e1e38);
            gfx.fillRect(13, H - 20, 10, 6);
            gfx.fillRect(W - 23, H - 20, 10, 6);
            gfx.fillRect(13, H - 10, 10, 6);
            gfx.fillRect(W - 23, H - 10, 10, 6);

            // Torso
            gfx.fillStyle(0x0a0a1e);
            gfx.fillRect(10, 18, W - 20, H - 40);
            // Chest chitin armor
            gfx.fillStyle(0x1a1a32);
            gfx.fillRect(10, 16, W - 20, 24);
            gfx.fillStyle(0x252540, 0.4);
            gfx.fillRect(10, 16, W - 20, 6);
            gfx.fillStyle(0x050510, 0.5);
            gfx.fillRect(10, 36, W - 20, 4);
            // Ribcage suggestion
            gfx.fillStyle(0x202038, 0.55);
            for (let i = 0; i < 3; i++) {
                gfx.fillRect(11, 20 + i * 6, W - 22, 3);
            }
            // Chest wound crack
            gfx.lineStyle(1, 0x440000, 0.65);
            gfx.beginPath();
            gfx.moveTo(W / 2, 18);
            gfx.lineTo(W / 2 - 3, 28);
            gfx.lineTo(W / 2 + 2, 36);
            gfx.strokePath();

            // Massive arms
            gfx.fillStyle(0x0c0c1c);
            gfx.fillRect(0, 18, 14, 28);
            gfx.fillRect(W - 14, 18, 14, 28);
            gfx.fillStyle(0x1a1a2e, 0.5);
            gfx.fillRect(0, 18, 4, 28);
            gfx.fillRect(W - 4, 18, 4, 28);
            // Arm armor plates
            gfx.fillStyle(0x1c1c32);
            gfx.fillRect(0, 22, 12, 6);
            gfx.fillRect(W - 12, 22, 12, 6);
            gfx.fillRect(0, 32, 12, 6);
            gfx.fillRect(W - 12, 32, 12, 6);

            // Claws
            gfx.fillStyle(0x2a2a48);
            gfx.fillRect(0, 42, 7, 12);
            gfx.fillRect(W - 7, 42, 7, 12);
            gfx.fillStyle(0x4a4a70, 0.5);
            gfx.fillRect(0, 42, 2, 12);
            gfx.fillRect(W - 2, 42, 2, 12);
            gfx.fillStyle(0x606090);
            gfx.fillRect(0, 52, 4, 2);
            gfx.fillRect(W - 4, 52, 4, 2);

            // Elongated head (chitinous)
            gfx.fillStyle(0x131325);
            gfx.fillRect(W / 2 - 9, 1, 18, 18);
            gfx.fillStyle(0x1e1e38, 0.5);
            gfx.fillRect(W / 2 - 9, 1, 18, 5);
            // Skull ridge
            gfx.fillStyle(0x1c1c34);
            gfx.fillRect(W / 2 - 2, 1, 4, 18);
            // Red glowing eyes
            gfx.fillStyle(0x400000);
            gfx.fillRect(W / 2 - 8, 5, 6, 6);
            gfx.fillRect(W / 2 + 2, 5, 6, 6);
            gfx.fillStyle(0xff2200);
            gfx.fillRect(W / 2 - 7, 6, 4, 4);
            gfx.fillRect(W / 2 + 3, 6, 4, 4);
            gfx.fillStyle(0xff6644, 0.5);
            gfx.fillRect(W / 2 - 6, 6, 2, 2);
            gfx.fillRect(W / 2 + 4, 6, 2, 2);
            // Mandibles
            gfx.fillStyle(0x1a1a2c);
            gfx.fillRect(W / 2 - 7, 14, 5, 6);
            gfx.fillRect(W / 2 + 2, 14, 5, 6);
            gfx.fillStyle(0x303050, 0.55);
            gfx.fillRect(W / 2 - 6, 16, 3, 3);
            gfx.fillRect(W / 2 + 3, 16, 3, 3);

        } else {
            const W = 64, H = 72;

            gfx.fillStyle(0x000000, 0.35);
            gfx.fillEllipse(W / 2, H - 2, W - 6, 10);

            // Organic body mass
            gfx.fillStyle(0x1a0820);
            gfx.fillRect(14, 22, W - 28, H - 30);
            gfx.fillStyle(0x2a0d35, 0.55);
            gfx.fillEllipse(W / 2, H / 2, W - 10, H * 0.55);
            // Pulsing veins
            gfx.fillStyle(0x5a0840, 0.4);
            gfx.fillRect(W / 2 - 1, 20, 2, H - 28);
            gfx.fillRect(W / 2 - 8, 25, 2, H * 0.35);
            gfx.fillRect(W / 2 + 6, 28, 2, H * 0.3);

            // Lower appendages (tentacles)
            gfx.fillStyle(0x180620);
            for (let i = 0; i < 6; i++) {
                const tx = 4 + i * 10;
                gfx.fillRect(tx, H - 18, 5, 18);
                gfx.fillStyle(0x241030, 0.5);
                gfx.fillRect(tx, H - 18, 2, 18);
                gfx.fillStyle(0x180620);
            }
            gfx.fillStyle(0x3a0848);
            for (let i = 0; i < 6; i++) {
                gfx.fillRect(4 + i * 10, H - 4, 5, 4);
            }

            // Upper arms
            gfx.fillStyle(0x200830);
            gfx.fillRect(0, 28, 18, 8);
            gfx.fillRect(W - 18, 30, 18, 8);
            gfx.fillStyle(0x4a1060);
            gfx.fillRect(0, 24, 6, 14);
            gfx.fillRect(W - 6, 26, 6, 14);

            // Central head
            gfx.fillStyle(0x200a30);
            gfx.fillRect(W / 2 - 10, 2, 20, 20);
            gfx.fillStyle(0x2a0e3c, 0.5);
            gfx.fillRect(W / 2 - 10, 2, 20, 6);
            // Side pseudo-heads
            gfx.fillStyle(0x1c0828);
            gfx.fillRect(W / 2 - 26, 8, 14, 14);
            gfx.fillRect(W / 2 + 12, 7, 14, 13);

            // Main eyes (large orange)
            gfx.fillStyle(0x5a1000);
            gfx.fillCircle(W / 2 - 5, 11, 6);
            gfx.fillCircle(W / 2 + 5, 11, 6);
            gfx.fillStyle(0xff4400);
            gfx.fillCircle(W / 2 - 5, 11, 4);
            gfx.fillCircle(W / 2 + 5, 11, 4);
            gfx.fillStyle(0xff8800, 0.65);
            gfx.fillCircle(W / 2 - 6, 10, 2);
            gfx.fillCircle(W / 2 + 4, 10, 2);
            gfx.fillStyle(0x1a0000);
            gfx.fillCircle(W / 2 - 4, 12, 2);
            gfx.fillCircle(W / 2 + 6, 12, 2);

            // Side head eyes
            gfx.fillStyle(0xcc3300);
            gfx.fillCircle(W / 2 - 19, 13, 3);
            gfx.fillCircle(W / 2 + 19, 12, 3);
            gfx.fillStyle(0xff6600, 0.55);
            gfx.fillCircle(W / 2 - 20, 12, 1.5);
            gfx.fillCircle(W / 2 + 18, 11, 1.5);

            // Central maw
            gfx.fillStyle(0x0a0012);
            gfx.fillRect(W / 2 - 7, 16, 14, 8);
            gfx.fillStyle(0xd8c8a8);
            for (let i = 0; i < 4; i++) {
                gfx.fillRect(W / 2 - 6 + i * 4, 16, 2, 4);
                gfx.fillRect(W / 2 - 5 + i * 4, 20, 2, 3);
            }

            // Bioluminescent patches
            gfx.fillStyle(0x6000a0, 0.3);
            gfx.fillCircle(W / 2 - 12, H / 2, 8);
            gfx.fillCircle(W / 2 + 14, H / 2 + 8, 6);
        }
    },

    // =========================================================
    // UI ELEMENTS
    // =========================================================
    _genUI() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Health bar background
        gfx.fillStyle(0x080808);
        gfx.fillRect(0, 0, 200, 20);
        gfx.fillStyle(0x111111, 0.5);
        gfx.fillRect(1, 1, 198, 9);
        gfx.lineStyle(1, 0x2a2a2a, 1);
        gfx.strokeRect(0, 0, 200, 20);
        gfx.lineStyle(1, 0x444444, 0.45);
        gfx.beginPath(); gfx.moveTo(1, 1); gfx.lineTo(199, 1); gfx.strokePath();
        gfx.generateTexture('healthbar_bg', 200, 20);
        gfx.clear();

        // Crosshair (tactical)
        gfx.lineStyle(1, 0xcc2222, 0.85);
        gfx.beginPath(); gfx.moveTo(16, 2); gfx.lineTo(16, 11); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(16, 21); gfx.lineTo(16, 30); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(2, 16); gfx.lineTo(11, 16); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(21, 16); gfx.lineTo(30, 16); gfx.strokePath();
        gfx.fillStyle(0xcc2222, 0.5);
        gfx.fillCircle(16, 16, 1.5);
        gfx.fillStyle(0xcc2222, 0.3);
        gfx.fillRect(15, 0, 2, 2);
        gfx.fillRect(15, 30, 2, 2);
        gfx.fillRect(0, 15, 2, 2);
        gfx.fillRect(30, 15, 2, 2);
        gfx.generateTexture('crosshair', 32, 32);
        gfx.clear();

        // Combat reticle
        gfx.fillStyle(0xdd0000, 0.85);
        gfx.fillRect(1, 0, 4, 40);
        gfx.fillStyle(0xff4444, 0.4);
        gfx.fillRect(1, 0, 2, 40);
        gfx.fillStyle(0x880000, 0.5);
        gfx.fillRect(4, 0, 2, 40);
        gfx.lineStyle(1, 0xff6666, 0.55);
        gfx.strokeRect(0, 0, 6, 40);
        gfx.generateTexture('reticle', 6, 40);
        gfx.clear();

        // Item slot background
        gfx.fillStyle(0x0e0e0e);
        gfx.fillRect(0, 0, 48, 48);
        gfx.fillStyle(0x151515, 0.5);
        gfx.fillRect(1, 1, 46, 22);
        gfx.lineStyle(1, 0x2a2a30, 1);
        gfx.strokeRect(0, 0, 48, 48);
        gfx.lineStyle(1, 0x1a1a20, 0.5);
        gfx.strokeRect(2, 2, 44, 44);
        gfx.generateTexture('item_slot', 48, 48);
        gfx.clear();

        // Typewriter (save point)
        gfx.fillStyle(0x0a2010);
        gfx.fillRect(0, 0, 40, 32);
        gfx.fillStyle(0x0d2814);
        gfx.fillRect(2, 2, 36, 28);
        gfx.fillStyle(0x10301a);
        gfx.fillRect(4, 4, 32, 20);
        // Paper / platen
        gfx.fillStyle(0xd8e0c0, 0.8);
        gfx.fillRect(8, 4, 24, 5);
        gfx.fillStyle(0x1e3828, 0.5);
        gfx.fillRect(6, 4, 28, 6);
        // Keys
        for (let i = 0; i < 5; i++) {
            gfx.fillStyle(0x18301e);
            gfx.fillRect(5 + i * 6, 12, 5, 7);
            gfx.fillStyle(0x204428);
            gfx.fillRect(6 + i * 6, 13, 3, 5);
        }
        // Platen roll
        gfx.fillStyle(0x0e2818);
        gfx.fillRect(4, 10, 32, 4);
        gfx.fillStyle(0x163020, 0.55);
        gfx.fillRect(4, 10, 32, 2);
        // Base
        gfx.fillStyle(0x082010);
        gfx.fillRect(2, 26, 36, 4);
        gfx.lineStyle(1, 0x204830, 0.8);
        gfx.strokeRect(0, 0, 40, 32);
        gfx.generateTexture('typewriter', 40, 32);
        gfx.clear();

        // Interaction prompt icon
        gfx.fillStyle(0xd4b860);
        gfx.fillRect(0, 0, 24, 24);
        gfx.fillStyle(0xf0d070, 0.4);
        gfx.fillRect(0, 0, 24, 12);
        gfx.fillStyle(0x1a1a00);
        gfx.fillRect(9, 6, 6, 12);
        gfx.fillRect(4, 10, 16, 4);
        gfx.lineStyle(1, 0xa08040, 1);
        gfx.strokeRect(0, 0, 24, 24);
        gfx.generateTexture('interact_icon', 24, 24);
        gfx.clear();

        // Map icon
        gfx.fillStyle(0x0e1e30);
        gfx.fillRect(0, 0, 16, 16);
        gfx.fillStyle(0x142838, 0.5);
        gfx.fillRect(0, 0, 16, 8);
        gfx.lineStyle(1, 0x3060a0, 1);
        gfx.strokeRect(0, 0, 16, 16);
        gfx.lineStyle(2, 0x5090d0, 1);
        gfx.beginPath();
        gfx.moveTo(2, 8); gfx.lineTo(6, 4); gfx.lineTo(10, 10); gfx.lineTo(14, 6);
        gfx.strokePath();
        gfx.fillStyle(0xff4444);
        gfx.fillCircle(14, 6, 2);
        gfx.generateTexture('map_icon', 16, 16);
        gfx.clear();

        gfx.destroy();
    },

    // =========================================================
    // VISUAL EFFECTS
    // =========================================================
    _genEffects() {
        const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Muzzle flash (star-shaped burst)
        gfx.fillStyle(0xffee88, 0.85);
        gfx.fillCircle(16, 16, 10);
        gfx.fillStyle(0xffffff, 0.9);
        gfx.fillCircle(16, 16, 5);
        gfx.fillStyle(0xffcc44, 0.65);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const len = i % 2 === 0 ? 14 : 9;
            const sx = 16 + Math.cos(angle) * 5;
            const sy = 16 + Math.sin(angle) * 5;
            gfx.fillRect(sx - 1, sy - 1, Math.cos(angle) * len, Math.sin(angle) * len);
        }
        gfx.generateTexture('muzzle_flash', 32, 32);
        gfx.clear();

        // Blood splatter (varied drops)
        for (let i = 0; i < 18; i++) {
            const x = 6 + Math.random() * 20;
            const y = 6 + Math.random() * 20;
            const r = 0.5 + Math.random() * 3.5;
            gfx.fillStyle(Math.random() > 0.4 ? 0x880808 : 0xaa1010, 0.7 + Math.random() * 0.3);
            gfx.fillCircle(x, y, r);
        }
        gfx.fillStyle(0x991010, 0.9);
        gfx.fillEllipse(16, 16, 10, 8);
        gfx.generateTexture('blood_small', 32, 32);
        gfx.clear();

        // Blood pool (irregular, layered)
        gfx.fillStyle(0x600606, 0.65);
        gfx.fillEllipse(24, 18, 40, 26);
        gfx.fillStyle(0x7a0808, 0.6);
        gfx.fillEllipse(22, 16, 28, 18);
        gfx.fillStyle(0x8a1010, 0.5);
        gfx.fillEllipse(20, 14, 18, 12);
        gfx.fillStyle(0xaa1818, 0.3);
        gfx.fillEllipse(20, 13, 10, 6);
        gfx.generateTexture('blood_pool', 48, 36);
        gfx.clear();

        // Bullet hole (with crack lines)
        gfx.fillStyle(0x1a1a1a);
        gfx.fillCircle(8, 8, 7);
        gfx.fillStyle(0x050505);
        gfx.fillCircle(8, 8, 5);
        gfx.fillStyle(0x000000);
        gfx.fillCircle(8, 8, 3);
        gfx.lineStyle(1, 0x3a3a3a, 0.6);
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const len = 4 + Math.random() * 5;
            gfx.beginPath();
            gfx.moveTo(8 + Math.cos(angle) * 4, 8 + Math.sin(angle) * 4);
            gfx.lineTo(8 + Math.cos(angle) * (4 + len), 8 + Math.sin(angle) * (4 + len));
            gfx.strokePath();
        }
        gfx.lineStyle(1, 0x444444, 0.4);
        gfx.strokeCircle(8, 8, 6);
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

        // Darkness mask
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
                // Slide / receiver
                gfx.fillStyle(0x282828);
                gfx.fillRect(6, 11, 20, 7);
                gfx.fillStyle(0x383838, 0.55);
                gfx.fillRect(6, 11, 20, 2);
                // Barrel
                gfx.fillStyle(0x1a1a1a);
                gfx.fillRect(22, 13, 6, 3);
                gfx.fillStyle(0x0a0a0a);
                gfx.fillRect(26, 13, 2, 3);
                // Frame
                gfx.fillStyle(0x2e2e2e);
                gfx.fillRect(8, 16, 14, 6);
                // Trigger guard
                gfx.lineStyle(1, 0x2a2a2a, 1);
                gfx.beginPath(); gfx.moveTo(12, 22); gfx.lineTo(10, 26); gfx.lineTo(18, 26); gfx.lineTo(18, 22); gfx.strokePath();
                // Grip (textured)
                gfx.fillStyle(0x1e1818);
                gfx.fillRect(8, 20, 11, 10);
                gfx.fillStyle(0x2a2220, 0.5);
                for (let i = 0; i < 4; i++) { gfx.fillRect(8, 21 + i * 2, 11, 1); }
                // Sights
                gfx.fillStyle(0x444444);
                gfx.fillRect(8, 10, 3, 2);
                gfx.fillRect(22, 10, 3, 2);
                gfx.generateTexture('item_handgun', S, S);
            },
            item_shotgun: () => {
                gfx.clear();
                // Stock (wood)
                gfx.fillStyle(0x5a3a1a);
                gfx.fillRect(2, 16, 14, 10);
                gfx.fillStyle(0x3a2010, 0.5);
                gfx.fillRect(2, 16, 14, 3);
                // Receiver
                gfx.fillStyle(0x2a2a2a);
                gfx.fillRect(10, 13, 10, 8);
                gfx.fillStyle(0x353535, 0.5);
                gfx.fillRect(10, 13, 10, 2);
                // Double barrel
                gfx.fillStyle(0x222222);
                gfx.fillRect(16, 12, 14, 4);
                gfx.fillRect(16, 17, 14, 4);
                gfx.fillStyle(0x0a0a0a);
                gfx.fillRect(28, 12, 2, 4);
                gfx.fillRect(28, 17, 2, 4);
                gfx.fillStyle(0x303030, 0.5);
                gfx.fillRect(16, 12, 14, 1);
                gfx.fillRect(16, 17, 14, 1);
                // Trigger
                gfx.lineStyle(1, 0x333333, 1);
                gfx.beginPath(); gfx.moveTo(14, 19); gfx.lineTo(12, 23); gfx.lineTo(18, 23); gfx.lineTo(18, 19); gfx.strokePath();
                gfx.generateTexture('item_shotgun', S, S);
            },
            item_herb_green: () => {
                gfx.clear();
                // Stem
                gfx.fillStyle(0x1e5212);
                gfx.fillRect(14, 20, 4, 10);
                gfx.fillStyle(0x267018, 0.5);
                gfx.fillRect(14, 20, 2, 10);
                // Leaves
                gfx.fillStyle(0x1e5812);
                gfx.fillEllipse(11, 18, 10, 14);
                gfx.fillEllipse(21, 16, 10, 12);
                gfx.fillStyle(0x2a7818);
                gfx.fillEllipse(16, 11, 12, 16);
                // Veins
                gfx.lineStyle(1, 0x1a5010, 0.55);
                gfx.beginPath(); gfx.moveTo(11, 20); gfx.lineTo(13, 12); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(16, 20); gfx.lineTo(16, 6); gfx.strokePath();
                // Highlight
                gfx.fillStyle(0x3a9020, 0.35);
                gfx.fillEllipse(14, 9, 5, 7);
                gfx.generateTexture('item_herb_green', S, S);
            },
            item_herb_red: () => {
                gfx.clear();
                gfx.fillStyle(0x5a1010);
                gfx.fillRect(14, 20, 4, 10);
                gfx.fillStyle(0x721414, 0.5);
                gfx.fillRect(14, 20, 2, 10);
                gfx.fillStyle(0x8a1818);
                gfx.fillEllipse(11, 18, 10, 14);
                gfx.fillEllipse(21, 16, 10, 12);
                gfx.fillStyle(0xbb2222);
                gfx.fillEllipse(16, 11, 12, 16);
                gfx.lineStyle(1, 0x6a1010, 0.55);
                gfx.beginPath(); gfx.moveTo(11, 20); gfx.lineTo(13, 12); gfx.strokePath();
                gfx.beginPath(); gfx.moveTo(16, 20); gfx.lineTo(16, 6); gfx.strokePath();
                gfx.fillStyle(0xdd4040, 0.35);
                gfx.fillEllipse(14, 9, 5, 7);
                gfx.generateTexture('item_herb_red', S, S);
            },
            item_herb_mixed: () => {
                gfx.clear();
                gfx.fillStyle(0x2a5a10);
                gfx.fillEllipse(12, 14, 10, 16);
                gfx.fillStyle(0x3a8018, 0.35);
                gfx.fillEllipse(11, 12, 6, 9);
                gfx.fillStyle(0xaa2020);
                gfx.fillEllipse(22, 14, 10, 16);
                gfx.fillStyle(0xdd4040, 0.35);
                gfx.fillEllipse(21, 12, 6, 9);
                gfx.fillStyle(0x1e4810);
                gfx.fillRect(12, 22, 3, 8);
                gfx.fillStyle(0x4a1010);
                gfx.fillRect(18, 22, 3, 8);
                gfx.generateTexture('item_herb_mixed', S, S);
            },
            item_faspray: () => {
                gfx.clear();
                // Can body
                gfx.fillStyle(0x1a4090);
                gfx.fillRect(10, 6, 12, 22);
                // Highlight / shadow
                gfx.fillStyle(0x2a5ab0, 0.55);
                gfx.fillRect(10, 6, 3, 22);
                gfx.fillStyle(0x102870, 0.5);
                gfx.fillRect(19, 6, 3, 22);
                // Label
                gfx.fillStyle(0xeeeeff);
                gfx.fillRect(11, 10, 10, 12);
                gfx.fillStyle(0x1a4090);
                gfx.fillRect(12, 11, 8, 2);
                gfx.fillRect(12, 14, 8, 1);
                gfx.fillRect(12, 16, 5, 1);
                gfx.fillRect(12, 18, 7, 1);
                // Nozzle
                gfx.fillStyle(0x0a2870);
                gfx.fillRect(10, 4, 12, 4);
                gfx.fillStyle(0x2a5ab0);
                gfx.fillRect(13, 2, 6, 3);
                gfx.fillRect(15, 0, 2, 3);
                gfx.generateTexture('item_faspray', S, S);
            },
            item_barry_revolver: () => {
                gfx.clear();
                // Canon
                gfx.fillStyle(0x2a2a2a);
                gfx.fillRect(14, 13, 16, 5);
                // Carcasse / poignée
                gfx.fillStyle(0x3a2a1a);
                gfx.fillRect(13, 10, 5, 8);
                gfx.fillRect(14, 18, 4, 10);
                // Barillet (cercle caractéristique du révolver)
                gfx.fillStyle(0x484848);
                gfx.fillCircle(10, 16, 7);
                gfx.fillStyle(0x1a1a1a);
                gfx.fillCircle(10, 16, 5);
                // Alvéoles du barillet
                gfx.fillStyle(0x080808);
                gfx.fillCircle(10, 12, 1);
                gfx.fillCircle(13, 14, 1);
                gfx.fillCircle(13, 18, 1);
                gfx.fillCircle(10, 20, 1);
                gfx.fillCircle(7, 18, 1);
                gfx.fillCircle(7, 14, 1);
                gfx.generateTexture('item_barry_revolver', S, S);
            },
            item_ammo_357: () => {
                gfx.clear();
                // 3 cartouches Magnum (plus grosses que le 9mm)
                for (let i = 0; i < 3; i++) {
                    gfx.fillStyle(0x6a4020);
                    gfx.fillRect(6 + i * 7, 16, 5, 10);
                    gfx.fillStyle(0x9a6030);
                    gfx.fillRect(6 + i * 7, 9, 5, 9);
                    gfx.fillStyle(0xd0a060);
                    gfx.fillRect(7 + i * 7, 6, 3, 5);
                }
                gfx.generateTexture('item_ammo_357', S, S);
            },
            item_ammo_9mm: () => {
                gfx.clear();
                // Box
                gfx.fillStyle(0x282018);
                gfx.fillRect(4, 18, 24, 10);
                gfx.fillStyle(0x342a20, 0.5);
                gfx.fillRect(4, 18, 24, 3);
                gfx.lineStyle(1, 0x1a1410, 1);
                gfx.strokeRect(4, 18, 24, 10);
                // Bullets visible above
                for (let i = 0; i < 5; i++) {
                    gfx.fillStyle(0x8a7040);
                    gfx.fillRect(6 + i * 4, 13, 3, 8);
                    gfx.fillStyle(0xaa9050, 0.55);
                    gfx.fillRect(6 + i * 4, 13, 1, 8);
                    gfx.fillStyle(0xd0a060);
                    gfx.fillRect(6 + i * 4, 8, 3, 6);
                    gfx.fillStyle(0xe8c080, 0.5);
                    gfx.fillRect(6 + i * 4, 8, 1, 6);
                    gfx.fillStyle(0xc89050);
                    gfx.fillRect(7 + i * 4, 6, 1, 3);
                }
                gfx.generateTexture('item_ammo_9mm', S, S);
            },
            item_ammo_12g: () => {
                gfx.clear();
                gfx.fillStyle(0x282018);
                gfx.fillRect(4, 20, 24, 8);
                gfx.lineStyle(1, 0x1a1410, 1);
                gfx.strokeRect(4, 20, 24, 8);
                for (let i = 0; i < 3; i++) {
                    // Shell
                    gfx.fillStyle(0x8a3020);
                    gfx.fillRect(7 + i * 7, 8, 5, 15);
                    gfx.fillStyle(0xaa4030, 0.5);
                    gfx.fillRect(7 + i * 7, 8, 2, 15);
                    // Brass base
                    gfx.fillStyle(0xddcc88);
                    gfx.fillRect(7 + i * 7, 20, 5, 5);
                    gfx.fillStyle(0xeedd99, 0.5);
                    gfx.fillRect(7 + i * 7, 20, 2, 5);
                    // Crimp top
                    gfx.fillStyle(0x6a2010);
                    gfx.fillRect(8 + i * 7, 6, 3, 3);
                }
                gfx.generateTexture('item_ammo_12g', S, S);
            },
            item_key_cabin: () => {
                gfx.clear();
                gfx.fillStyle(0xaa8830);
                gfx.fillCircle(10, 10, 8);
                gfx.fillStyle(0xcc9e3a, 0.5);
                gfx.fillCircle(8, 8, 5);
                gfx.fillStyle(0x0e0a04);
                gfx.fillCircle(10, 10, 5);
                gfx.fillStyle(0xaa8830);
                gfx.fillCircle(10, 10, 3);
                // Shaft
                gfx.fillStyle(0xaa8830);
                gfx.fillRect(16, 8, 14, 4);
                gfx.fillStyle(0xcc9e3a, 0.4);
                gfx.fillRect(16, 8, 14, 1);
                // Teeth
                gfx.fillStyle(0x887020);
                gfx.fillRect(22, 12, 3, 5);
                gfx.fillRect(27, 12, 3, 7);
                gfx.fillRect(20, 12, 2, 3);
                gfx.generateTexture('item_key_cabin', S, S);
            },
            item_key_cargo: () => {
                gfx.clear();
                // Keycard
                gfx.fillStyle(0x282828);
                gfx.fillRect(6, 6, 20, 12);
                gfx.fillStyle(0x343434, 0.5);
                gfx.fillRect(6, 6, 20, 4);
                gfx.fillStyle(0x181818);
                gfx.fillRect(6, 10, 20, 3);
                gfx.fillStyle(0x484848);
                gfx.fillRect(8, 7, 10, 2);
                // Lanyard hole
                gfx.fillStyle(0x0a0a0a);
                gfx.fillCircle(9, 19, 3);
                gfx.fillStyle(0x444444);
                gfx.fillCircle(9, 19, 2);
                // Strap
                gfx.fillStyle(0x553300);
                gfx.fillRect(8, 19, 2, 8);
                gfx.lineStyle(1, 0x1e1e1e, 1);
                gfx.strokeRect(6, 6, 20, 12);
                gfx.generateTexture('item_key_cargo', S, S);
            },
            item_key_lab: () => {
                gfx.clear();
                // Security badge
                gfx.fillStyle(0x1a1a60);
                gfx.fillRect(7, 4, 18, 14);
                gfx.fillStyle(0x2828a0, 0.4);
                gfx.fillRect(7, 4, 18, 5);
                gfx.fillStyle(0x4040cc);
                gfx.fillRect(8, 5, 16, 3);
                gfx.fillStyle(0x6060ee, 0.4);
                gfx.fillRect(8, 5, 8, 3);
                // Photo placeholder
                gfx.fillStyle(0x0808aa);
                gfx.fillRect(8, 9, 6, 8);
                gfx.fillStyle(0x1010bb, 0.5);
                gfx.fillRect(8, 9, 2, 8);
                // Umbrella logo hint
                gfx.fillStyle(0xdd1111);
                gfx.fillCircle(19, 13, 3);
                gfx.fillStyle(0xffffff, 0.8);
                gfx.fillRect(18, 12, 2, 1);
                gfx.fillRect(17, 13, 4, 1);
                // Key shaft
                gfx.fillStyle(0x1a1a60);
                gfx.fillRect(14, 18, 4, 10);
                gfx.fillRect(12, 24, 8, 2);
                gfx.lineStyle(1, 0x3030aa, 1);
                gfx.strokeRect(7, 4, 18, 14);
                gfx.generateTexture('item_key_lab', S, S);
            },
            item_diary: () => {
                gfx.clear();
                // Cover
                gfx.fillStyle(0x5a3a20);
                gfx.fillRect(5, 3, 22, 26);
                // Spine
                gfx.fillStyle(0x3e2410);
                gfx.fillRect(5, 3, 5, 26);
                gfx.fillStyle(0x4a2c14, 0.5);
                gfx.fillRect(5, 3, 2, 26);
                // Cover highlight
                gfx.fillStyle(0x6e4a28, 0.35);
                gfx.fillRect(10, 3, 17, 10);
                // Pages
                gfx.fillStyle(0xece0c8);
                gfx.fillRect(10, 4, 16, 24);
                // Page lines
                gfx.fillStyle(0xb8aca0);
                for (let i = 0; i < 7; i++) {
                    gfx.fillRect(12, 8 + i * 3, 11, 1);
                }
                // Bookmark ribbon
                gfx.fillStyle(0xcc3322);
                gfx.fillRect(22, 3, 2, 8);
                // Cover embossing
                gfx.lineStyle(1, 0x482e16, 0.5);
                gfx.strokeRect(11, 6, 14, 20);
                gfx.generateTexture('item_diary', S, S);
            },
            item_antibiotic: () => {
                gfx.clear();
                // Capsule top (red)
                gfx.fillStyle(0xcc3333);
                gfx.fillRect(11, 4, 10, 14);
                gfx.fillStyle(0xe04444, 0.5);
                gfx.fillRect(11, 4, 4, 14);
                gfx.fillStyle(0xaa2222, 0.5);
                gfx.fillRect(17, 4, 4, 14);
                gfx.fillStyle(0xcc3333);
                gfx.fillCircle(16, 5, 5);
                gfx.fillStyle(0xe04444, 0.4);
                gfx.fillCircle(14, 4, 3);
                // Capsule bottom (white)
                gfx.fillStyle(0xdddddd);
                gfx.fillRect(11, 16, 10, 14);
                gfx.fillStyle(0xffffff, 0.5);
                gfx.fillRect(11, 16, 4, 14);
                gfx.fillStyle(0xbbbbbb, 0.5);
                gfx.fillRect(17, 16, 4, 14);
                gfx.fillStyle(0xdddddd);
                gfx.fillCircle(16, 29, 5);
                // Joint line
                gfx.lineStyle(1, 0x888888, 0.5);
                gfx.beginPath(); gfx.moveTo(11, 16); gfx.lineTo(21, 16); gfx.strokePath();
                gfx.generateTexture('item_antibiotic', S, S);
            },
        };

        for (const key of Object.keys(items)) {
            items[key]();
        }

        gfx.destroy();
    },
};
