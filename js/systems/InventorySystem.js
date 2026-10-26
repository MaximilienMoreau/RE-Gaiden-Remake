/**
 * InventorySystem - Manages player inventory state
 */
const InventorySystem = {

    // Returns the current inventory from SaveSystem
    getInventory() {
        return SaveSystem.getState()?.inventory || [];
    },

    getItemBox() {
        return SaveSystem.getState()?.itemBox || [];
    },

    // Add an item to inventory. Returns true on success, false if full.
    addItem(itemId, quantity = 1) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const def = ITEMS[itemId.toUpperCase()] || Object.values(ITEMS).find(i => i.id === itemId);
        if (!def) return false;

        if (!Number.isInteger(quantity) || quantity <= 0) return false;
        const maxStack = def.stackable ? (def.maxStack || 99) : 1;
        const freeInStacks = state.inventory.reduce((n, slot) =>
            n + (slot.id === def.id ? Math.max(0, maxStack - slot.qty) : 0), 0);
        const newSlots = Math.ceil(Math.max(0, quantity - freeInStacks) / maxStack);
        if (state.inventory.length + newSlots > CONFIG.MAX_INVENTORY_SLOTS) return false;
        let remaining = quantity;
        for (const slot of state.inventory) {
            if (slot.id !== def.id) continue;
            const added = Math.min(remaining, Math.max(0, maxStack - slot.qty));
            slot.qty += added;
            remaining -= added;
        }
        while (remaining > 0) {
            const qty = Math.min(remaining, maxStack);
            state.inventory.push({ id: def.id, qty });
            remaining -= qty;
        }
        return true;
    },

    removeItem(itemId, quantity = 1) {
        const state = SaveSystem.getState();
        if (itemId === 'knife') return false;
        if (!state || !Number.isInteger(quantity) || quantity <= 0 ||
            this.getItemCount(itemId) < quantity) return false;
        let remaining = quantity;
        for (let i = 0; i < state.inventory.length && remaining > 0;) {
            const slot = state.inventory[i];
            if (slot.id !== itemId) { i++; continue; }
            const removed = Math.min(remaining, slot.qty);
            slot.qty -= removed;
            remaining -= removed;
            if (slot.qty === 0) state.inventory.splice(i, 1);
            else i++;
        }
        if (!this.hasItem(itemId) && state.equippedWeapon === itemId) {
            state.weaponAmmoMap ||= {};
            state.weaponAmmoMap[itemId] = state.equippedWeaponAmmo;
            state.equippedWeapon = null;
            state.equippedWeaponAmmo = 0;
        }
        return true;
    },

    hasItem(itemId) {
        const inv = this.getInventory();
        return inv.some(s => s.id === itemId && s.qty > 0);
    },

    getItemCount(itemId) {
        const inv = this.getInventory();
        return inv.reduce((count, slot) => count + (slot.id === itemId ? slot.qty : 0), 0);
    },

    // Equip a weapon — preserves each weapon's loaded chamber across switches.
    equipWeapon(itemId) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const def = this._getDef(itemId);
        if (!def || def.type !== 'weapon' || !this.hasItem(itemId)) return false;
        if (state.equippedWeapon === itemId) return true;

        if (!state.weaponAmmoMap) state.weaponAmmoMap = {};

        // Persist current weapon's chamber before switching
        if (state.equippedWeapon && state.equippedWeapon !== itemId) {
            state.weaponAmmoMap[state.equippedWeapon] = state.equippedWeaponAmmo || 0;
        }

        state.equippedWeapon = itemId;

        // Restore previously saved chamber OR load from inventory boxes (first equip)
        if (state.weaponAmmoMap[itemId] !== undefined) {
            state.equippedWeaponAmmo = state.weaponAmmoMap[itemId];
        } else {
            state.equippedWeaponAmmo = this._takeReserveAmmo(def.ammoType, def.ammoCapacity || 0);
            state.weaponAmmoMap[itemId] = state.equippedWeaponAmmo;
        }

        EventSystem.emit('weapon_equipped', { itemId, ammo: state.equippedWeaponAmmo });
        return true;
    },

    getEquippedWeapon() {
        const state = SaveSystem.getState();
        if (!state || !state.equippedWeapon) return null;
        return {
            id: state.equippedWeapon,
            ammo: state.equippedWeaponAmmo || 0,
            def: this._getDef(state.equippedWeapon),
        };
    },

    useAmmo() {
        const state = SaveSystem.getState();
        if (!state || !state.equippedWeapon) return false;
        if (state.equippedWeaponAmmo <= 0) return false;
        state.equippedWeaponAmmo--;
        if (!state.weaponAmmoMap) state.weaponAmmoMap = {};
        state.weaponAmmoMap[state.equippedWeapon] = state.equippedWeaponAmmo;
        EventSystem.emit('ammo_changed', { ammo: state.equippedWeaponAmmo });
        return true;
    },

    reload() {
        const state = SaveSystem.getState();
        if (!state || !state.equippedWeapon) return false;
        const def = this._getDef(state.equippedWeapon);
        if (!def || !def.ammoType) return false;
        const needed = def.ammoCapacity - state.equippedWeaponAmmo;
        if (needed <= 0) return false;
        const bulletsToLoad = this._takeReserveAmmo(def.ammoType, needed);
        if (bulletsToLoad <= 0) return false;
        state.equippedWeaponAmmo += bulletsToLoad;
        if (!state.weaponAmmoMap) state.weaponAmmoMap = {};
        state.weaponAmmoMap[state.equippedWeapon] = state.equippedWeaponAmmo;
        EventSystem.emit('ammo_changed', { ammo: state.equippedWeaponAmmo });
        return true;
    },

    getReserveAmmo(itemId) {
        const state = SaveSystem.getState();
        return this.getItemCount(itemId) * (this._getDef(itemId)?.amount || 1) +
            (state?.ammoRemainders?.[itemId] || 0);
    },

    _takeReserveAmmo(itemId, needed) {
        const state = SaveSystem.getState();
        if (!state || !itemId || needed <= 0) return 0;
        state.ammoRemainders ||= {};
        const loose = state.ammoRemainders[itemId] || 0;
        const toLoad = Math.min(needed, this.getReserveAmmo(itemId));
        const perBox = this._getDef(itemId)?.amount || 1;
        const boxes = Math.ceil(Math.max(0, toLoad - loose) / perBox);
        if (boxes > 0) this.removeItem(itemId, boxes);
        state.ammoRemainders[itemId] = loose + boxes * perBox - toLoad;
        return toLoad;
    },

    // Use a healing item
    useHealItem(itemId) {
        const def = this._getDef(itemId);
        if (!def || def.type !== 'heal') return false;
        const state = SaveSystem.getState();
        if (!state || !this.hasItem(itemId)) return false;
        if (def.healAmount <= 0 && !(def.curesPoison && state.flags.poisoned)) return false;
        if (state.player.hp >= state.player.hpMax && !(def.curesPoison && state.flags.poisoned)) return false;
        this.removeItem(itemId);
        state.player.hp = Math.min(state.player.hp + def.healAmount, state.player.hpMax);
        if (def.curesPoison) {
            state.flags['poisoned'] = false;
        }
        EventSystem.emit('player_hp_changed', { hp: state.player.hp, hpMax: state.player.hpMax });
        return true;
    },

    // Combine two items (e.g., herbs)
    combineItems(itemId1, itemId2) {
        const def1 = this._getDef(itemId1);
        if (!def1 || !def1.combinable) return null;
        if (!def1.combinable.includes(itemId2)) return null;
        if (!this.hasItem(itemId1) || !this.hasItem(itemId2)) return null;

        this.removeItem(itemId1);
        this.removeItem(itemId2);

        // Result
        if ((itemId1 === 'herb_green' && itemId2 === 'herb_red') ||
            (itemId1 === 'herb_red' && itemId2 === 'herb_green')) {
            this.addItem('herb_mixed');
            return 'herb_mixed';
        }
        return null;
    },

    // Item box operations (safe room storage)
    depositToBox(itemId) {
        const state = SaveSystem.getState();
        if (!state) return false;
        if (!this.hasItem(itemId)) return false;
        if (itemId === 'knife') return false;
        this.removeItem(itemId);
        const stored = state.itemBox.find(slot => slot.id === itemId);
        if (stored) stored.qty++;
        else state.itemBox.push({ id: itemId, qty: 1 });
        return true;
    },

    withdrawFromBox(itemId) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const idx = state.itemBox.findIndex(s => s.id === itemId);
        if (idx === -1) return false;
        if (!this.addItem(itemId)) return false;
        if (--state.itemBox[idx].qty <= 0) state.itemBox.splice(idx, 1);
        return true;
    },

    _getDef(itemId) {
        return ITEMS[itemId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === itemId);
    },
};
