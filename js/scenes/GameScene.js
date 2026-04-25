/**
 * GameScene - Main exploration scene (top-down)
 * Handles room rendering, player movement, enemy AI, interactions, transitions
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.GAME);
        this._currentRoomId = 'aft_deck';
        this._player = null;
        this._enemies = [];
        this._interactables = [];
        this._npcs = [];
        this._tileLayers = [];
        this._isBusy = false;
    }

    init(data) {
        this._startRoomId = data?.roomId || 'aft_deck';
        this._fromSave = data?.fromSave || false;
        this._fromPrologue = data?.fromPrologue || false;
    }

    create() {
        this._bindEvents();

        // Init save state if needed
        if (!SaveSystem.getState()) {
            SaveSystem.newGame();
        }

        // Camera settings
        this.cameras.main.setBackgroundColor(0x000000);

        // Darkness overlay (flashlight effect)
        this._darknessLayer = this.add.renderTexture(0, 0, CONFIG.WIDTH * 3, CONFIG.HEIGHT * 3);
        this._darknessLayer.setOrigin(0, 0);
        this._darknessLayer.setDepth(50);
        this._darknessLayer.setScrollFactor(0);

        // HUD
        this.scene.launch(CONFIG.SCENES.HUD);
        this._hudScene = this.scene.get(CONFIG.SCENES.HUD);

        // Load the starting room
        const state = SaveSystem.getState();
        const roomId = this._fromSave ? state.player.currentRoom : this._startRoomId;
        this._loadRoom(roomId, null, null, true);
        this._isBusy = false;

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    _bindEvents() {
        // Remove old listeners first
        EventSystem.off('player_interact');
        EventSystem.off('open_inventory');
        EventSystem.off('player_reload');
        EventSystem.off('combat_triggered');
        EventSystem.off('enemy_killed');
        EventSystem.off('combat_finished');
        EventSystem.off('player_dead');
        EventSystem.off('dialogue_closed');

        EventSystem.on('player_interact', this._onPlayerInteract, this);
        EventSystem.on('open_inventory', this._onOpenInventory, this);
        EventSystem.on('player_reload', this._onReload, this);
        EventSystem.on('combat_triggered', this._onCombatTriggered, this);
        EventSystem.on('enemy_killed', this._onEnemyKilled, this);
        EventSystem.on('combat_finished', this._onCombatFinished, this);
        EventSystem.on('player_dead', this._onPlayerDead, this);
        EventSystem.on('dialogue_closed', this._onDialogueClosed, this);
    }

    // =========================================================
    // ROOM LOADING
    // =========================================================
    _loadRoom(roomId, entryTx, entryTy, immediate = false) {
        this._isBusy = true;
        this._clearRoom();

        const roomDef = MAPS[roomId];
        if (!roomDef) {
            console.error('Unknown room:', roomId);
            return;
        }

        this._currentRoomId = roomId;
        SaveSystem.getState().player.currentRoom = roomId;
        SaveSystem.markRoomVisited(roomId);

        // Determine safe room state
        this._isSafeRoom = !!roomDef.isSafeRoom;
        if (this._isSafeRoom) {
            AudioSynth.playBgm('safe_room');
        } else {
            AudioSynth.playBgm(roomDef.bgm || 'exploration');
        }

        // Build tilemap
        this._buildTilemap(roomDef);

        // Place objects (items, doors, NPCs, enemies, etc.)
        this._placeObjects(roomDef);

        // Spawn player
        const spawnTx = entryTx ?? this._getDefaultSpawn(roomDef).tx;
        const spawnTy = entryTy ?? this._getDefaultSpawn(roomDef).ty;
        this._spawnPlayer(spawnTx, spawnTy);

        // Camera
        const mapW = roomDef.tileWidth * CONFIG.TILE_SIZE;
        const mapH = roomDef.tileHeight * CONFIG.TILE_SIZE;
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.startFollow(this._player, true,
            CONFIG.CAMERA.FOLLOW_LERP, CONFIG.CAMERA.FOLLOW_LERP);
        this.cameras.main.setZoom(CONFIG.CAMERA.ZOOM);

        // Physics bounds
        this.physics.world.setBounds(0, 0, mapW, mapH);

        // Room name popup
        this._showRoomName(roomDef.name);

        // Safe room tutorial
        if (this._isSafeRoom && !SaveSystem.getFlag('tutorial_save_shown')) {
            this.time.delayedCall(1500, () => this._showTutorial());
        }

        // Check cutscene on enter
        if (roomDef.cutsceneOnEnter) {
            this.time.delayedCall(500, () => {
                this._triggerCutscene(roomDef.cutsceneOnEnter);
            });
        }

        // NOTE: _isBusy is intentionally NOT cleared here.
        // It is released by the caller (_transitionToRoom) after the fade-in
        // completes, to prevent double-transitions during the fade animation.
    }

    _clearRoom() {
        // Destroy enemies
        this._enemies.forEach(e => { if (e && e.active) e.destroy(); });
        this._enemies = [];

        // Destroy interactables
        this._interactables.forEach(i => { if (i && i.active) i.destroy(); });
        this._interactables = [];

        // Destroy NPCs
        this._npcs.forEach(n => { if (n && n.active) n.destroy(); });
        this._npcs = [];

        // Destroy tile graphics
        this._tileLayers.forEach(l => { if (l && l.active) l.destroy(); });
        this._tileLayers = [];

        // Destroy player
        if (this._player) {
            this._player.destroy();
            this._player = null;
        }

        // Clear physics groups
        if (this._wallGroup) {
            this._wallGroup.clear(true, true);
        }
    }

    _buildTilemap(roomDef) {
        const S = CONFIG.TILE_SIZE;
        const tiles = roomDef.tiles;
        const H = tiles.length;
        const W = tiles[0].length;

        // Background fill
        const bgGfx = this.add.graphics();
        bgGfx.setDepth(-1);
        this._tileLayers.push(bgGfx);

        // Walls group for physics
        this._wallGroup = this.physics.add.staticGroup();

        for (let ty = 0; ty < H; ty++) {
            for (let tx = 0; tx < W; tx++) {
                const tileCode = tiles[ty][tx];
                const px = tx * S;
                const py = ty * S;
                const textureKey = this._getTileTexture(tileCode);
                let img;

                if (this.textures.exists(textureKey)) {
                    img = this.add.image(px + S / 2, py + S / 2, textureKey);
                    img.setDisplaySize(S, S);
                } else {
                    // Fallback to graphics
                    const g = this.add.graphics();
                    g.fillStyle(this._getTileColor(tileCode));
                    g.fillRect(px, py, S, S);
                    this._tileLayers.push(g);
                    img = g;
                }
                img.setDepth(-1);
                this._tileLayers.push(img);

                // Wall collision
                const isWall = [1, 3, 6, 7].includes(tileCode);
                if (isWall) {
                    const wallRect = this.add.rectangle(
                        px + S / 2, py + S / 2, S, S, 0x000000, 0
                    );
                    this.physics.add.existing(wallRect, true);
                    this._wallGroup.add(wallRect);
                }

            }
        }
    }

    _getTileTexture(code) {
        const map = {
            0: 'floor_metal',
            1: 'wall_metal',
            2: 'floor_carpet',
            3: 'wall_dark',
            4: 'floor_grate',
            5: 'floor_water',
            6: 'wall_pipe',
            7: 'obstacle',
            8: 'save_room',
            9: 'door_passage',
        };
        return map[code] || 'floor_metal';
    }

    _getTileColor(code) {
        const map = {
            0: 0x18222e, 1: 0x0e1520, 2: 0x1a0d0d, 3: 0x080c12,
            4: 0x141e14, 5: 0x0a1520, 6: 0x0e1520, 7: 0x252525,
            8: 0x0a1a10, 9: 0x18222e,
        };
        return map[code] || 0x18222e;
    }

    _getDefaultSpawn(roomDef) {
        const spawnObj = roomDef.objects?.find(o => o.type === 'player_start');
        return spawnObj ? { tx: spawnObj.tx, ty: spawnObj.ty } : { tx: 2, ty: 2 };
    }

    _placeObjects(roomDef) {
        const objects = roomDef.objects || [];

        objects.forEach((obj, idx) => {
            // Skip if condition not met
            if (obj.condition && !this._checkCondition(obj.condition)) return;

            switch (obj.type) {
                case 'enemy':
                    if (!SaveSystem.isEnemyDefeated(roomDef.id, idx)) {
                        const enemy = new Enemy(this, obj.tx, obj.ty, obj.enemyId, idx, roomDef.id);
                        this._enemies.push(enemy);
                        if (this._wallGroup) {
                            this.physics.add.collider(enemy, this._wallGroup);
                        }
                    }
                    break;

                case 'item':
                    if (!SaveSystem.isItemCollected(roomDef.id, idx)) {
                        const item = new Interactable(this, obj.tx, obj.ty, 'item', { itemId: obj.itemId, idx, roomId: roomDef.id });
                        this._interactables.push(item);
                    }
                    break;

                case 'file':
                    if (!SaveSystem.isItemCollected(roomDef.id, idx)) {
                        const file = new Interactable(this, obj.tx, obj.ty, 'item', { itemId: obj.fileId, idx, roomId: roomDef.id, isFile: true });
                        this._interactables.push(file);
                    }
                    break;

                case 'note':
                    if (!SaveSystem.isItemCollected(roomDef.id, idx)) {
                        const note = new Interactable(this, obj.tx, obj.ty, 'item', { itemId: obj.noteId, idx, roomId: roomDef.id, isFile: true });
                        this._interactables.push(note);
                    }
                    break;

                case 'door': {
                    const open = SaveSystem.isDoorOpen(obj.doorId);
                    const door = new Interactable(this, obj.tx, obj.ty, 'door', {
                        doorId: obj.doorId,
                        locked: obj.locked && !open,
                        keyId: obj.keyId,
                        targetRoom: obj.targetRoom,
                        open,
                    });
                    if (open) door.open();
                    this._interactables.push(door);
                    break;
                }

                case 'locked_door': {
                    const open = SaveSystem.isDoorOpen(obj.doorId || `door_${roomDef.id}_${idx}`);
                    const door = new Interactable(this, obj.tx, obj.ty, 'door', {
                        doorId: obj.doorId || `door_${roomDef.id}_${idx}`,
                        locked: !open,
                        keyId: obj.keyId,
                        targetRoom: obj.targetRoom,
                        open,
                    });
                    this._interactables.push(door);
                    break;
                }

                case 'save_point': {
                    const sp = new Interactable(this, obj.tx, obj.ty, 'save_point', {});
                    this._interactables.push(sp);
                    break;
                }

                case 'item_box': {
                    const box = new Interactable(this, obj.tx, obj.ty, 'item_box', {});
                    this._interactables.push(box);
                    break;
                }

                case 'examine': {
                    const ex = new Interactable(this, obj.tx, obj.ty, 'examine', { text: obj.text });
                    this._interactables.push(ex);
                    break;
                }

                case 'npc':
                case 'npc_trigger': {
                    if (!obj.once || !SaveSystem.getFlag(`npc_spoken_${roomDef.id}_${idx}`)) {
                        const npc = new NPC(this, obj.tx, obj.ty, obj.npcId, obj.dialogueId);
                        npc._objectIdx = idx;
                        npc._roomId = roomDef.id;
                        npc._once = obj.once;
                        this._npcs.push(npc);
                    }
                    break;
                }

                case 'cutscene_trigger': {
                    if (!obj.once || !SaveSystem.getFlag(`cs_${obj.cutsceneId}`)) {
                        const trig = {
                            px: obj.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            py: obj.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            cutsceneId: obj.cutsceneId,
                            radius: CONFIG.TILE_SIZE,
                            once: obj.once,
                            triggered: false,
                        };
                        if (!this._cutsceneTriggers) this._cutsceneTriggers = [];
                        this._cutsceneTriggers.push(trig);
                    }
                    break;
                }

                case 'boss_trigger': {
                    if (!SaveSystem.getFlag(`boss_defeated_${obj.bossId}`)) {
                        const trig = {
                            px: obj.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            py: obj.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            bossId: obj.bossId,
                            cutsceneId: obj.cutsceneId,
                            radius: CONFIG.TILE_SIZE * 1.5,
                            triggered: false,
                        };
                        if (!this._bossTriggers) this._bossTriggers = [];
                        this._bossTriggers.push(trig);
                    }
                    break;
                }
            }
        });
    }

    _checkCondition(condition) {
        switch (condition) {
            case 'lucia_not_found': return !SaveSystem.getFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
            case 'act3_creature_sighted': return SaveSystem.getFlag(CONFIG.FLAGS.ACT3_CREATURE_SIGHTED);
            default: return !SaveSystem.getFlag(condition);
        }
    }

    _spawnPlayer(tx, ty) {
        this._player = new Player(this, tx, ty);
        this._player.setDepth(10);

        if (this._wallGroup) {
            this.physics.add.collider(this._player, this._wallGroup);
        }
    }

    // =========================================================
    // ROOM TRANSITIONS
    // =========================================================
    _checkRoomTransitions() {
        if (!this._player || this._isBusy) return;
        if (this._transitionCooldown && this.time.now < this._transitionCooldown) return;
        const roomDef = MAPS[this._currentRoomId];
        if (!roomDef?.connections) return;

        const player = this._player;
        const S = CONFIG.TILE_SIZE;

        for (const [dir, conn] of Object.entries(roomDef.connections)) {
            const triggerX = conn.tx * S + S / 2;
            const triggerY = conn.ty * S + S / 2;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, triggerX, triggerY);

            if (dist < S * 0.8) {
                if (conn.locked && !SaveSystem.isDoorOpen(conn.doorId)) {
                    if (conn.keyId && InventorySystem.hasItem(conn.keyId)) {
                        InventorySystem.removeItem(conn.keyId);
                        SaveSystem.markDoorOpened(conn.doorId);
                        const keyDef = ITEMS[conn.keyId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === conn.keyId);
                        this._showFloatingMessage(`${keyDef?.name || 'Key'} used.`, '#88cc88');
                        AudioSynth.sfx('door_open');
                        this._transitionToRoom(conn.targetRoom, conn.targetTx, conn.targetTy);
                    } else {
                        this._showLockedMessage(conn.keyId);
                    }
                    return;
                }
                this._transitionToRoom(conn.targetRoom, conn.targetTx, conn.targetTy);
                return;
            }
        }
    }

    _showLockedMessage(keyId) {
        if (this._lockMessageShown) return;
        this._lockMessageShown = true;
        setTimeout(() => { this._lockMessageShown = false; }, 2000);

        const keyDef = ITEMS[keyId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === keyId);
        const msg = keyDef ? `Requires: ${keyDef.name}` : 'Locked. Requires a key.';
        this._showFloatingMessage(msg, '#ffaa44');
        AudioSynth.sfx('door_locked');
    }

    _transitionToRoom(roomId, targetTx, targetTy) {
        if (this._isBusy) return;
        this._isBusy = true;

        AudioSynth.sfx('door_open');

        this.cameras.main.fadeOut(500, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this._cutsceneTriggers = [];
                this._bossTriggers = [];
                this._loadRoom(roomId, targetTx, targetTy);
                this.cameras.main.fadeIn(500, 0, 0, 0, (_, progress2) => {
                    if (progress2 === 1) {
                        this._transitionCooldown = this.time.now + 800;
                        this._isBusy = false;
                    }
                });
            }
        });
    }

    // =========================================================
    // INTERACTIONS
    // =========================================================
    _onPlayerInteract(data) {
        if (this._isBusy) return;
        const player = this._player;
        if (!player) return;

        // Check interactables in range
        for (const obj of this._interactables) {
            if (!obj || !obj.active) continue;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, obj.x, obj.y);
            if (dist < obj.interactRange) {
                this._handleInteract(obj);
                return;
            }
        }

        // Check NPCs in range
        for (const npc of this._npcs) {
            if (!npc || !npc.active) continue;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
            if (dist < npc.interactRange) {
                this._handleNPCInteract(npc);
                return;
            }
        }
    }

    _handleInteract(obj) {
        const data = obj.data2;

        switch (obj.interactType) {
            case 'item':
                this._pickupItem(obj, data);
                break;

            case 'door':
                this._handleDoorInteract(obj, data);
                break;

            case 'save_point':
                this._showSaveMenu();
                break;

            case 'item_box':
                this._showItemBox();
                break;

            case 'examine':
                this._showExamineText(data.text);
                break;
        }
    }

    _pickupItem(obj, data) {
        if (!data.itemId) return;
        const def = ITEMS[data.itemId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === data.itemId);
        if (!def) return;

        // Files go directly to inventory as readable items
        if (InventorySystem.addItem(data.itemId)) {
            AudioSynth.sfx('item_pickup');
            SaveSystem.markItemCollected(data.roomId, data.idx);
            this._showFloatingMessage(`+ ${def.name}`, '#ffcc44');
            EventSystem.emit('inventory_changed', {});
            obj.destroy();

            // Auto-equip first weapon
            const state = SaveSystem.getState();
            if (def.type === 'weapon' && !state.equippedWeapon) {
                InventorySystem.equipWeapon(def.id);
            }

            // Files/notes: open to read immediately upon pickup
            if (def.type === 'file' && (def.fileContent || def.examineText)) {
                this._isBusy = true;
                this._player.lockInput(true);
                this.scene.launch(CONFIG.SCENES.DIALOGUE, {
                    singleText: def.fileContent || def.examineText,
                    callerScene: CONFIG.SCENES.GAME,
                });
            }
        } else {
            this._showFloatingMessage('Inventory full!', '#ff4444');
        }
    }

    _handleDoorInteract(obj, data) {
        if (data.locked) {
            // Check if player has the key
            if (data.keyId && InventorySystem.hasItem(data.keyId)) {
                InventorySystem.removeItem(data.keyId);
                SaveSystem.markDoorOpened(data.doorId);
                obj.data2.locked = false;
                obj.open();
                AudioSynth.sfx('door_open');
                this._showFloatingMessage('Door unlocked.', '#88cc88');
            } else {
                const keyDef = ITEMS[data.keyId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === data.keyId);
                this._showFloatingMessage(
                    `Locked. Need: ${keyDef?.name || 'a key'}`,
                    '#ffaa44'
                );
                AudioSynth.sfx('door_locked');
            }
        }
        // If not locked, transition handled by proximity check
    }

    _handleNPCInteract(npc) {
        if (this._isBusy) return;

        if (npc.hasSpoken) {
            const compId = npc._companionDialogueId;
            if (compId && DIALOGUES[compId]) {
                this._isBusy = true;
                this._player.lockInput(true);
                this.scene.launch(CONFIG.SCENES.DIALOGUE, {
                    dialogueId: compId,
                    npcId: npc.npcId,
                    callerScene: CONFIG.SCENES.GAME,
                });
            }
            return;
        }

        if (!npc.dialogueId || !DIALOGUES[npc.dialogueId]) return;

        this._isBusy = true;
        this._player.lockInput(true);
        npc.hasSpoken = true;

        if (npc._once) {
            SaveSystem.setFlag(`npc_spoken_${npc._roomId}_${npc._objectIdx}`);
        }

        this.scene.launch(CONFIG.SCENES.DIALOGUE, {
            dialogueId: npc.dialogueId,
            npcId: npc.npcId,
            callerScene: CONFIG.SCENES.GAME,
        });
    }

    _showSaveMenu() {
        if (this._isBusy) return;
        this._isBusy = true;
        this._player?.lockInput(true);

        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        const overlay = this.add.graphics().setScrollFactor(0).setDepth(100);
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, W, H);

        const panel = this.add.graphics().setScrollFactor(0).setDepth(101);
        panel.fillStyle(0x0a1a10, 1);
        panel.fillRect(W / 2 - 220, H / 2 - 130, 440, 260);
        panel.lineStyle(2, 0x00ff88, 0.5);
        panel.strokeRect(W / 2 - 220, H / 2 - 130, 440, 260);

        const header = this.add.text(W / 2, H / 2 - 110, '— SAVE GAME —', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#00cc66', letterSpacing: 5,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Quote
        const quote = DIALOGUES.save_room_quotes[Math.floor(Math.random() * DIALOGUES.save_room_quotes.length)];
        this.add.text(W / 2, H / 2 - 85, quote, {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#447755',
            wordWrap: { width: 380 }, align: 'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        const uiRefs = [overlay, panel, header];
        const slotTexts = [];

        for (let i = 0; i < CONFIG.SAVE_SLOT_COUNT; i++) {
            const info = SaveSystem.getSaveInfo(i);
            const yy = H / 2 - 10 + i * 48;

            const slotBg = this.add.graphics().setScrollFactor(0).setDepth(101);
            slotBg.fillStyle(0x0d2018, 1);
            slotBg.fillRect(W / 2 - 180, yy - 16, 360, 36);
            slotBg.lineStyle(1, 0x1a4028, 1);
            slotBg.strokeRect(W / 2 - 180, yy - 16, 360, 36);
            uiRefs.push(slotBg);

            const slotText = this.add.text(
                W / 2 - 160, yy - 4,
                info.exists ?
                    `SLOT ${i + 1} · ${info.room} · ${info.formattedDate}` :
                    `SLOT ${i + 1} · [EMPTY]`,
                { fontSize: '10px', fontFamily: 'Share Tech Mono', color: info.exists ? '#99ccaa' : '#335544' }
            ).setScrollFactor(0).setDepth(102);
            slotTexts.push(slotText);
            uiRefs.push(slotText);

            slotText.setInteractive().on('pointerdown', () => {
                if (SaveSystem.save(i)) {
                    AudioSynth.sfx('save');
                    this._showFloatingMessage('Game Saved.', '#00ff88');
                    slotText.setText(`SLOT ${i + 1} · ${MAPS[SaveSystem.getState().player.currentRoom]?.name || '?'} · ${new Date().toLocaleString()}`);
                    slotText.setColor('#99ccaa');
                    this.time.delayedCall(1200, close);
                }
            });
        }

        const closeText = this.add.text(W / 2, H / 2 + 110, '[ESC] CLOSE', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#446655',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        uiRefs.push(closeText);

        const close = () => {
            uiRefs.forEach(r => r.destroy());
            this._isBusy = false;
            this._player?.lockInput(false);
        };

        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', close);
    }

    _showItemBox() {
        // Simplified item box UI
        this._showFloatingMessage('Item Box opened. (Inventory management available via [I])', '#88ccaa');
    }

    _showExamineText(textKey) {
        if (!textKey) return;
        const parts = textKey.split('.');
        let text = DIALOGUES;
        for (const part of parts) {
            text = text?.[part];
        }
        if (typeof text !== 'string') return;

        this._isBusy = true;
        this._player?.lockInput(true);

        this.scene.launch(CONFIG.SCENES.DIALOGUE, {
            singleText: text,
            callerScene: CONFIG.SCENES.GAME,
        });
    }

    _onOpenInventory() {
        if (this._isBusy) return;
        if (this.scene.isActive(CONFIG.SCENES.INVENTORY)) return;
        this._isBusy = true;
        this._player?.lockInput(true);
        this.scene.launch(CONFIG.SCENES.INVENTORY, {
            callerScene: CONFIG.SCENES.GAME,
        });
    }

    _onReload() {
        if (this._isBusy) return;
        const success = InventorySystem.reload();
        if (success) {
            AudioSynth.sfx('reload');
            this._showFloatingMessage('Reloaded.', '#aaccaa');
        } else {
            const w = InventorySystem.getEquippedWeapon();
            if (!w) {
                this._showFloatingMessage('No weapon equipped.', '#ff6644');
            } else if (w.ammo >= w.def.ammoCapacity) {
                this._showFloatingMessage('Already full.', '#aaaaaa');
            } else {
                this._showFloatingMessage('No ammo.', '#ff4444');
            }
        }
    }

    // =========================================================
    // COMBAT
    // =========================================================
    _onCombatTriggered(data) {
        if (this._isBusy) return;
        this._isBusy = true;
        this._player?.lockInput(true);

        AudioSynth.playBgm(data.isBoss ? 'boss' : 'combat');

        this.cameras.main.flash(200, 255, 100, 100);

        this.time.delayedCall(300, () => {
            this.scene.launch(CONFIG.SCENES.COMBAT, {
                enemyId: data.enemyId,
                enemyIndex: data.enemyIndex,
                roomId: data.roomId,
                callerScene: CONFIG.SCENES.GAME,
            });
        });
    }

    _onCombatFinished(data) {
        if (data.victory) {
            // Remove the defeated enemy from the world
            const enemy = this._enemies.find(
                e => e && e.enemyIndex === data.enemyIndex && e.roomId === data.roomId
            );
            if (enemy) {
                enemy.die();
                const idx = this._enemies.indexOf(enemy);
                if (idx !== -1) this._enemies.splice(idx, 1);
            }

            // Drop loot
            if (data.drops) {
                data.drops.forEach(drop => {
                    if (InventorySystem.addItem(drop)) {
                        const def = ITEMS[drop.toUpperCase()] || Object.values(ITEMS).find(i => i.id === drop);
                        this._showFloatingMessage(`+ ${def?.name || drop}`, '#ffcc44');
                    }
                });
            }

            // Check boss kill
            if (data.isBoss) {
                SaveSystem.setFlag(`boss_defeated_${data.enemyId}`);
                if (data.enemyId === 'creature_p2') {
                    // Final boss defeated
                    this.time.delayedCall(2000, () => this._triggerEnding());
                    return;
                }
            }
        }

        this._isBusy = false;
        this._player?.lockInput(false);
        AudioSynth.playBgm(MAPS[this._currentRoomId]?.bgm || 'exploration');
    }

    _onEnemyKilled(data) {
        SaveSystem.markEnemyDefeated(data.roomId, data.enemyIndex);
    }

    _onPlayerDead() {
        this._player?.lockInput(true);
        this.time.delayedCall(1500, () => {
            AudioSynth.stopBgm();
            this.cameras.main.fadeOut(1000, 0, 0, 0, (cam, progress) => {
                if (progress === 1) {
                    this.scene.stop(CONFIG.SCENES.HUD);
                    this.scene.start(CONFIG.SCENES.GAME_OVER);
                }
            });
        });
    }

    _onDialogueClosed(data) {
        // When inventory closes itself it emits { from: 'inventory' } — always allow that through.
        // For any other dialogue_closed (e.g., a READ/EXAMINE dialogue that launched from inside
        // the inventory), skip the reset if the inventory is still open.
        if (data.from !== 'inventory' && this.scene.isActive(CONFIG.SCENES.INVENTORY)) return;
        this._isBusy = false;
        this._player?.lockInput(false);

        if (data.dialogueId === 'act1_leon_first_meeting') {
            const leon = this._npcs.find(n => n.npcId === 'leon');
            if (leon) {
                leon.isFollowing = true;
                leon._companionDialogueId = 'leon_companion';
            }
        }
    }

    // =========================================================
    // CUTSCENES
    // =========================================================
    _triggerCutscene(cutsceneId) {
        if (!DIALOGUES[cutsceneId]) return;
        this._isBusy = true;
        this._player?.lockInput(true);

        SaveSystem.setFlag(`cs_${cutsceneId}`);

        // Set story flags
        if (cutsceneId === 'act3_creature_revealed') {
            SaveSystem.setFlag(CONFIG.FLAGS.ACT3_CREATURE_SIGHTED);
        }

        this.scene.launch(CONFIG.SCENES.DIALOGUE, {
            dialogueId: cutsceneId,
            callerScene: CONFIG.SCENES.GAME,
        });
    }

    _triggerEnding() {
        AudioSynth.stopBgm();
        SaveSystem.setFlag(CONFIG.FLAGS.GAME_COMPLETE);
        this.cameras.main.fadeOut(1500, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this.scene.stop(CONFIG.SCENES.HUD);
                this.scene.start(CONFIG.SCENES.ENDING);
            }
        });
    }

    // =========================================================
    // DARKNESS / FLASHLIGHT EFFECT
    // =========================================================
    _updateDarkness() {
        if (!this._player || !this._darknessLayer) return;
        const isSafe = this._isSafeRoom;
        if (isSafe) {
            this._darknessLayer.setAlpha(0);
            return;
        }

        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const camX = this.cameras.main.scrollX;
        const camY = this.cameras.main.scrollY;
        const zoom = CONFIG.CAMERA.ZOOM;

        // Player screen position
        const screenX = (this._player.x - camX) * zoom;
        const screenY = (this._player.y - camY) * zoom;

        this._darknessLayer.clear();
        this._darknessLayer.fill(0x000000, 0.25);

        // Erase a circle (flashlight)
        const radius = 200;
        this._darknessLayer.erase('noise', screenX - radius, screenY - radius, radius * 2, radius * 2);

        // Small ambient glow
        this._darknessLayer.setAlpha(1);
    }

    // =========================================================
    // FLOATING MESSAGES
    // =========================================================
    _showFloatingMessage(text, color = '#ffffff') {
        if (!this._player) return;
        const msg = this.add.text(
            this._player.x,
            this._player.y - 30,
            text,
            {
                fontSize: '10px',
                fontFamily: 'Share Tech Mono',
                color: color,
                stroke: '#000',
                strokeThickness: 3,
            }
        ).setOrigin(0.5).setDepth(60);

        this.tweens.add({
            targets: msg,
            y: msg.y - 30,
            alpha: 0,
            duration: 1800,
            onComplete: () => msg.destroy(),
        });
    }

    _showRoomName(name) {
        const W = CONFIG.WIDTH;
        const txt = this.add.text(W / 2, 30, name, {
            fontSize: '11px',
            fontFamily: 'Share Tech Mono',
            color: '#666660',
            letterSpacing: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(80).setAlpha(0);

        this.tweens.add({
            targets: txt,
            alpha: { from: 0, to: 1 },
            duration: 600,
            yoyo: true,
            hold: 2000,
            onComplete: () => txt.destroy(),
        });
    }

    _showTutorial() {
        if (SaveSystem.getFlag('tutorial_save_shown')) return;
        SaveSystem.setFlag('tutorial_save_shown');
        this._showFloatingMessage('[E] Save at typewriter · [I] Inventory · [R] Reload', '#88cc88');
    }

    // =========================================================
    // PROXIMITY INTERACTIONS (NPC prompts, cutscene triggers)
    // =========================================================
    _updateProximityObjects() {
        if (!this._player) return;
        const px = this._player.x, py = this._player.y;

        // NPC prompts
        for (const npc of this._npcs) {
            if (!npc || !npc.active) continue;
            const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
            npc.showInteractPrompt(dist < npc.interactRange);
        }

        // Cutscene triggers
        if (this._cutsceneTriggers) {
            for (const trig of this._cutsceneTriggers) {
                if (trig.triggered) continue;
                const dist = Phaser.Math.Distance.Between(px, py, trig.px, trig.py);
                if (dist < trig.radius) {
                    trig.triggered = true;
                    this._triggerCutscene(trig.cutsceneId);
                }
            }
        }

        // Boss triggers
        if (this._bossTriggers) {
            for (const trig of this._bossTriggers) {
                if (trig.triggered) continue;
                const dist = Phaser.Math.Distance.Between(px, py, trig.px, trig.py);
                if (dist < trig.radius) {
                    trig.triggered = true;
                    if (trig.cutsceneId && !SaveSystem.getFlag(`cs_${trig.cutsceneId}`)) {
                        this._triggerCutscene(trig.cutsceneId);
                    } else {
                        EventSystem.emit('combat_triggered', {
                            enemyId: trig.bossId,
                            enemyIndex: -1,
                            roomId: this._currentRoomId,
                            isBoss: true,
                        });
                    }
                }
            }
        }
    }

    // =========================================================
    // TWO LEONS SCENE
    // =========================================================
    _handleTwoLeonsScene() {
        if (SaveSystem.getFlag(CONFIG.FLAGS.ACT4_LEON_SPLIT)) return;
        SaveSystem.setFlag(CONFIG.FLAGS.ACT4_LEON_SPLIT);

        this._isBusy = true;
        this._player?.lockInput(true);

        this.scene.launch(CONFIG.SCENES.DIALOGUE, {
            dialogueId: 'act4_two_leons_intro',
            callerScene: CONFIG.SCENES.GAME,
            onComplete: () => {
                this._showTwoLeonsChoice();
            },
        });
    }

    _showTwoLeonsChoice() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
        const overlay = this.add.graphics().setScrollFactor(0).setDepth(200);
        overlay.fillStyle(0x000000, 0.9);
        overlay.fillRect(0, 0, W, H);

        this.add.text(W / 2, H / 2 - 130, '— IDENTIFY THE REAL LEON —', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#cc4444', letterSpacing: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        this.add.text(W / 2, H / 2 - 100, '"What was the name of the girl you escaped Raccoon City with?"', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#888', wordWrap: { width: 500 }, align: 'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        const choices = [
            { text: 'LEON A says: "Ada Wong"', correct: false },
            { text: 'LEON B says: "Claire Redfield"', correct: true },
        ];

        const elements = [overlay];

        choices.forEach((choice, i) => {
            const yy = H / 2 - 20 + i * 60;
            const bg = this.add.graphics().setScrollFactor(0).setDepth(201);
            bg.fillStyle(0x1a0a0a, 1);
            bg.fillRect(W / 2 - 200, yy - 20, 400, 44);
            bg.lineStyle(1, 0x442222, 1);
            bg.strokeRect(W / 2 - 200, yy - 20, 400, 44);

            const txt = this.add.text(W / 2, yy + 2, choice.text, {
                fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#ccbbbb',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setInteractive();

            txt.on('pointerover', () => { bg.clear(); bg.fillStyle(0x3a0a0a, 1); bg.fillRect(W / 2 - 200, yy - 20, 400, 44); });
            txt.on('pointerout', () => { bg.clear(); bg.fillStyle(0x1a0a0a, 1); bg.fillRect(W / 2 - 200, yy - 20, 400, 44); });

            txt.on('pointerdown', () => {
                elements.forEach(e => e.destroy());
                bg.destroy();
                txt.destroy();
                this._resolveTwoLeonsChoice(choice.correct);
            });

            elements.push(bg, txt);
        });
    }

    _resolveTwoLeonsChoice(choseCorrectly) {
        if (choseCorrectly) {
            // Player correctly identified real Leon
            this._triggerCutscene('act4_real_leon_identified');
            this.time.delayedCall(3000, () => {
                // Trigger final boss
                SaveSystem.setFlag(CONFIG.FLAGS.ACT4_REAL_LEON_SAVED);
                EventSystem.emit('combat_triggered', {
                    enemyId: 'creature_p1',
                    enemyIndex: -99,
                    roomId: this._currentRoomId,
                    isBoss: true,
                });
            });
        } else {
            // Wrong choice - player must try again after cutscene
            const msg = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'The creature attacks!', {
                fontSize: '18px', fontFamily: 'Share Tech Mono', color: '#ff2222',
                stroke: '#000', strokeThickness: 4,
            }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

            this.time.delayedCall(1500, () => {
                msg.destroy();
                // Player takes damage
                const state = SaveSystem.getState();
                state.player.hp = Math.max(1, state.player.hp - 50);
                EventSystem.emit('player_hp_changed', { hp: state.player.hp, hpMax: state.player.hpMax });

                // Retry the choice
                this.time.delayedCall(500, () => this._showTwoLeonsChoice());
            });
        }
    }

    // =========================================================
    // UPDATE
    // =========================================================
    update(time, delta) {
        if (!this._player) return;

        this._player.update(time, delta);
        this._updateProximityObjects();
        this._checkRoomTransitions();

        // Enemy AI
        for (const enemy of this._enemies) {
            if (enemy && enemy.alive) {
                enemy.update(time, delta, this._player, this._wallGroup);
            }
        }

        // NPC AI (follow + attack)
        for (const npc of this._npcs) {
            if (npc && npc.active) {
                npc.update(time, delta, this._player, this._enemies);
            }
        }

        // Darkness update (throttled)
        if (!this._darknessTimer || time - this._darknessTimer > 50) {
            this._darknessTimer = time;
            this._updateDarkness();
        }

        // Two Leons trigger check
        const twoLeonsTrigger = SaveSystem.getFlag(CONFIG.FLAGS.ACT3_CREATURE_SIGHTED) &&
                                !SaveSystem.getFlag(CONFIG.FLAGS.ACT4_LEON_SPLIT) &&
                                this._currentRoomId === 'cargo_hold' &&
                                !this._isBusy;
        if (twoLeonsTrigger) {
            const dist = Phaser.Math.Distance.Between(
                this._player.x, this._player.y,
                11 * CONFIG.TILE_SIZE, 6 * CONFIG.TILE_SIZE
            );
            if (dist < CONFIG.TILE_SIZE * 2) {
                this._handleTwoLeonsScene();
            }
        }
    }
}
