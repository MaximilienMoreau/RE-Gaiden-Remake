const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function game() {
    const context = vm.createContext({ console, Date, Math, AudioSynth: { sfx() {}, playBgm() {} }, Phaser: { Scene: class {} },
        localStorage: { value: null, getItem() { return this.value; }, setItem(k, v) { this.value = v; } } });
    for (const file of ['Config', 'utils/UITheme', 'data/Items', 'data/Enemies', 'data/Maps', 'data/Dialogues',
        'systems/EventSystem', 'systems/SaveSystem', 'systems/InventorySystem',
        'scenes/GameScene', 'scenes/CombatScene', 'scenes/GameOverScene']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file + '.js'), 'utf8'), context);
    }
    return vm.runInContext('({ CONFIG, ITEMS, MAPS, SaveSystem, InventorySystem, EventSystem, GameScene, CombatScene, GameOverScene })', context);
}
test('stack overflow is conserved and full inventory additions are atomic', () => {
    const { SaveSystem: S, InventorySystem: I, CONFIG } = game(); S.newGame();
    assert.equal(I.addItem('ammo_357', 12), true);
    assert.equal(I.getItemCount('ammo_357'), 12);
    assert.deepEqual(Array.from(I.getInventory(), s => s.qty), [5, 5, 2]);
    I.addItem('knife', CONFIG.MAX_INVENTORY_SLOTS - 3);
    const before = JSON.stringify(I.getInventory());
    assert.equal(I.addItem('ammo_357', 4), false);
    assert.equal(JSON.stringify(I.getInventory()), before);
    assert.equal(I.removeItem('ammo_357', 13), false);
    assert.equal(I.removeItem('ammo_357', 7), true);
    assert.equal(I.getItemCount('ammo_357'), 5);
    assert.equal(I.addItem('knife', -1), false);
    assert.equal(I.removeItem('knife', -1), false);
});
test('heals, equipment and combinations require owned items', () => {
    const { SaveSystem: S, InventorySystem: I } = game(); const state = S.newGame(); state.player.hp = 20;
    assert.equal(I.useHealItem('herb_green'), false);
    assert.equal(I.equipWeapon('shotgun'), false);
    I.addItem('herb_green');
    assert.equal(I.combineItems('herb_green', 'herb_red'), null);
    assert.equal(I.getItemCount('herb_green'), 1);
    I.addItem('herb_red');
    assert.equal(I.useHealItem('herb_red'), false);
    assert.equal(I.combineItems('herb_green', 'herb_red'), 'herb_mixed');
    assert.equal(I.useHealItem('herb_mixed'), true);
    assert.equal(state.player.hp, state.player.hpMax);
    I.addItem('herb_green');
    assert.equal(I.useHealItem('herb_green'), false);
    assert.equal(I.hasItem('herb_green'), true);
});
test('equipping the current weapon preserves its live chamber, including old saves', () => {
    const { SaveSystem: S, InventorySystem: I } = game(); const state = S.newGame();
    I.addItem('barry_revolver'); I.addItem('ammo_357', 2); I.equipWeapon('barry_revolver'); I.useAmmo();
    I.equipWeapon('barry_revolver'); assert.equal(state.equippedWeaponAmmo, 5);
    delete state.weaponAmmoMap; I.equipWeapon('barry_revolver');
    assert.equal(state.equippedWeaponAmmo, 5); assert.equal(I.getItemCount('ammo_357'), 1);
});
test('withdrawal preserves remaining stored quantity', () => {
    const { SaveSystem: S, InventorySystem: I } = game(); const state = S.newGame();
    state.itemBox.push({ id: 'herb_green', qty: 3 });
    assert.equal(I.withdrawFromBox('herb_green'), true);
    assert.equal(state.itemBox[0].qty, 2); assert.equal(I.getItemCount('herb_green'), 1);
});
test('save round trip restores state; malformed slots cannot replace active state', () => {
    const { SaveSystem: S } = game(); const state = S.newGame();
    state.player.position = { tx: 5, ty: 6 }; assert.equal(S.save(2), true);
    state.player.hp = 10; assert.equal(S.load(2), true); assert.equal(S.getState().player.hp, state.player.hpMax);
    assert.equal(S.getState().player.position.tx, 5);
    assert.equal(S.save(-1), false);
    const active = S.getState(); S._loadAll = () => ({ 0: { player: {} } });
    assert.equal(S.load(0), false); assert.equal(S.getState(), active);
});
test('companions are restored from story flags when exploration restarts', () => {
    const { SaveSystem: S, GameScene: G, CONFIG } = game(); S.newGame();
    S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND); S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
    const scene = new G(); scene.init({ fromSave: true });
    assert.deepEqual(Array.from(scene._companionRegistry, c => c.npcId), ['leon', 'lucia_first_meeting']);
});
test('correct Leon choice waits for dialogue completion before starting final fight', () => {
    const { SaveSystem: S, GameScene: G } = game(); S.newGame(); const scene = new G();
    scene._isBusy = true; let dialogue; let combat;
    scene._triggerCutscene = id => { assert.equal(scene._isBusy, false); dialogue = id; };
    scene._resolveTwoLeonsChoice(true); assert.equal(dialogue, 'act4_real_leon_identified');
    scene.scene = { isActive: () => false }; scene._onCombatTriggered = data => { combat = data; };
    scene._onDialogueClosed({ dialogueId: dialogue }); assert.equal(combat.enemyId, 'creature_p1');
});
test('final boss victory starts the epilogue despite exploration input lock', () => {
    const { SaveSystem: S, GameScene: G } = game(); S.newGame(); const scene = new G();
    scene._isBusy = true; const timers = []; let dialogue;
    scene.time = { delayedCall: (delay, fn) => timers.push(fn) };
    scene._triggerCutscene = id => { assert.equal(scene._isBusy, false); dialogue = id; };
    scene._onCombatFinished({ victory: true, isBoss: true, enemyId: 'creature_p2', drops: [] });
    timers[0](); assert.equal(dialogue, 'act4_lucia_saves_leon');
    assert.equal(S.getFlag('boss_defeated_creature_p1'), true);
});
test('busy exploration does not consume cutscene or boss triggers', () => {
    const { GameScene: G } = game(); const scene = new G();
    scene._player = { x: 0, y: 0 }; scene._isBusy = true;
    const trig = { px: 0, py: 0, radius: 100, triggered: false };
    scene._cutsceneTriggers = [trig]; scene._updateProximityObjects(); assert.equal(trig.triggered, false);
});
test('continue loads the newest save rather than the first numbered slot', () => {
    const { SaveSystem: S, GameOverScene: G } = game(); const scene = new G(); let loaded;
    S.getSaveInfo = slot => ({ exists: true, timestamp: [10, 30, 20][slot] });
    S.load = slot => { loaded = slot; return false; };
    const order = []; S.load = slot => { order.push(slot); loaded = slot; return false; };
    scene.cameras = { main: { fadeOut: (ms, r, g, b, fn) => fn(null, 1) } };
    scene.scene = { start() {} }; scene._executeOption('continue');
    assert.deepEqual(order, [1, 2, 0]);
});
test('all map connections and data references exist and destination spawns are walkable', () => {
    const { MAPS, ITEMS } = game(); const itemIds = new Set(Object.values(ITEMS).map(i => i.id));
    for (const [id, room] of Object.entries(MAPS)) {
        assert.equal(room.tiles.length, room.tileHeight, id);
        for (const row of room.tiles) assert.equal(row.length, room.tileWidth, id);
        for (const o of room.objects) if (o.itemId || o.fileId || o.noteId)
            assert.equal(itemIds.has(o.itemId || o.fileId || o.noteId), true, `${id}: item`);
        for (const c of Object.values(room.connections || {})) {
            const target = MAPS[c.targetRoom]; assert.ok(target, `${id}: target`);
            assert.ok(![1, 3, 6, 7].includes(target.tiles[c.targetTy]?.[c.targetTx]), `${id} -> ${target.id}: blocked spawn ${c.targetTx},${c.targetTy}`);
        }
    }
});

