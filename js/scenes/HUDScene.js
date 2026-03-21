/**
 * HUDScene - Persistent HUD overlay (runs parallel to GameScene)
 */
class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: CONFIG.SCENES.HUD, active: false });
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        // Subscribe to events
        EventSystem.on('player_hp_changed', this._onHpChanged, this);
        EventSystem.on('weapon_equipped', this._onWeaponEquipped, this);
        EventSystem.on('ammo_changed', this._onAmmoChanged, this);
        EventSystem.on('inventory_changed', this._onInventoryChanged, this);

        this._buildHUD(W, H);
        this._refreshAll();
    }

    _buildHUD(W, H) {
        // Bottom-left panel: health
        this._hudPanel = this.add.graphics();
        this._hudPanel.fillStyle(0x000000, 0.65);
        this._hudPanel.fillRect(10, H - 80, 200, 70);
        this._hudPanel.lineStyle(1, 0x223344, 0.7);
        this._hudPanel.strokeRect(10, H - 80, 200, 70);

        // Character name
        this.add.text(18, H - 75, 'LEON S. KENNEDY', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#c8a040', letterSpacing: 3,
        });
        this.add.text(18, H - 64, 'USSTRATCOM · FIELD AGENT', {
            fontSize: '7px', fontFamily: 'Share Tech Mono', color: '#444440',
        });

        // Health bar bg
        this._hpBg = this.add.graphics();
        this._hpBg.fillStyle(0x111111, 1);
        this._hpBg.fillRect(18, H - 52, 140, 10);
        this._hpBg.lineStyle(1, 0x334455, 1);
        this._hpBg.strokeRect(18, H - 52, 140, 10);

        // Health bar
        this._hpBar = this.add.graphics();

        // HP text
        this._hpText = this.add.text(18, H - 38, 'HP: ---', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#888880',
        });

        // Status text
        this._statusText = this.add.text(18, H - 28, 'FINE', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#44cc44', letterSpacing: 2,
        });

        // Bottom-right: weapon display
        this._weaponPanel = this.add.graphics();
        this._weaponPanel.fillStyle(0x000000, 0.65);
        this._weaponPanel.fillRect(W - 170, H - 70, 160, 60);
        this._weaponPanel.lineStyle(1, 0x223344, 0.7);
        this._weaponPanel.strokeRect(W - 170, H - 70, 160, 60);

        this._weaponNameText = this.add.text(W - 162, H - 65, '— NO WEAPON —', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#c0b090', letterSpacing: 2,
        });
        this._ammoText = this.add.text(W - 162, H - 50, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#888870',
        });
        this._ammoBarBg = this.add.graphics();
        this._ammoBarBg.fillStyle(0x111111, 1);
        this._ammoBarBg.fillRect(W - 162, H - 36, 140, 6);
        this._ammoBar = this.add.graphics();

        // Top area: room name & act indicator
        this._actText = this.add.text(W - 10, 12, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#334455',
            letterSpacing: 3,
        }).setOrigin(1, 0);

        // Controls hint (very faded)
        this.add.text(W / 2, H - 8, 'WASD/ARROWS — Move  ·  E — Interact  ·  I — Inventory  ·  R — Reload  ·  SHIFT — Run', {
            fontSize: '7px', fontFamily: 'Share Tech Mono', color: '#222222', letterSpacing: 1,
        }).setOrigin(0.5, 1);

        // Danger overlay (flashes red when critical hp)
        this._dangerOverlay = this.add.graphics();
        this._dangerOverlay.setAlpha(0);
        this._dangerOverlay.fillStyle(0xff0000, 0.08);
        this._dangerOverlay.fillRect(0, 0, W, H);
        this._dangerTween = null;
    }

    _refreshAll() {
        const state = SaveSystem.getState();
        if (!state) return;
        this._updateHp(state.player.hp, state.player.hpMax);
        this._updateWeapon();
        this._updateAct(state.currentAct);
    }

    _updateHp(hp, hpMax) {
        const H = CONFIG.HEIGHT;
        const pct = Math.max(0, hp / hpMax);

        this._hpBar.clear();
        const col = pct > 0.5 ? 0x44cc44 : pct > 0.25 ? 0xffaa00 : 0xff2200;
        this._hpBar.fillStyle(col, 0.9);
        this._hpBar.fillRect(18, H - 52, Math.floor(140 * pct), 10);

        this._hpText.setText(`HP: ${hp} / ${hpMax}`);

        let status, statusCol;
        if (pct > 0.75) { status = 'FINE'; statusCol = '#44cc44'; }
        else if (pct > 0.5) { status = 'CAUTION'; statusCol = '#cccc44'; }
        else if (pct > 0.25) { status = 'DANGER'; statusCol = '#ff8800'; }
        else { status = 'CRITICAL'; statusCol = '#ff2200'; }

        this._statusText.setText(status).setColor(statusCol);

        // Danger pulse
        if (pct <= 0.25) {
            if (!this._dangerTween) {
                this._dangerTween = this.tweens.add({
                    targets: this._dangerOverlay,
                    alpha: { from: 0, to: 0.15 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                });
                AudioSynth.sfx('danger_jingle');
            }
        } else {
            if (this._dangerTween) {
                this._dangerTween.stop();
                this._dangerTween = null;
                this._dangerOverlay.setAlpha(0);
            }
        }
    }

    _updateWeapon() {
        const weapon = InventorySystem.getEquippedWeapon();
        if (!weapon) {
            this._weaponNameText.setText('— NO WEAPON —');
            this._ammoText.setText('');
            this._ammoBar.clear();
            return;
        }

        this._weaponNameText.setText(weapon.def?.name || weapon.id);
        const ammo = weapon.ammo;
        const cap = weapon.def?.ammoCapacity || 0;
        const reserveId = weapon.def?.ammoType;
        const reserves = reserveId ? InventorySystem.getItemCount(reserveId) : 0;
        const reserveAmmo = reserves * (reserveId === 'ammo_12g' ? 6 : 15);

        this._ammoText.setText(`${ammo}/${cap}  +${reserveAmmo}`);
        this._ammoText.setColor(ammo <= 2 ? '#ff4444' : '#888870');

        // Ammo bar
        const W = CONFIG.WIDTH;
        this._ammoBar.clear();
        const pct = cap > 0 ? ammo / cap : 0;
        this._ammoBar.fillStyle(pct > 0.33 ? 0x4488cc : 0xff6622, 0.8);
        this._ammoBar.fillRect(W - 162, H - 36, Math.floor(140 * pct), 6);
    }

    _updateAct(act) {
        const labels = {
            act1: 'ACT I — ARRIVAL',
            act2: 'ACT II — DESCENT',
            act3: 'ACT III — DISCOVERY',
            act4: 'ACT IV — TRUTH',
        };
        this._actText.setText(labels[act] || '');
    }

    // Event handlers
    _onHpChanged(data) { this._updateHp(data.hp, data.hpMax); }
    _onWeaponEquipped() { this._updateWeapon(); }
    _onAmmoChanged() { this._updateWeapon(); }
    _onInventoryChanged() { this._updateWeapon(); }

    destroy() {
        EventSystem.off('player_hp_changed', this._onHpChanged);
        EventSystem.off('weapon_equipped', this._onWeaponEquipped);
        EventSystem.off('ammo_changed', this._onAmmoChanged);
        EventSystem.off('inventory_changed', this._onInventoryChanged);
    }
}

