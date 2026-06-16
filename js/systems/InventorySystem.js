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

        // Try to stack
        if (def.stackable) {
            const existing = state.inventory.find(s => s.id === def.id && s.qty < (def.maxStack || 99));
            if (existing) {
                existing.qty = Math.min((existing.qty || 1) + quantity, def.maxStack || 99);
                return true;
            }
        }

        // Check capacity
        if (state.inventory.length >= CONFIG.MAX_INVENTORY_SLOTS) return false;

        state.inventory.push({
            id: def.id,
            qty: quantity,
        });
        return true;
    },

    removeItem(itemId, quantity = 1) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const idx = state.inventory.findIndex(s => s.id === itemId);
        if (idx === -1) return false;
        const slot = state.inventory[idx];
        slot.qty = (slot.qty || 1) - quantity;
        if (slot.qty <= 0) {
            state.inventory.splice(idx, 1);
            // Unequip if needed
            if (state.equippedWeapon === itemId) {
                state.equippedWeapon = null;
                state.equippedWeaponAmmo = 0;
            }
        }
        return true;
    },

    hasItem(itemId) {
        const inv = this.getInventory();
        return inv.some(s => s.id === itemId && s.qty > 0);
    },

    getItemCount(itemId) {
        const inv = this.getInventory();
        const slot = inv.find(s => s.id === itemId);
        return slot ? (slot.qty || 1) : 0;
    },

    // Equip a weapon — preserves each weapon's loaded chamber across switches.
    equipWeapon(itemId) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const def = this._getDef(itemId);
        if (!def || def.type !== 'weapon') return false;

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
            const ammoDef = this._getDef(def.ammoType);
            if (ammoDef) {
                const bulletsPerBox = ammoDef.amount || 1;
                const availableBoxes = this.getItemCount(def.ammoType);
                const toLoad = Math.min(availableBoxes * bulletsPerBox, def.ammoCapacity);
                if (toLoad > 0) {
                    this.removeItem(def.ammoType, Math.min(availableBoxes, Math.ceil(toLoad / bulletsPerBox)));
                    state.equippedWeaponAmmo = toLoad;
                } else {
                    state.equippedWeaponAmmo = 0;
                }
            } else {
                state.equippedWeaponAmmo = 0;
            }
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
        const availableBoxes = this.getItemCount(def.ammoType);
        if (availableBoxes <= 0) return false;
        // Convert boxes → bullets so we load the correct number of rounds.
        const ammoDef = this._getDef(def.ammoType);
        const bulletsPerBox = ammoDef?.amount || 1;
        const bulletsToLoad = Math.min(needed, availableBoxes * bulletsPerBox);
        const boxesToUse = Math.min(availableBoxes, Math.ceil(bulletsToLoad / bulletsPerBox));
        this.removeItem(def.ammoType, boxesToUse);
        state.equippedWeaponAmmo += bulletsToLoad;
        if (!state.weaponAmmoMap) state.weaponAmmoMap = {};
        state.weaponAmmoMap[state.equippedWeapon] = state.equippedWeaponAmmo;
        EventSystem.emit('ammo_changed', { ammo: state.equippedWeaponAmmo });
        return true;
    },

    // Use a healing item
    useHealItem(itemId) {
        const def = this._getDef(itemId);
        if (!def || def.type !== 'heal') return false;
        const state = SaveSystem.getState();
        if (!state) return false;
        this.removeItem(itemId);
        const healed = Math.min(def.healAmount, state.player.hpMax - state.player.hp);
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
        // Prevent depositing the equipped weapon while it has ammo loaded in the chamber.
        if (state.equippedWeapon === itemId && state.equippedWeaponAmmo > 0) return false;
        this.removeItem(itemId);
        state.itemBox.push({ id: itemId, qty: 1 });
        return true;
    },

    withdrawFromBox(itemId) {
        const state = SaveSystem.getState();
        if (!state) return false;
        const idx = state.itemBox.findIndex(s => s.id === itemId);
        if (idx === -1) return false;
        if (!this.addItem(itemId)) return false;
        state.itemBox.splice(idx, 1);
        return true;
    },

    _getDef(itemId) {
        return ITEMS[itemId?.toUpperCase()] || Object.values(ITEMS).find(i => i.id === itemId);
    },
};
