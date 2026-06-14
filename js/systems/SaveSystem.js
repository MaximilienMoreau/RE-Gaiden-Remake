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
            inventory: [],
            itemBox: [],
            equippedWeapon: null,
            equippedWeaponAmmo: 0,
            // World state
            flags: {},
            visitedRooms: [],
            defeatedEnemies: {}, // roomId -> [enemyIndex]
            collectedItems: {}, // roomId -> [objectIndex]
            openedDoors: [],
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

    // =========================================================
    // PERSISTENCE
    // =========================================================
    save(slot) {
        if (!this._state) return false;
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
        try {
            const allSaves = this._loadAll();
            if (allSaves[slot]) {
                this._state = allSaves[slot];
                return true;
            }
            return false;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    },

    getSaveInfo(slot) {
        try {
            const allSaves = this._loadAll();
            if (allSaves[slot]) {
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

    _loadAll() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    },

    deleteSlot(slot) {
        const allSaves = this._loadAll();
        delete allSaves[slot];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSaves));
    },
};
