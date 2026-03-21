/**
 * InventoryScene - Pause menu / inventory management
 */
class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: CONFIG.SCENES.INVENTORY, active: false });
        this._selectedSlot = -1;
        this._contextItem = null;
    }

    init(data) {
        this._callerScene = data.callerScene || CONFIG.SCENES.GAME;
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

        // Background overlay
        this._overlay = this.add.graphics();
        this._overlay.fillStyle(0x000000, 0.88);
        this._overlay.fillRect(0, 0, W, H);

        // Main panel
        const panelX = 40, panelY = 40;
        const panelW = W - 80, panelH = H - 80;

        this._panel = this.add.graphics();
        this._panel.fillStyle(0x050810, 1);
        this._panel.fillRect(panelX, panelY, panelW, panelH);
        this._panel.lineStyle(1, 0x334455, 0.8);
        this._panel.strokeRect(panelX, panelY, panelW, panelH);
        this._panel.lineStyle(1, 0x1a2a3a, 0.5);
        this._panel.strokeRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4);

        // Header
        this.add.text(panelX + panelW / 2, panelY + 16, '— INVENTORY —', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#c8a040', letterSpacing: 6,
        }).setOrigin(0.5);

        this.add.text(panelX + panelW / 2, panelY + 34, 'USSTRATCOM  OPERATIVE: LEON S. KENNEDY', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#334455', letterSpacing: 3,
        }).setOrigin(0.5);

        // Divider
        const div = this.add.graphics();
        div.lineStyle(1, 0x223344, 0.5);
        div.beginPath(); div.moveTo(panelX + 20, panelY + 46); div.lineTo(panelX + panelW - 20, panelY + 46); div.strokePath();

        // Grid
        this._buildInventoryGrid(panelX, panelY, panelW);

        // Item detail panel (right side)
        this._buildDetailPanel(panelX, panelY, panelW, panelH);

        // Equipment display
        this._buildEquipmentDisplay(panelX, panelY, panelW, panelH);

        // Footer
        this.add.text(panelX + panelW / 2, panelY + panelH - 15, '[ESC] CLOSE  ·  CLICK — SELECT  ·  RIGHT-CLICK — ACTION', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#334455',
        }).setOrigin(0.5);

        // Input
        this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);
        this._escKey.once('down', () => this._close());

        this.cameras.main.fadeIn(150, 0, 0, 0);
    }

    _buildInventoryGrid(panelX, panelY, panelW) {
        const SLOT_SIZE = 48;
        const COLS = 6;
        const ROWS = 4;
        const gridX = panelX + 20;
        const gridY = panelY + 58;

        this._slots = [];
        this._slotItems = [];

        const inventory = InventorySystem.getInventory();

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const idx = row * COLS + col;
                const sx = gridX + col * (SLOT_SIZE + 4);
                const sy = gridY + row * (SLOT_SIZE + 4);

                // Slot background
                const slotBg = this.add.graphics();
                slotBg.fillStyle(0x0a1020, 1);
                slotBg.fillRect(sx, sy, SLOT_SIZE, SLOT_SIZE);
                slotBg.lineStyle(1, 0x1e2f40, 1);
                slotBg.strokeRect(sx, sy, SLOT_SIZE, SLOT_SIZE);

                // Slot data
                const slot = { idx, sx, sy, bg: slotBg, icon: null, qty: null };
                this._slots.push(slot);

                // Fill with item if exists
                if (idx < inventory.length) {
                    this._fillSlot(slot, inventory[idx]);
                }

                // Click handler
                const hitZone = this.add.rectangle(
                    sx + SLOT_SIZE / 2, sy + SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE
                ).setInteractive();

                hitZone.on('pointerdown', (ptr) => {
                    if (ptr.rightButtonDown()) {
                        this._showContextMenu(idx, sx, sy);
                    } else {
                        this._selectSlot(idx);
                    }
                });
                hitZone.on('pointerover', () => {
                    slotBg.clear();
                    slotBg.fillStyle(0x162030, 1);
                    slotBg.fillRect(sx, sy, SLOT_SIZE, SLOT_SIZE);
                    slotBg.lineStyle(1, 0x4488cc, 0.6);
                    slotBg.strokeRect(sx, sy, SLOT_SIZE, SLOT_SIZE);
                    if (idx < inventory.length) {
                        this._showItemDetail(inventory[idx]);
                    }
                });
                hitZone.on('pointerout', () => {
                    const isSelected = this._selectedSlot === idx;
                    slotBg.clear();
                    slotBg.fillStyle(isSelected ? 0x1a2a3a : 0x0a1020, 1);
                    slotBg.fillRect(sx, sy, SLOT_SIZE, SLOT_SIZE);
                    slotBg.lineStyle(1, isSelected ? 0x6699cc : 0x1e2f40, 1);
                    slotBg.strokeRect(sx, sy, SLOT_SIZE, SLOT_SIZE);
                });
            }
        }
    }

    _fillSlot(slot, invItem) {
        if (!invItem) return;
        const def = ITEMS[invItem.id?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === invItem.id);
        if (!def) return;

        // Item icon
        if (this.textures.exists(def.icon)) {
            slot.icon = this.add.image(
                slot.sx + 24, slot.sy + 22, def.icon
            ).setDisplaySize(32, 32);
        } else {
            slot.icon = this.add.rectangle(slot.sx + 24, slot.sy + 22, 30, 30, 0x334455);
        }

        // Item name (tiny)
        const nameText = this.add.text(slot.sx + 24, slot.sy + 40, def.name.substring(0, 8), {
            fontSize: '7px', fontFamily: 'Share Tech Mono', color: '#666660',
        }).setOrigin(0.5);
        slot.nameText = nameText;

        // Qty
        if (invItem.qty > 1) {
            slot.qty = this.add.text(slot.sx + SLOT_SIZE - 4, slot.sy + 4, `x${invItem.qty}`, {
                fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#aaaaaa',
            }).setOrigin(1, 0);
        }

        // Equipped indicator
        const state = SaveSystem.getState();
        if (state?.equippedWeapon === invItem.id) {
            const eqBadge = this.add.text(slot.sx + 4, slot.sy + 4, 'EQ', {
                fontSize: '7px', fontFamily: 'Share Tech Mono', color: '#ffcc44',
            });
            slot.eqBadge = eqBadge;
        }
    }

    _buildDetailPanel(panelX, panelY, panelW, panelH) {
        const detailX = panelX + 20 + 6 * 52 + 20;
        const detailY = panelY + 58;
        const detailW = panelX + panelW - 20 - detailX;
        const detailH = 200;

        const detailBg = this.add.graphics();
        detailBg.fillStyle(0x060c16, 1);
        detailBg.fillRect(detailX, detailY, detailW, detailH);
        detailBg.lineStyle(1, 0x1e2f40, 0.6);
        detailBg.strokeRect(detailX, detailY, detailW, detailH);

        this._detailX = detailX;
        this._detailY = detailY;
        this._detailW = detailW;

        this._detailIcon = this.add.image(detailX + 30, detailY + 30, 'item_handgun')
            .setDisplaySize(44, 44).setVisible(false);

        this._detailName = this.add.text(detailX + 8, detailY + 8, '', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#c8a040',
        });
        this._detailType = this.add.text(detailX + 8, detailY + 24, '', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#556677',
        });
        this._detailDesc = this.add.text(detailX + 8, detailY + 68, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#888880',
            wordWrap: { width: detailW - 16 }, lineSpacing: 4,
        });
        this._detailExamine = this.add.text(detailX + 8, detailY + 130, '', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#556677',
            wordWrap: { width: detailW - 16 }, lineSpacing: 3,
            fontStyle: 'italic',
        });
    }

    _buildEquipmentDisplay(panelX, panelY, panelW, panelH) {
        const detailX = panelX + 20 + 6 * 52 + 20;
        const eqY = panelY + 280;
        const eqW = panelX + panelW - 20 - detailX;

        this.add.text(detailX, eqY, 'EQUIPPED', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#446677', letterSpacing: 3,
        });

        const weapon = InventorySystem.getEquippedWeapon();
        this.add.text(detailX, eqY + 18, weapon ? weapon.def?.name || weapon.id : '— NONE —', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: weapon ? '#c0b090' : '#334455',
        });

        if (weapon) {
            this.add.text(detailX, eqY + 35, `AMMO: ${weapon.ammo} / ${weapon.def?.ammoCapacity || 0}`, {
                fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#556677',
            });
        }

        // Health display
        const state = SaveSystem.getState();
        if (state) {
            const pct = state.player.hp / state.player.hpMax;
            this.add.text(detailX, eqY + 60, 'VITALS', {
                fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#446677', letterSpacing: 3,
            });
            const statusColor = pct > 0.5 ? '#44cc44' : pct > 0.25 ? '#ffaa00' : '#ff2200';
            const status = pct > 0.75 ? 'FINE' : pct > 0.5 ? 'CAUTION' : pct > 0.25 ? 'DANGER' : 'CRITICAL';
            this.add.text(detailX, eqY + 78, `${state.player.hp}/${state.player.hpMax} — ${status}`, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: statusColor,
            });
        }
    }

    _showItemDetail(invItem) {
        if (!invItem) return;
        const def = ITEMS[invItem.id?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === invItem.id);
        if (!def) return;

        if (this._detailIcon && this.textures.exists(def.icon)) {
            this._detailIcon.setTexture(def.icon).setVisible(true);
        }
        if (this._detailName) this._detailName.setText(def.name);
        if (this._detailType) this._detailType.setText(def.type?.toUpperCase() || '');
        if (this._detailDesc) this._detailDesc.setText(def.desc || '');
        if (this._detailExamine) this._detailExamine.setText(def.examineText || '');
    }

    _selectSlot(idx) {
        this._selectedSlot = idx;
        const inventory = InventorySystem.getInventory();
        if (idx < inventory.length) {
            this._showItemDetail(inventory[idx]);
        }
    }

    _showContextMenu(idx, sx, sy) {
        // Remove existing context menu
        if (this._contextMenu) {
            this._contextMenu.forEach(o => o.destroy());
            this._contextMenu = null;
        }

        const inventory = InventorySystem.getInventory();
        if (idx >= inventory.length) return;
        const invItem = inventory[idx];
        const def = ITEMS[invItem.id?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === invItem.id);
        if (!def) return;

        const actions = [];
        if (def.type === 'weapon') {
            actions.push({ label: 'EQUIP', fn: () => {
                InventorySystem.equipWeapon(def.id);
                this._close();
            }});
        }
        if (def.type === 'heal') {
            actions.push({ label: 'USE', fn: () => {
                InventorySystem.useHealItem(def.id);
                AudioSynth.sfx('herb_use');
                this._close();
            }});
        }
        if (def.type === 'file') {
            actions.push({ label: 'READ', fn: () => {
                this.scene.launch(CONFIG.SCENES.DIALOGUE, {
                    singleText: def.fileContent || def.examineText || def.desc,
                    callerScene: CONFIG.SCENES.INVENTORY,
                });
            }});
        }
        if (def.combinable && def.combinable.length > 0) {
            // Find combinable partner in inventory
            const partner = def.combinable.find(pid => InventorySystem.hasItem(pid));
            if (partner) {
                actions.push({ label: 'COMBINE', fn: () => {
                    InventorySystem.combineItems(def.id, partner);
                    AudioSynth.sfx('item_pickup');
                    this._close();
                }});
            }
        }
        actions.push({ label: 'EXAMINE', fn: () => {
            if (def.examineText) {
                this.scene.launch(CONFIG.SCENES.DIALOGUE, {
                    singleText: def.examineText,
                    callerScene: CONFIG.SCENES.INVENTORY,
                });
            }
        }});
        actions.push({ label: 'DISCARD', fn: () => {
            InventorySystem.removeItem(def.id);
            this._close();
        }});

        // Build menu
        const menuX = Math.min(sx + 52, CONFIG.WIDTH - 150);
        const menuY = Math.min(sy, CONFIG.HEIGHT - actions.length * 26 - 10);
        const menuItems = [];

        const menuBg = this.add.graphics().setDepth(100);
        menuBg.fillStyle(0x030508, 0.97);
        menuBg.fillRect(menuX, menuY, 140, actions.length * 26 + 10);
        menuBg.lineStyle(1, 0x445566, 1);
        menuBg.strokeRect(menuX, menuY, 140, actions.length * 26 + 10);
        menuItems.push(menuBg);

        actions.forEach((action, i) => {
            const ayy = menuY + 8 + i * 26;
            const btn = this.add.text(menuX + 12, ayy, action.label, {
                fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#c0b898',
            }).setDepth(101).setInteractive();

            btn.on('pointerover', () => btn.setColor('#ffffff'));
            btn.on('pointerout', () => btn.setColor('#c0b898'));
            btn.on('pointerdown', () => {
                menuItems.forEach(m => m.destroy());
                this._contextMenu = null;
                action.fn();
            });
            menuItems.push(btn);
        });

        this._contextMenu = menuItems;
    }

    _close() {
        if (this._contextMenu) {
            this._contextMenu.forEach(o => o.destroy());
            this._contextMenu = null;
        }
        this.cameras.main.fadeOut(150, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this.scene.stop();
                EventSystem.emit('dialogue_closed', { from: 'inventory' });
            }
        });
    }
}
