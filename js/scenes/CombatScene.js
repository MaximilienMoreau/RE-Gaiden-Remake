/**
 * CombatScene - RE Gaiden-faithful combat system
 *
 * Mechanic: A targeting reticle oscillates horizontally across the enemy.
 * Player must press SPACE at the right moment to hit critical/good/weak zones.
 * Faithful to the original GBC game's slot-machine combat, modernized visually.
 */
class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: CONFIG.SCENES.COMBAT, active: false });
    }

    init(data) {
        this._enemyId = data.enemyId;
        this._enemyIndex = data.enemyIndex;
        this._roomId = data.roomId;
        this._isBoss = data.isBoss || false;
        this._callerScene = data.callerScene || CONFIG.SCENES.GAME;

        const def = ENEMIES[this._enemyId?.toUpperCase()] ||
                    Object.values(ENEMIES).find(e => e.id === this._enemyId);
        this._enemyDef = def;
        this._enemyHp = def ? def.hp : 100;
        this._enemyMaxHp = this._enemyHp;
        this._phase = 1;

        // Reticle state
        this._reticleX = 0;
        this._reticleDir = 1;
        this._reticleSpeed = CONFIG.COMBAT.RETICLE_BASE_SPEED *
            (def?.combat?.reticleSpeed || 1.0);
        this._inDodgeWindow = false;
        this._dodgeTimer = 0;
        this._attackWarningShown = false;
        this._lastAttackTime = 0;
        this._attackInterval = (def?.attackRate || 3000);

        // Player combat state
        this._playerHp = SaveSystem.getState()?.player?.hp || 100;
        this._playerHpMax = SaveSystem.getState()?.player?.hpMax || 100;

        // Combat result
        this._finished = false;
        this._victory = false;
        this._turnPhase = 'player'; // player / enemy_attack / enemy_anim / transition
        this._shotCount = 0;
        this._totalTurns = 0;

        // Weapon state
        const weapon = InventorySystem.getEquippedWeapon();
        this._weaponDef = weapon?.def || null;
        this._ammoCount = weapon?.ammo || 0;
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(300, 0, 0, 0);
        EventSystem.emit('combat_start', {});

        this._buildBackground(W, H);
        this._buildEnemyDisplay(W, H);
        this._buildCombatBar(W, H);
        this._buildPlayerStatus(W, H);
        this._buildEnemyHpBar(W, H);
        this._buildWeaponDisplay(W, H);
        this._buildInstructions(W, H);

        // Input
        this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this._healKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        // Entrance effect
        this._playEntrance();

        // Schedule first enemy attack
        this._scheduleEnemyAttack();
    }

    // =========================================================
    // VISUAL SETUP
    // =========================================================
    _buildBackground(W, H) {
        // Dark background with atmospheric gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000000, 0x000000, 0x0a0510, 0x0a0510, 1);
        bg.fillRect(0, 0, W, H);

        // Floor
        bg.fillStyle(0x0d0d18, 1);
        bg.fillRect(0, H * 0.65, W, H * 0.35);
        bg.lineStyle(1, 0x1a1a28, 0.6);
        bg.strokeRect(0, H * 0.65, W, H * 0.35);

        // Atmospheric lines
        bg.lineStyle(1, 0x111122, 0.4);
        for (let i = 0; i < 8; i++) {
            bg.beginPath();
            bg.moveTo(0, H * 0.65 + i * 10);
            bg.lineTo(W, H * 0.65 + i * 10);
            bg.strokePath();
        }

        // Corner vignette
        bg.fillStyle(0x000000, 0.5);
        bg.fillRect(0, 0, W * 0.1, H);
        bg.fillRect(W * 0.9, 0, W * 0.1, H);

        this._bg = bg;
    }

    _buildEnemyDisplay(W, H) {
        const def = this._enemyDef;
        if (!def) return;

        const centerX = W / 2;
        const centerY = H * 0.38;

        // Enemy sprite container
        this._enemyContainer = this.add.container(centerX, centerY);

        // Scale factor for display
        const scaleMap = {
            zombie: 5, zombie_sailor: 5, zombie_dog: 4,
            licker: 4.5, lurker: 4,
            creature_p1: 5.5, creature_p2: 5.5,
        };
        const scale = scaleMap[def.sprite] || 5;

        if (this.textures.exists(def.sprite)) {
            this._enemySprite = this.add.image(0, 0, def.sprite);
            const spriteW = this.textures.get(def.sprite).getSourceImage().width;
            const spriteH = this.textures.get(def.sprite).getSourceImage().height;
            this._enemySprite.setDisplaySize(spriteW * scale, spriteH * scale);
        } else {
            this._enemySprite = this.add.rectangle(0, 0, 120, 160, 0x4a6a40);
        }

        // Shadow
        const shadow = this.add.ellipse(0, this._enemySprite.displayHeight / 2 + 10, 120, 20, 0x000000, 0.4);
        this._enemyContainer.add(shadow);
        this._enemyContainer.add(this._enemySprite);

        // Idle animation
        this.tweens.add({
            targets: this._enemyContainer,
            y: centerY - 8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Hit zones overlay (visual guide)
        this._buildHitZones(W, H, centerX, centerY);

        // Enemy name
        this._enemyNameText = this.add.text(centerX, H * 0.72, def.name, {
            fontSize: '13px',
            fontFamily: 'Share Tech Mono',
            color: '#888880',
            letterSpacing: 5,
        }).setOrigin(0.5);

        // Lore text (flash briefly on entry)
        const loreText = this.add.text(W / 2, H * 0.78, def.loreText || '', {
            fontSize: '9px',
            fontFamily: 'Share Tech Mono',
            color: '#444440',
            wordWrap: { width: W - 100 },
            align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: loreText,
            alpha: { from: 0, to: 0.6 },
            duration: 1000,
            hold: 3000,
            yoyo: true,
        });
    }

    _buildHitZones(W, H, cx, cy) {
        // Visual indicators for hit zones
        const def = this._enemyDef;
        if (!def?.combat?.bodyParts) return;

        this._hitZoneGraphics = this.add.graphics();
        this._hitZoneGraphics.setAlpha(0.2);

        // Draw each zone as a semi-transparent overlay on the enemy
        // These are relative to the enemy sprite size
        const sprH = this._enemySprite?.displayHeight || 150;
        const sprW = this._enemySprite?.displayWidth || 120;

        for (const [partName, part] of Object.entries(def.combat.bodyParts)) {
            const zx = cx + (part.x - 0.5) * sprW - part.w * sprW / 2;
            const zy = cy - sprH / 2 + part.y * sprH - part.h * sprH / 2;
            const zw = part.w * sprW;
            const zh = part.h * sprH;

            const col = part.isWeakSpot ? 0xffaa00 : part.damageMultiplier >= 3 ? 0xff0000 : 0x448888;
            this._hitZoneGraphics.lineStyle(1, col, 0.4);
            this._hitZoneGraphics.strokeRect(zx, zy, zw, zh);
        }
    }

    _buildCombatBar(W, H) {
        const barY = H * 0.85;
        const barW = W * 0.7;
        const barH = 40;
        const barX = W / 2 - barW / 2;

        // Bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x0a0a0a, 1);
        barBg.fillRect(barX, barY, barW, barH);
        barBg.lineStyle(2, 0x223344, 1);
        barBg.strokeRect(barX, barY, barW, barH);

        // Zone indicators (crit, good, miss)
        const zones = this.add.graphics();
        const zoneY = barY + 4;
        const zoneH = barH - 8;
        const critW = CONFIG.COMBAT.CRIT_ZONE_WIDTH;
        const goodW = CONFIG.COMBAT.GOOD_ZONE_WIDTH;

        // Miss zones (red)
        zones.fillStyle(0x441111, 0.7);
        zones.fillRect(barX + 4, zoneY, (barW - 8) / 2 - goodW / 2, zoneH);
        zones.fillRect(barX + 4 + (barW - 8) / 2 + goodW / 2, zoneY, (barW - 8) / 2 - goodW / 2, zoneH);

        // Good zones (yellow)
        zones.fillStyle(0x444400, 0.7);
        zones.fillRect(barX + 4 + (barW - 8) / 2 - goodW / 2, zoneY, goodW, zoneH);

        // Crit zone (green center)
        zones.fillStyle(0x004400, 0.8);
        zones.fillRect(barX + 4 + (barW - 8) / 2 - critW / 2, zoneY, critW, zoneH);

        // Tick marks
        zones.lineStyle(1, 0x334455, 0.5);
        for (let i = 0; i < 20; i++) {
            const tx = barX + 4 + (i / 20) * (barW - 8);
            zones.beginPath(); zones.moveTo(tx, barY + barH - 8); zones.lineTo(tx, barY + barH - 4); zones.strokePath();
        }

        // Reticle
        this._reticle = this.add.graphics();
        this._reticleBarX = barX + 4;
        this._reticleBarW = barW - 8;
        this._reticleBarY = barY;
        this._reticleBarH = barH;
        this._reticlePos = 0; // 0 to 1
        this._updateReticle();

        // Labels
        this.add.text(barX, barY - 14, 'TARGETING SYSTEM', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#446688', letterSpacing: 3,
        });
        this.add.text(barX + barW / 2, barY - 14, 'CRITICAL', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#44aa44',
        }).setOrigin(0.5);
        this.add.text(barX + barW, barY - 14, '[SPACE] FIRE', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#446688', letterSpacing: 3,
        }).setOrigin(1);
    }

    _updateReticle() {
        if (!this._reticle) return;
        this._reticle.clear();

        const rx = this._reticleBarX + this._reticlePos * this._reticleBarW;
        const ry = this._reticleBarY;
        const rh = this._reticleBarH;

        // Reticle line
        this._reticle.lineStyle(3, 0xffffff, 0.9);
        this._reticle.beginPath();
        this._reticle.moveTo(rx, ry);
        this._reticle.lineTo(rx, ry + rh);
        this._reticle.strokePath();

        // Glow
        this._reticle.lineStyle(6, 0xff4444, 0.3);
        this._reticle.beginPath();
        this._reticle.moveTo(rx, ry);
        this._reticle.lineTo(rx, ry + rh);
        this._reticle.strokePath();

        // Top indicator
        this._reticle.fillStyle(0xff2222, 1);
        this._reticle.fillTriangle(rx, ry - 2, rx - 6, ry - 12, rx + 6, ry - 12);
    }

    _buildPlayerStatus(W, H) {
        // Player HP at bottom left
        this.add.text(20, H * 0.83, 'BARRY', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#c8a040', letterSpacing: 3,
        });

        this._playerHpBarBg = this.add.graphics();
        this._playerHpBarBg.fillStyle(0x111111, 1);
        this._playerHpBarBg.fillRect(20, H * 0.835 + 14, 120, 12);
        this._playerHpBarBg.lineStyle(1, 0x334455, 1);
        this._playerHpBarBg.strokeRect(20, H * 0.835 + 14, 120, 12);

        this._playerHpBar = this.add.graphics();
        this._playerHpText = this.add.text(20, H * 0.835 + 32, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#888',
        });
        this._updatePlayerHpDisplay();

        // Heal hint
        this.add.text(20, H * 0.84 + 52, '[H] Use Herb/Spray', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#335544',
        });
    }

    _updatePlayerHpDisplay() {
        if (!this._playerHpBar) return;
        const H = CONFIG.HEIGHT;
        this._playerHpBar.clear();
        const pct = Math.max(0, this._playerHp / this._playerHpMax);
        const col = pct > 0.5 ? 0x44cc44 : pct > 0.25 ? 0xffaa00 : 0xff2200;
        this._playerHpBar.fillStyle(col, 0.9);
        this._playerHpBar.fillRect(20, H * 0.835 + 14, Math.floor(120 * pct), 12);

        const status = pct > 0.75 ? 'FINE' : pct > 0.5 ? 'CAUTION' : pct > 0.25 ? 'DANGER' : 'CRITICAL';
        const statusCol = pct > 0.75 ? '#44cc44' : pct > 0.5 ? '#ffcc44' : pct > 0.25 ? '#ff8800' : '#ff2200';
        if (this._playerHpText) {
            this._playerHpText.setText(`HP: ${this._playerHp}/${this._playerHpMax} — ${status}`);
            this._playerHpText.setColor(statusCol);
        }
    }

    _buildEnemyHpBar(W, H) {
        const cx = W / 2;
        this.add.text(cx, H * 0.62, this._enemyDef?.name || 'ENEMY', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#cc4444', letterSpacing: 4,
        }).setOrigin(0.5);

        this._enemyHpBarBg = this.add.graphics();
        this._enemyHpBarBg.fillStyle(0x111111, 1);
        this._enemyHpBarBg.fillRect(cx - 100, H * 0.627 + 16, 200, 8);
        this._enemyHpBarBg.lineStyle(1, 0x334455, 1);
        this._enemyHpBarBg.strokeRect(cx - 100, H * 0.627 + 16, 200, 8);

        this._enemyHpBar = this.add.graphics();
        this._updateEnemyHpDisplay();
    }

    _updateEnemyHpDisplay() {
        if (!this._enemyHpBar) return;
        const H = CONFIG.HEIGHT, cx = CONFIG.WIDTH / 2;
        this._enemyHpBar.clear();
        const pct = Math.max(0, this._enemyHp / this._enemyMaxHp);
        const col = pct > 0.5 ? 0xcc2222 : pct > 0.25 ? 0xcc8800 : 0xff4400;
        this._enemyHpBar.fillStyle(col, 0.9);
        this._enemyHpBar.fillRect(cx - 100, H * 0.627 + 16, Math.floor(200 * pct), 8);
    }

    _buildWeaponDisplay(W, H) {
        const weapon = this._weaponDef;
        const wx = W - 160;
        const wy = H * 0.82;

        this.add.text(wx, wy, weapon ? weapon.name : 'NO WEAPON', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#c0b090', letterSpacing: 2,
        });

        this._ammoText = this.add.text(wx, wy + 18, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#888870',
        });
        this._updateAmmoDisplay();
    }

    _updateAmmoDisplay() {
        if (this._ammoText) {
            const weapon = InventorySystem.getEquippedWeapon();
            const ammo = weapon?.ammo || this._ammoCount;
            const cap = this._weaponDef?.ammoCapacity || 0;
            const ammoType = this._weaponDef?.ammoType || '';
            const reserves = InventorySystem.getItemCount(ammoType);
            const ammoPerBox = ITEMS[ammoType.toUpperCase()]?.amount || 6;
            this._ammoText.setText(`${ammo}/${cap} + ${reserves * ammoPerBox}`);
            this._ammoText.setColor(ammo <= 2 ? '#ff4444' : '#888870');
        }
    }

    _buildInstructions(W, H) {
        this._instructionText = this.add.text(W / 2, H * 0.91, 'VISER LE CENTRE POUR FRAPPER CRITIQUE', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#446688', letterSpacing: 3,
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.96, 'ESPACE / F — Tirer  ·  H — Utiliser soin', {
            fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#4a4a4a', letterSpacing: 1,
        }).setOrigin(0.5);
    }

    _playEntrance() {
        // Slide in from right
        if (this._enemyContainer) {
            this._enemyContainer.setX(CONFIG.WIDTH + 200);
            this.tweens.add({
                targets: this._enemyContainer,
                x: CONFIG.WIDTH / 2,
                duration: 400,
                ease: 'Back.easeOut',
            });
        }
    }

    // =========================================================
    // COMBAT LOGIC
    // =========================================================
    _scheduleEnemyAttack() {
        this._nextAttackAt = this.time.now + this._attackInterval + Math.random() * 1000;
    }

    _fireWeapon() {
        if (this._finished || this._turnPhase !== 'player') return;

        // Check ammo
        const weapon = InventorySystem.getEquippedWeapon();
        if (!weapon || weapon.ammo <= 0) {
            // Dry fire
            AudioSynth.sfx('dry_fire');
            this._showCombatMessage('NO AMMO!', '#ff4444');
            // Try to reload
            if (!InventorySystem.reload()) {
                // Must use melee (knife)
                this._meleeAttack();
            } else {
                AudioSynth.sfx('reload');
                this._showCombatMessage('RELOADED', '#aaaaaa');
                this._ammoCount = InventorySystem.getEquippedWeapon()?.ammo || 0;
                this._updateAmmoDisplay();
            }
            return;
        }

        // Calculate hit zone
        const pos = this._reticlePos; // 0 to 1
        const center = 0.5;
        const critHalf = CONFIG.COMBAT.CRIT_ZONE_WIDTH / this._reticleBarW / 2;
        const goodHalf = CONFIG.COMBAT.GOOD_ZONE_WIDTH / this._reticleBarW / 2;
        const dist = Math.abs(pos - center);

        let hitType = 'miss';
        if (dist < critHalf) hitType = 'crit';
        else if (dist < goodHalf) hitType = 'good';

        // Apply damage
        const baseDmg = this._weaponDef?.damage || 30;
        let dmgMult = hitType === 'crit' ? 3.0 : hitType === 'good' ? 1.0 : 0.2;
        const finalDmg = Math.floor(baseDmg * dmgMult);

        InventorySystem.useAmmo();
        this._ammoCount = InventorySystem.getEquippedWeapon()?.ammo || 0;
        this._updateAmmoDisplay();

        if (hitType === 'miss') {
            AudioSynth.sfx('combat_miss');
            const sfxName = weapon.def?.subtype === 'gun' ? 'gunshot_pistol' : 'gunshot_pistol';
            AudioSynth.sfx(sfxName);
            this._showCombatMessage('MISS!', '#888888');
            this._enemyShakeEffect(false);
        } else {
            const sfxName = weapon.id === 'shotgun' ? 'gunshot_shotgun' : 'gunshot_pistol';
            AudioSynth.sfx(sfxName);

            if (hitType === 'crit') {
                AudioSynth.sfx('combat_crit');
                this._showCombatMessage(`CRITICAL! -${finalDmg}`, '#ff4400');
            } else {
                AudioSynth.sfx('combat_hit');
                this._showCombatMessage(`HIT! -${finalDmg}`, '#ffcc44');
            }

            this._enemyHp -= finalDmg;
            this._enemyShakeEffect(true);
            this._updateEnemyHpDisplay();

            // Muzzle flash
            this._showMuzzleFlash();

            // Check death
            if (this._enemyHp <= 0) {
                // Check phase transition
                const def = this._enemyDef;
                if (def?.combat?.phases > 1 && this._phase === 1 && def?.combat?.nextPhase) {
                    this._transitionToPhase2();
                } else {
                    this._enemyHp = 0;
                    this._victory = true;
                    this.time.delayedCall(800, () => this._endCombat(true));
                    return;
                }
            }
        }

        this._shotCount++;
        this._totalTurns++;
    }

    _meleeAttack() {
        const finalDmg = 10;
        AudioSynth.sfx('combat_hit');
        this._enemyHp -= finalDmg;
        this._showCombatMessage(`COUTEAU! -${finalDmg}`, '#aaffaa');
        this._enemyShakeEffect(true);
        this._updateEnemyHpDisplay();

        if (this._enemyHp <= 0) {
            this._victory = true;
            this.time.delayedCall(800, () => this._endCombat(true));
        }
    }

    _enemyShakeEffect(hit) {
        if (!this._enemyContainer) return;
        const startX = this._enemyContainer.x;
        if (hit) {
            AudioSynth.sfx(this._isBoss ? 'boss_hurt' : 'zombie_hurt');
            // Red flash
            if (this._enemySprite?.setTint) this._enemySprite.setTint(0xff0000);
            this.time.delayedCall(150, () => { if (this._enemySprite?.clearTint) this._enemySprite.clearTint(); });
        }
        this.tweens.add({
            targets: this._enemyContainer,
            x: { from: startX + (hit ? 15 : 0), to: startX },
            duration: 200,
            ease: 'Bounce.easeOut',
        });
    }

    _showMuzzleFlash() {
        if (!this.textures.exists('muzzle_flash')) return;
        const flash = this.add.image(80, CONFIG.HEIGHT * 0.4, 'muzzle_flash');
        flash.setScale(1.5);
        flash.setAlpha(1);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 150,
            onComplete: () => flash.destroy(),
        });
    }

    _transitionToPhase2() {
        this._phase = 2;
        const newDef = ENEMIES[this._enemyDef.combat.nextPhase?.toUpperCase()] ||
                       Object.values(ENEMIES).find(e => e.id === this._enemyDef.combat.nextPhase);
        if (!newDef) {
            this._victory = true;
            this.time.delayedCall(800, () => this._endCombat(true));
            return;
        }

        this._showCombatMessage('PHASE 2!', '#ff8800');
        AudioSynth.sfx('boss_roar');

        // Update enemy
        this._enemyDef = newDef;
        this._enemyHp = newDef.hp;
        this._enemyMaxHp = newDef.hp;
        this._reticleSpeed = CONFIG.COMBAT.RETICLE_BASE_SPEED * (newDef.combat?.reticleSpeed || 1.0);

        // Update sprite
        if (this._enemySprite && this.textures.exists(newDef.sprite)) {
            const scaleMap = { creature_p2: 5.5 };
            const scale = scaleMap[newDef.sprite] || 5;
            const srcW = this.textures.get(newDef.sprite).getSourceImage().width;
            const srcH = this.textures.get(newDef.sprite).getSourceImage().height;
            this.tweens.add({
                targets: this._enemySprite,
                scaleX: 0,
                duration: 200,
                onComplete: () => {
                    this._enemySprite.setTexture(newDef.sprite);
                    this._enemySprite.setDisplaySize(srcW * scale, srcH * scale);
                    this.tweens.add({ targets: this._enemySprite, scaleX: 1, duration: 300 });
                },
            });
        }

        this._updateEnemyHpDisplay();
        if (this._enemyNameText) this._enemyNameText.setText(newDef.name);
    }

    _handleEnemyAttack() {
        if (this._finished) return;
        const def = this._enemyDef;
        if (!def) return;

        // Show warning
        AudioSynth.sfx('zombie_groan');
        const warning = def.combat?.attackWarning || 'The enemy attacks!';
        this._showCombatMessage(warning, '#ff8800');
        this._turnPhase = 'enemy_attack';

        this.time.delayedCall(800, () => {
            if (this._finished) return;
            // Check if player dodged
            if (this._inDodgeWindow) {
                this._showCombatMessage('DODGED!', '#44ff88');
                AudioSynth.sfx('combat_miss');
            } else {
                const dmg = def.attackDamage || 15;
                this._playerHp = Math.max(0, this._playerHp - dmg);
                const state = SaveSystem.getState();
                if (state) state.player.hp = this._playerHp;
                AudioSynth.sfx('player_hurt');
                this._showCombatMessage(`TOOK ${dmg} DAMAGE!`, '#ff2222');
                this._screenFlash(0xff0000, 0.3);
                this._updatePlayerHpDisplay();
                EventSystem.emit('player_hp_changed', { hp: this._playerHp, hpMax: this._playerHpMax });

                if (this._playerHp <= 0) {
                    this._endCombat(false);
                    return;
                }
            }
            this._turnPhase = 'player';
            this._scheduleEnemyAttack();
        });
    }

    _screenFlash(color, alpha) {
        const flash = this.add.graphics().setDepth(100);
        flash.fillStyle(color, alpha);
        flash.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy(),
        });
    }

    _showCombatMessage(text, color = '#ffffff') {
        if (this._combatMsgText) {
            this._combatMsgText.destroy();
        }
        this._combatMsgText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.56, text, {
            fontSize: '14px',
            fontFamily: 'Share Tech Mono',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
            letterSpacing: 3,
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: this._combatMsgText,
            alpha: { from: 1, to: 0 },
            y: CONFIG.HEIGHT * 0.56 - 20,
            duration: 2000,
            delay: 800,
            onComplete: () => {
                if (this._combatMsgText) {
                    this._combatMsgText.destroy();
                    this._combatMsgText = null;
                }
            },
        });
    }

    // =========================================================
    // COMBAT END
    // =========================================================
    _endCombat(victory) {
        if (this._finished) return;
        this._finished = true;
        this._victory = victory;

        if (victory) {
            AudioSynth.sfx('zombie_die');
            this._showCombatMessage('ENEMY DEFEATED', '#44ff44');
            // Death animation
            if (this._enemyContainer) {
                this.tweens.add({
                    targets: this._enemyContainer,
                    alpha: 0,
                    scaleX: 1.5,
                    scaleY: 0,
                    y: this._enemyContainer.y + 40,
                    duration: 800,
                });
            }
        } else {
            AudioSynth.sfx('player_die');
            this._showCombatMessage('YOU DIED', '#ff2222');
        }

        // Calculate drops
        const drops = [];
        if (victory && this._enemyDef?.drops) {
            for (const drop of this._enemyDef.drops) {
                if (Math.random() < drop.chance) {
                    drops.push(drop.item);
                }
            }
        }

        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, (cam, progress) => {
                if (progress === 1) {
                    this.scene.stop();
                    EventSystem.emit('combat_end', {});
                    EventSystem.emit('combat_finished', {
                        victory,
                        enemyId: this._enemyId,
                        enemyIndex: this._enemyIndex,
                        roomId: this._roomId,
                        isBoss: this._isBoss,
                        drops,
                        shotsFired: this._shotCount,
                    });
                    if (!victory) {
                        EventSystem.emit('player_dead', {});
                    }
                }
            });
        });
    }

    // =========================================================
    // USE HEAL ITEM IN COMBAT
    // =========================================================
    _useBestHealItem() {
        // Priority: First Aid Spray > Mixed Herb > Green Herb > Antibiotic
        const healPriority = ['first_aid_spray', 'herb_mixed', 'herb_green', 'antibiotic'];
        for (const itemId of healPriority) {
            if (InventorySystem.hasItem(itemId)) {
                InventorySystem.useHealItem(itemId);
                const amount = ITEMS[itemId.toUpperCase()]?.healAmount || 0;
                this._playerHp = Math.min(this._playerHpMax, this._playerHp + amount);
                this._updatePlayerHpDisplay();
                AudioSynth.sfx('herb_use');
                this._showCombatMessage(`HEALED +${Math.min(amount, this._playerHpMax)}`, '#44cc88');
                return true;
            }
        }
        this._showCombatMessage('NO HEAL ITEMS', '#ff4444');
        return false;
    }

    // =========================================================
    // UPDATE
    // =========================================================
    update(time, delta) {
        if (this._finished) return;

        const dt = delta / 1000;

        // Move reticle
        if (this._turnPhase === 'player') {
            this._reticlePos += this._reticleDir * this._reticleSpeed * dt / this._reticleBarW;

            if (this._reticlePos >= 1) {
                this._reticlePos = 1;
                this._reticleDir = -1;
            } else if (this._reticlePos <= 0) {
                this._reticlePos = 0;
                this._reticleDir = 1;
            }

            this._updateReticle();

            // Enemy attack timing
            if (time >= this._nextAttackAt && this._turnPhase === 'player') {
                // Show dodge window
                this._inDodgeWindow = false;
                this._instructionText.setText(`${this._enemyDef?.combat?.attackWarning || 'INCOMING!'} — ${this._enemyDef?.combat?.attackDodgeText || '[SPACE] DODGE!'}`);
                this._instructionText.setColor('#ffaa44');

                this._inDodgeWindowOpen = true;
                this.time.delayedCall(CONFIG.COMBAT.DODGE_WINDOW * 1000, () => {
                    this._inDodgeWindowOpen = false;
                    this._handleEnemyAttack();
                    this._instructionText.setText('TIME YOUR SHOT — AIM FOR THE CENTER');
                    this._instructionText.setColor('#446688');
                });

                this._nextAttackAt = Infinity;
            }

            // Fire input
            if (Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
                Phaser.Input.Keyboard.JustDown(this._fireKey)) {
                // Check if in attack window (dodge!)
                if (this._inDodgeWindowOpen) {
                    this._inDodgeWindow = true;
                } else {
                    this._fireWeapon();
                }
            }

            // Heal input
            if (Phaser.Input.Keyboard.JustDown(this._healKey)) {
                this._useBestHealItem();
            }
        }
    }
}