test('partial reloads conserve every remaining bullet and survive saving', () => {
    const { SaveSystem: S, InventorySystem: I } = game(); S.newGame();
    I.addItem('barry_revolver'); I.addItem('ammo_357', 2); I.equipWeapon('barry_revolver');
    I.useAmmo(); assert.equal(I.reload(), true);
    assert.equal(I.getReserveAmmo('ammo_357'), 5);
    S.save(0); S.load(0);
    for (let n = 0; n < 6; n++) I.useAmmo();
    assert.equal(I.reload(), true);
    assert.equal(I.getEquippedWeapon().ammo, 5);
    assert.equal(I.getReserveAmmo('ammo_357'), 0);
});

test('boss phase transition reports the actual final phase and its attack rate', () => {
    const { SaveSystem: S, CombatScene: C, CONFIG } = game(); S.newGame();
    const scene = new C(); scene.init({ enemyId: 'creature_p1' });
    scene._showCombatMessage = () => {}; scene._updateEnemyHpDisplay = () => {};
    scene._transitionToPhase2();
    assert.equal(scene._enemyId, 'creature_p2');
    assert.equal(scene._enemyHp, scene._enemyDef.hp);
    assert.equal(scene._attackInterval, scene._enemyDef.attackRate);
    assert.equal(scene._inDodgeWindowOpen, false);
});

test('victory prevents delayed enemy attacks from killing the player', () => {
    const { SaveSystem: S, CombatScene: C } = game(); S.newGame();
    const scene = new C(); scene.init({ enemyId: 'zombie' });
    scene._victory = true;
    scene.time = { delayedCall() { throw new Error('attack scheduled after victory'); } };
    scene._handleEnemyAttack();
});
test('knife attacks do not postpone enemy attacks indefinitely', () => {
    const { SaveSystem: S, CombatScene: C, InventorySystem: I } = game(); S.newGame();
    I.addItem('knife'); I.equipWeapon('knife');
    const scene = new C(); scene.init({ enemyId: 'zombie' });
    scene._meleeAttack = () => {}; scene._nextAttackAt = 123;
    scene._fireWeapon(); assert.equal(scene._nextAttackAt, 123);
});