// Patch missing H reference in _updateWeapon
const _origUpdateWeapon = HUDScene.prototype._updateWeapon;
HUDScene.prototype._updateWeapon = function() {
    const weapon = InventorySystem.getEquippedWeapon();
    if (!weapon) {
        if (this._weaponNameText) this._weaponNameText.setText('— NO WEAPON —');
        if (this._ammoText) this._ammoText.setText('');
        if (this._ammoBar) this._ammoBar.clear();
        return;
    }
    const H = CONFIG.HEIGHT, W = CONFIG.WIDTH;
    if (this._weaponNameText) this._weaponNameText.setText(weapon.def?.name || weapon.id);
    const ammo = weapon.ammo;
    const cap = weapon.def?.ammoCapacity || 0;
    const reserveId = weapon.def?.ammoType;
    const reserves = reserveId ? InventorySystem.getItemCount(reserveId) : 0;
    const reserveAmmo = reserves * (reserveId === 'ammo_12g' ? 6 : 15);
    if (this._ammoText) {
        this._ammoText.setText(`${ammo}/${cap}  +${reserveAmmo}`);
        this._ammoText.setColor(ammo <= 2 ? '#ff4444' : '#888870');
    }
    if (this._ammoBar) {
        this._ammoBar.clear();
        const pct = cap > 0 ? ammo / cap : 0;
        this._ammoBar.fillStyle(pct > 0.33 ? 0x4488cc : 0xff6622, 0.8);
        this._ammoBar.fillRect(W - 162, H - 36, Math.floor(140 * pct), 6);
    }
};
