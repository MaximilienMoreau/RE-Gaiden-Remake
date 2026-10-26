/**
 * SaveSystem - Handles save/load using localStorage
 */
const SaveSystem = {
    STORAGE_KEY: 'RE_GAIDEN_REMAKE_SAVE',
    MAX_SLOTS: CONFIG.SAVE_SLOT_COUNT,

    // Active game state (in-memory, synced to save slot on save)
    _state: null,

    newGame() {
        this._state = {
            version: 1,
            slot: null,
            timestamp: Date.now(),
            // Player
            player: {
                hp: CONFIG.PLAYER.HEALTH_MAX,
                hpMax: CONFIG.PLAYER.HEALTH_MAX,
                currentRoom: 'aft_deck',
                position: { tx: 10, ty: 6 },
                character: 'barry',
            },
            // Inventory
            inventory: [{ id: 'knife', qty: 1 }],
            itemBox: [],
            equippedWeapon: 'knife',
            equippedWeaponAmmo: 0,
            weaponAmmoMap: {},
            ammoRemainders: {},
            // World state
            flags: {},
            visitedRooms: [],
            defeatedEnemies: {}, // roomId -> [enemyIndex]
            collectedItems: {}, // roomId -> [objectIndex]
            openedDoors: [],
            droppedItems: {},
            nextDropId: 0,
            // Act tracking
            currentAct: CONFIG.ACTS.ACT1,
        };
        return this._state;
    },

    getState() {
        return this._state;
    },

    setState(state) {
        this._state = state;
    },

    setFlag(flag, value = true) {
        if (this._state) {
            this._state.flags[flag] = value;
        }
    },

    getFlag(flag) {
        return this._state ? !!this._state.flags[flag] : false;
    },

    markRoomVisited(roomId) {
        if (!this._state) return;
        if (!this._state.visitedRooms.includes(roomId)) {
            this._state.visitedRooms.push(roomId);
        }
    },

    isRoomVisited(roomId) {
        return this._state ? this._state.visitedRooms.includes(roomId) : false;
    },

    markEnemyDefeated(roomId, enemyIndex) {
        if (!this._state) return;
        if (!this._state.defeatedEnemies[roomId]) {
            this._state.defeatedEnemies[roomId] = [];
        }
        if (!this._state.defeatedEnemies[roomId].includes(enemyIndex)) {
            this._state.defeatedEnemies[roomId].push(enemyIndex);
        }
    },

    isEnemyDefeated(roomId, enemyIndex) {
        return this._state &&
               this._state.defeatedEnemies[roomId] &&
               this._state.defeatedEnemies[roomId].includes(enemyIndex);
    },

    markItemCollected(roomId, objectIndex) {
        if (!this._state) return;
        if (!this._state.collectedItems[roomId]) {
            this._state.collectedItems[roomId] = [];
        }
        if (!this._state.collectedItems[roomId].includes(objectIndex)) {
            this._state.collectedItems[roomId].push(objectIndex);
        }
    },

    isItemCollected(roomId, objectIndex) {
        return this._state &&
               this._state.collectedItems[roomId] &&
               this._state.collectedItems[roomId].includes(objectIndex);
    },

    markDoorOpened(doorId) {
        if (!this._state) return;
        if (!this._state.openedDoors.includes(doorId)) {
            this._state.openedDoors.push(doorId);
        }
    },

    isDoorOpen(doorId) {
        return this._state ? this._state.openedDoors.includes(doorId) : false;
    },

    addDroppedItem(roomId, itemId, tx, ty) {
        if (!this._state || !MAPS[roomId] || !InventorySystem._getDef(itemId)) return null;
        this._state.droppedItems ||= {};
        this._state.nextDropId ||= 0;
        const drop = { dropId: `loot_${this._state.nextDropId++}`, itemId, tx, ty };
        (this._state.droppedItems[roomId] ||= []).push(drop);
        return drop;
    },

    getDroppedItems(roomId) {
        return this._state?.droppedItems?.[roomId] || [];
    },

    collectDroppedItem(roomId, dropId) {
        const drops = this.getDroppedItems(roomId);
        const index = drops.findIndex(drop => drop.dropId === dropId);
        if (index !== -1) drops.splice(index, 1);
    },

    _validDroppedItems(state) {
        if (state.droppedItems === undefined) return true;
        if (!state.droppedItems || typeof state.droppedItems !== 'object' || Array.isArray(state.droppedItems) ||
            !Number.isInteger(state.nextDropId) || state.nextDropId < 0) return false;
        const ids = new Set();
        return Object.entries(state.droppedItems).every(([roomId, drops]) => MAPS[roomId] && Array.isArray(drops) && drops.every(drop => {
            if (!drop || typeof drop.dropId !== 'string' || ids.has(drop.dropId) ||
                !Object.values(ITEMS).some(item => item.id === drop.itemId) ||
                !Number.isInteger(drop.tx) || !Number.isInteger(drop.ty) ||
                !RoomNavigation.isWalkable(MAPS[roomId], drop.tx, drop.ty)) return false;
            ids.add(drop.dropId);
            return true;
        }));
    },

    // =========================================================
    // PERSISTENCE
    // =========================================================
    save(slot) {
        if (!this._state || !this._validSlot(slot)) return false;
        this._state.slot = slot;
        this._state.timestamp = Date.now();

        try {
            const allSaves = this._loadAll();
            allSaves[slot] = { ...this._state };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSaves));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    },

    load(slot) {
        if (!this._validSlot(slot)) return false;
        try {
            const allSaves = this._loadAll();
            if (this._validState(allSaves[slot])) {
                this._state = allSaves[slot];
                this._state.weaponAmmoMap ||= {};
                this._state.droppedItems ||= {};
                this._state.nextDropId ||= 0;
                this._restoreKnife();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    },

    // Restore Barry's permanent equipment in older saves without losing any items.
    _restoreKnife() {
        const state = this._state;
        if (state.inventory.some(item => item.id === 'knife')) return;
        const stored = state.itemBox.findIndex(item => item.id === 'knife');
        if (stored !== -1 && --state.itemBox[stored].qty <= 0) state.itemBox.splice(stored, 1);
        if (state.inventory.length >= CONFIG.MAX_INVENTORY_SLOTS) {
            const index = state.inventory.findIndex(item => item.id !== state.equippedWeapon);
            state.itemBox.push(...state.inventory.splice(index, 1));
        }
        state.inventory.unshift({ id: 'knife', qty: 1 });
        if (!state.equippedWeapon) {
            state.equippedWeapon = 'knife';
            state.equippedWeaponAmmo = 0;
        }
    },

    getSaveInfo(slot) {
        try {
            const allSaves = this._loadAll();
            if (this._validSlot(slot) && this._validState(allSaves[slot])) {
                const s = allSaves[slot];
                return {
                    exists: true,
                    timestamp: s.timestamp,
                    room: MAPS[s.player.currentRoom]?.name || s.player.currentRoom,
                    hp: s.player.hp,
                    hpMax: s.player.hpMax,
                    act: s.currentAct,
                    formattedDate: new Date(s.timestamp).toLocaleString(),
                };
            }
            return { exists: false };
        } catch (e) {
            return { exists: false };
        }
    },

    _validSlot(slot) {
        return Number.isInteger(slot) && slot >= 0 && slot < this.MAX_SLOTS;
    },

    _validState(state) {
        if (!state || state.version !== 1 || !state.player || !MAPS[state.player.currentRoom]) return false;
        const p = state.player;
        const room = MAPS[p.currentRoom];
        return this._validDroppedItems(state) && Number.isFinite(state.timestamp) && Number.isFinite(p.hp) &&
            Number.isFinite(p.hpMax) && p.hpMax > 0 && p.hp >= 0 && p.hp <= p.hpMax &&
            p.position && Number.isInteger(p.position.tx) && Number.isInteger(p.position.ty) &&
            p.position.tx >= 0 && p.position.tx < room.tileWidth &&
            p.position.ty >= 0 && p.position.ty < room.tileHeight &&
            ['inventory', 'itemBox'].every(key => Array.isArray(state[key]) && state[key].every(slot =>
                slot && Object.values(ITEMS).some(item => item.id === slot.id) &&
                Number.isInteger(slot.qty) && slot.qty > 0)) &&
            ['visitedRooms', 'openedDoors'].every(key => Array.isArray(state[key])) &&
            ['flags', 'defeatedEnemies', 'collectedItems'].every(key => state[key] &&
                typeof state[key] === 'object' && !Array.isArray(state[key]));
    },

    _loadAll() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        const saves = raw ? JSON.parse(raw) : {};
        return saves && typeof saves === 'object' && !Array.isArray(saves) ? saves : {};
    },

    deleteSlot(slot) {
        const allSaves = this._loadAll();
        delete allSaves[slot];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSaves));
    },
};
