const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function game() {
    const context = vm.createContext({ console, Date, Math, AudioSynth: { sfx() {}, playBgm() {}, stopBgm() {} }, Phaser: { Scene: class {}, GameObjects: { Container: class {} }, Math: { Distance: { Between: (x, y, a, b) => Math.hypot(x - a, y - b) } }, Input: { Keyboard: { KeyCodes: { ESC: 27 } } } },
        localStorage: { value: null, getItem() { return this.value; }, setItem(k, v) { this.value = v; } } });
    for (const file of ['Config', 'utils/UITheme', 'data/Items', 'data/Enemies', 'data/Maps', 'data/Dialogues', 'utils/RoomNavigation',
        'systems/EventSystem', 'systems/SaveSystem', 'systems/InventorySystem', 'entities/NPC', 'entities/Enemy',
        'scenes/GameScene', 'scenes/CombatScene', 'scenes/GameOverScene', 'scenes/InventoryScene', 'scenes/DialogueScene']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file + '.js'), 'utf8'), context);
    }
    return vm.runInContext('({ CONFIG, ITEMS, MAPS, DIALOGUES, RoomNavigation, NPC, Enemy, SaveSystem, InventorySystem, EventSystem, GameScene, CombatScene, GameOverScene, InventoryScene, DialogueScene })', context);
}
test('stack overflow is conserved and full inventory additions are atomic', () => {
    const { SaveSystem: S, InventorySystem: I, CONFIG } = game(); S.newGame();
    assert.equal(I.addItem('ammo_357', 12), true);
    assert.equal(I.getItemCount('ammo_357'), 12);
    assert.deepEqual(Array.from(I.getInventory(), s => s.qty), [1, 5, 5, 2]);
    I.addItem('first_aid_spray', CONFIG.MAX_INVENTORY_SLOTS - 4);
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
    let transformDone; scene._playFalseLeonTransformation = done => { transformDone = done; };
    scene._onDialogueClosed({ dialogueId: dialogue }); assert.equal(combat, undefined);
    transformDone(); assert.equal(combat.enemyId, 'creature_p1');
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

// Lightweight UI objects retain click callbacks so menus are exercised end to end.
function uiScene(scene) {
    const objects = [];
    const make = (label = '') => {
        const object = new Proxy({ text: label, handlers: {}, active: true }, {
            get(target, key) {
                if (key in target) return target[key];
                if (key === 'on' || key === 'once') return (event, fn) => { target.handlers[event] = fn; return object; };
                if (key === 'destroy') return () => { target.active = false; };
                if (key === 'setText') return value => { target.text = value; return object; };
                return () => object;
            }
        });
        objects.push(object); return object;
    };
    scene.add = { graphics: () => make(), text: (x, y, label) => make(label),
        container: () => make(), rectangle: () => make(),
        image: (x, y, texture) => { const obj = make(); obj.texture = texture; return obj; } };
    scene.tweens = { add() {}, killTweensOf() {} };
    const keys = [];
    scene.input = { keyboard: { addKey: () => { const key = make(); keys.push(key); return key; }, removeKey() {} } };
    scene._player = { locked: false, lockInput(value) { this.locked = value; } };
    scene._showFloatingMessage = () => {};
    const timers = [];
    scene.time = { delayedCall: (ms, fn) => timers.push(fn) };
    const click = label => {
        const obj = objects.findLast(o => o.active && o.text === label && o.handlers.pointerdown);
        assert.ok(obj, `clickable menu entry ${label}`); obj.handlers.pointerdown();
    };
    return { objects, keys, timers, click };
}

test('typewriter opens, saves a slot, and closes without leaving input locked', () => {
    const { GameScene: G, SaveSystem: S } = game(); S.newGame();
    const scene = new G(); const ui = uiScene(scene);
    scene._showSaveMenu();
    assert.equal(scene._player.locked, true);
    const slot = ui.objects.find(o => String(o.text).includes('SLOT 1'));
    slot.handlers.pointerdown(); assert.equal(S.getSaveInfo(0).exists, true);
    ui.timers[0](); assert.equal(scene._isBusy, false); assert.equal(scene._player.locked, false);
    assert.ok(ui.objects.filter(o => !ui.keys.includes(o)).every(o => !o.active));
});

test('knife starts equipped, remains available and switches with guns without losing ammunition', () => {
    const { SaveSystem: S, InventorySystem: I, CombatScene: C } = game(); S.newGame();
    assert.equal(I.hasItem('knife'), true); assert.equal(I.getEquippedWeapon().id, 'knife');
    I.addItem('handgun'); I.addItem('ammo_9mm'); I.equipWeapon('handgun'); I.useAmmo();
    assert.equal(I.equipWeapon('knife'), true);
    const combat = new C(); combat.init({ enemyId: 'zombie' }); assert.equal(combat._isMelee, true);
    assert.equal(I.removeItem('knife'), false); assert.equal(I.depositToBox('knife'), false);
    I.equipWeapon('handgun'); assert.equal(I.getEquippedWeapon().ammo, 14);
    S.save(0); S.load(0); I.equipWeapon('knife'); assert.equal(I.getEquippedWeapon().id, 'knife');
});

test('legacy full saves recover the knife without deleting items or the equipped gun', () => {
    const { SaveSystem: S, InventorySystem: I, CONFIG } = game(); const state = S.newGame();
    state.inventory = [{ id: 'handgun', qty: 1 }, ...Array.from({ length: CONFIG.MAX_INVENTORY_SLOTS - 1 }, () => ({ id: 'first_aid_spray', qty: 1 }))];
    state.equippedWeapon = 'handgun'; state.equippedWeaponAmmo = 7;
    S.save(0); assert.equal(S.load(0), true);
    assert.equal(I.hasItem('knife'), true); assert.equal(I.getInventory().length, CONFIG.MAX_INVENTORY_SLOTS);
    assert.equal(I.getItemCount('first_aid_spray') + I.getItemBox().reduce((n, s) => n + (s.id === 'first_aid_spray' ? s.qty : 0), 0), CONFIG.MAX_INVENTORY_SLOTS - 1);
    assert.equal(I.getEquippedWeapon().ammo, 7);
});

test('item box menu deposits and retrieves loaded weapons and offers later pages', () => {
    const { SaveSystem: S, InventorySystem: I, GameScene: G } = game(); S.newGame();
    I.addItem('handgun'); I.addItem('ammo_9mm'); I.equipWeapon('handgun'); I.useAmmo();
    const scene = new G(); const ui = uiScene(scene); scene._showItemBox(); ui.click('[STORE]');
    assert.equal(I.hasItem('handgun'), false); assert.equal(I.getItemBox()[0].id, 'handgun');
    ui.click('[TAKE]'); ui.click('[TAKE]'); // switch to withdrawal, then take the weapon
    assert.equal(I.hasItem('handgun'), true); I.equipWeapon('handgun'); assert.equal(I.getEquippedWeapon().ammo, 14);
    I.addItem('first_aid_spray', 7); ui.click('[DEPOSIT]'); ui.click('[NEXT]');
    assert.ok(ui.objects.some(o => o.active && o.text === '2/2'));
    ui.keys.at(-1).handlers.down(); assert.equal(scene._player.locked, false);
});

test('combat receives the surviving enemy HP from exploration', () => {
    const { SaveSystem: S, GameScene: G, CombatScene: C } = game(); S.newGame();
    const scene = new G(); uiScene(scene); let launch;
    scene.cameras = { main: { flash() {} } };
    scene.scene = { launch: (key, data) => { launch = data; } };
    scene.time = { delayedCall: (ms, fn) => fn() };
    scene._onCombatTriggered({ enemyId: 'zombie', enemyIndex: 1, roomId: 'aft_deck', enemy: { hp: 12 } });
    const combat = new C(); combat.init(launch);
    assert.equal(combat._enemyHp, 12); assert.ok(combat._enemyMaxHp > 12);
});

test('all weapons, ammunition and healing items work across equip, reload and use', () => {
    const { ITEMS, SaveSystem: S, InventorySystem: I } = game(); S.newGame();
    for (const def of Object.values(ITEMS).filter(d => d.type === 'weapon')) {
        if (def.id !== 'knife') assert.equal(I.addItem(def.id), true);
        if (def.ammoType) assert.equal(I.addItem(def.ammoType, 2), true);
        assert.equal(I.equipWeapon(def.id), true);
        if (def.ammoType) {
            assert.equal(I.getEquippedWeapon().ammo, def.ammoCapacity);
            I.useAmmo(); assert.equal(I.reload(), true);
            assert.equal(I.getEquippedWeapon().ammo, def.ammoCapacity);
            assert.equal(I.getReserveAmmo(def.ammoType), def.ammoCapacity - 1);
        }
        I.equipWeapon('knife');
    }
    for (const def of Object.values(ITEMS).filter(d => d.type === 'heal')) {
        S.getState().player.hp = 1; assert.equal(I.addItem(def.id), true);
        assert.equal(I.useHealItem(def.id), def.healAmount > 0);
        if (def.healAmount > 0) assert.equal(S.getState().player.hp, Math.min(1 + def.healAmount, S.getState().player.hpMax));
    }
    I.addItem('antibiotic'); S.setFlag('poisoned'); S.getState().player.hp = S.getState().player.hpMax;
    assert.equal(I.useHealItem('antibiotic'), true); assert.equal(S.getFlag('poisoned'), false);
});

test('inventory action buttons and context menu equip the knife, reload, read and combine', () => {
    const { SaveSystem: S, InventorySystem: I, InventoryScene: Inv } = game(); S.newGame();
    I.addItem('handgun'); I.addItem('ammo_9mm', 2); I.equipWeapon('handgun'); I.useAmmo();
    I.addItem('herb_green'); I.addItem('herb_red'); I.addItem('diary_passenger');
    for (const method of ['_showActionButtons', '_showContextMenu']) {
        const scene = new Inv(); const ui = uiScene(scene);
        scene._detailX = 0; scene._detailY = 0; scene._detailW = 300;
        scene._close = () => {};
        let launched; scene.scene = { launch: (key, data) => { launched = data; } };
        const menu = id => {
            if (method === '_showActionButtons') scene[method]({ id });
            else scene[method](I.getInventory().findIndex(item => item.id === id), 100, 100);
        };
        menu('knife'); ui.click('EQUIP'); assert.equal(I.getEquippedWeapon().id, 'knife');
        assert.ok(!ui.objects.some(o => o.active && o.text === 'DISCARD'));
        I.equipWeapon('handgun'); I.useAmmo(); I.addItem('ammo_9mm'); menu('ammo_9mm'); ui.click('RELOAD');
        assert.equal(I.getEquippedWeapon().ammo, 15);
        menu('diary_passenger'); ui.click('READ'); assert.ok(launched.singleText.includes('PASSENGER DIARY'));
        if (!I.hasItem('herb_red')) { I.addItem('herb_red'); I.addItem('herb_green'); }
        menu('herb_red'); ui.click('COMBINE'); assert.equal(I.hasItem('herb_mixed'), true);
    }
});

test('all documents are paginated without losing any wrapped lines', () => {
    const { ITEMS, DialogueScene: D } = game();
    for (const item of Object.values(ITEMS).filter(d => d.type === 'file')) {
        const scene = new D();
        const lines = item.fileContent.split('\n').flatMap(line => line.match(/.{1,90}/g) || ['']);
        scene._mainText = { getWrappedText: () => lines };
        scene._lines = [{ text: item.fileContent, speaker: 'EXAMINE' }]; scene._paginateLines();
        assert.equal(scene._lines.map(p => p.text).join('\n'), lines.join('\n'));
        for (const page of scene._lines) assert.ok(page.text.split('\n').length <= 5);
    }
});

test('every room exit and story object is reachable on foot from each arrival', () => {
    const { MAPS } = game();
    for (const room of Object.values(MAPS)) {
        const entries = Object.values(MAPS).flatMap(r => Object.values(r.connections || {}).filter(c => c.targetRoom === room.id).map(c => [c.targetTx, c.targetTy]));
        entries.push(...room.objects.filter(o => o.type === 'player_start').map(o => [o.tx, o.ty]));
        const doors = new Set(Object.values(room.connections || {}).map(c => `${c.tx},${c.ty}`));
        for (const start of entries) {
            const queue = [start], seen = new Set([start.join(',')]);
            for (let i = 0; i < queue.length; i++) {
                const [x, y] = queue[i];
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const a = x + dx, b = y + dy, key = `${a},${b}`;
                    if (a < 0 || b < 0 || a >= room.tileWidth || b >= room.tileHeight || seen.has(key)) continue;
                    if (!doors.has(key) && [1, 3, 6, 7].includes(room.tiles[b][a])) continue;
                    seen.add(key); queue.push([a, b]);
                }
            }
            for (const c of Object.values(room.connections || {})) assert.ok(seen.has(`${c.tx},${c.ty}`), `${room.id}: exit to ${c.targetRoom}`);
            for (const obj of room.objects.filter(o => ['item', 'file', 'note', 'npc', 'cutscene_trigger', 'boss_trigger', 'save_point', 'item_box'].includes(o.type))) {
                assert.ok(queue.some(([x, y]) => Math.hypot(x - obj.tx, y - obj.ty) < (obj.type.includes('trigger') ? 1 : 1.5)), `${room.id}: ${obj.itemId || obj.cutsceneId || obj.type}`);
            }
        }
    }
});

test('keys can be acquired before their locks, and the adventure reaches the ending via both boss phases', () => {
    const { MAPS, SaveSystem: S, InventorySystem: I, GameScene: G, CombatScene: C, CONFIG } = game(); S.newGame();
    // Explore the room graph while acquiring keys only in rooms already accessible.
    const rooms = new Set(['aft_deck']); let changed = true;
    while (changed) {
        changed = false;
        for (const id of rooms) {
            for (const obj of MAPS[id].objects.filter(o => o.itemId?.startsWith('key_'))) if (!I.hasItem(obj.itemId)) I.addItem(obj.itemId);
            for (const conn of Object.values(MAPS[id].connections || {})) {
                if (conn.locked && !I.hasItem(conn.keyId)) continue;
                if (!rooms.has(conn.targetRoom)) { rooms.add(conn.targetRoom); changed = true; }
            }
        }
    }
    assert.equal(rooms.size, Object.keys(MAPS).length);
    const scene = new G(); scene.init({}); uiScene(scene);
    scene._currentRoomId = 'cargo_hold';
    const launches = []; const timers = [];
    scene.time = { delayedCall: (ms, fn) => timers.push(fn) };
    scene.scene = { isActive: () => false, launch: (key, data) => launches.push({ key, data }), stop() {}, start: key => launches.push({ key }) };
    scene.cameras = { main: { flash() {}, shake() {}, fadeOut: (ms, r, g, b, fn) => fn(null, 1) } };
    scene._onDialogueClosed({ dialogueId: 'act1_leon_first_meeting' });
    scene._onDialogueClosed({ dialogueId: 'act2_lucia_found' });
    assert.equal(S.getFlag(CONFIG.FLAGS.ACT1_LEON_FOUND), true);
    assert.equal(S.getFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED), true);
    scene._triggerCutscene('act3_creature_revealed'); scene._onDialogueClosed({ dialogueId: 'act3_creature_revealed' });
    scene._handleTwoLeonsScene(); assert.equal(launches.at(-1).data.dialogueId, 'act4_two_leons_intro');
    scene._resolveTwoLeonsChoice(true); scene._onDialogueClosed({ dialogueId: 'act4_real_leon_identified' });
    timers.shift()(); timers.shift()(); timers.shift()(); assert.equal(launches.at(-1).key, CONFIG.SCENES.COMBAT);
    // With the permanent knife, ammunition exhaustion cannot block the final fight.
    const combat = new C(); combat.init(launches.at(-1).data);
    combat._showCombatMessage = () => {}; combat._enemyShakeEffect = () => {}; combat._updateEnemyHpDisplay = () => {};
    combat.time = { delayedCall: (ms, fn) => timers.push(fn) };
    combat._endCombat = victory => scene._onCombatFinished({ victory, enemyId: combat._enemyId, isBoss: true, drops: [] });
    for (let i = 0; i < 1000 && !combat._victory; i++) combat._fireWeapon();
    assert.equal(combat._victory, true); assert.equal(combat._enemyId, 'creature_p2');
    timers.shift()(); timers.shift()(); assert.equal(launches.at(-1).data.dialogueId, 'act4_lucia_saves_leon');
    scene._onDialogueClosed({ dialogueId: 'act4_lucia_saves_leon' }); timers.shift()();
    assert.equal(S.getFlag(CONFIG.FLAGS.GAME_COMPLETE), true); assert.equal(launches.at(-1).key, CONFIG.SCENES.ENDING);
});

test('all key types unlock their actual connections and remain reusable', () => {
    const { SaveSystem: S, InventorySystem: I, GameScene: G, MAPS, CONFIG } = game(); S.newGame();
    for (const key of ['key_cabin', 'key_cargo', 'key_lab']) I.addItem(key);
    S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND); S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
    const scene = new G(); scene.time = { now: 10000 }; scene._showFloatingMessage = () => {};
    let transitions = 0; scene._transitionToRoom = () => transitions++;
    for (const room of Object.values(MAPS)) for (const conn of Object.values(room.connections || {}).filter(c => c.locked)) {
        scene._currentRoomId = room.id;
        scene._player = { x: conn.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, y: conn.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 };
        scene._checkRoomTransitions();
        assert.equal(S.isDoorOpen(conn.doorId), true, conn.doorId);
        assert.equal(I.hasItem(conn.keyId), true, conn.keyId);
    }
    assert.equal(transitions, Object.values(MAPS).flatMap(r => Object.values(r.connections || {}).filter(c => c.locked)).length);
});

test('all dialogue scripts resolve to readable lines across party, document and weapon states', () => {
    const { SaveSystem: S, InventorySystem: I, DialogueScene: D, DIALOGUES, MAPS, CONFIG } = game();
    const scripts = Object.entries(DIALOGUES).filter(([key, value]) => Array.isArray(value) && key !== 'save_room_quotes');
    const observedConditions = new Set();
    for (let party = 0; party < 4; party++) for (let docs = 0; docs < 8; docs++) for (let gun = 0; gun < 4; gun++) {
        const state = S.newGame();
        S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND, !!(party & 1)); S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED, !!(party & 2));
        ['note_leon', 'lucia_letter', 'umbrella_memo'].forEach((id, bit) => S.setFlag(`file_read_${id}`, !!(docs & (1 << bit))));
        if (gun === 1) I.addItem('handgun');
        if (gun === 2) state.itemBox.push({ id: 'handgun', qty: 1 });
        if (gun === 3) {
            const index = MAPS.cabin_102.objects.findIndex(o => o.itemId === 'handgun');
            S.markItemCollected('cabin_102', index);
        }
        const scene = new D();
        for (const [id, script] of scripts) {
            for (const line of script) assert.equal(typeof line.text, 'string', `${id}: malformed dialogue`);
            const lines = scene._prepareLines(script);
            assert.ok(lines.length > 0, `${id}: empty dialogue`);
            for (const line of lines) {
                assert.ok(line.text.length > 0, `${id}: empty text`);
                assert.equal(typeof line.speaker, 'string', id);
                if (line.condition) observedConditions.add(line.condition);
            }
        }
    }
    for (const [, script] of scripts) for (const line of script) if (line.condition)
        assert.ok(observedConditions.has(line.condition), `unreachable condition: ${line.condition}`);
});

test('meeting Leon acknowledges a missing, carried, stored or discarded handgun', () => {
    const { SaveSystem: S, InventorySystem: I, DialogueScene: D, DIALOGUES, MAPS } = game(); const state = S.newGame();
    const resolve = () => new D()._prepareLines(DIALOGUES.act1_leon_first_meeting).map(line => line.text).join('\n');
    assert.match(resolve(), /I left my P226 in Cabin 102/); assert.doesNotMatch(resolve(), /among Barry's equipment/);
    I.addItem('handgun'); assert.match(resolve(), /among Barry's equipment/); assert.doesNotMatch(resolve(), /I left my P226/);
    I.depositToBox('handgun'); assert.match(resolve(), /safe-room box/); assert.doesNotMatch(resolve(), /among Barry's equipment/);
    state.itemBox = []; const index = MAPS.cabin_102.objects.findIndex(o => o.itemId === 'handgun'); S.markItemCollected('cabin_102', index);
    assert.match(resolve(), /Left it behind/); assert.doesNotMatch(resolve(), /I left my P226 in Cabin 102/);
});

test('Lucia can be met before Leon and conversations never invent absent companions', () => {
    const { SaveSystem: S, DialogueScene: D, DIALOGUES, CONFIG } = game(); S.newGame(); const scene = new D();
    for (const id of ['act2_lucia_found', 'act2_engine_room', 'act3_lab_discovery']) {
        const lines = scene._prepareLines(DIALOGUES[id]);
        assert.ok(!lines.some(line => line.speaker === 'LEON'), id);
        if (id !== 'act2_lucia_found') assert.ok(!lines.some(line => line.speaker === 'LUCIA'), id);
    }
    S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
    const meeting = scene._prepareLines(DIALOGUES.act1_leon_first_meeting).map(l => l.text).join('\n');
    assert.match(meeting, /Lucia is with me/); assert.doesNotMatch(meeting, /Last time I saw her/);
    S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND);
    const later = scene._prepareLines(DIALOGUES.act3_lab_discovery);
    assert.ok(later.some(l => l.speaker === 'LEON')); assert.ok(later.some(l => l.speaker === 'LUCIA'));
});

test('document knowledge is recorded when a file is consulted and persists across saves', () => {
    const { SaveSystem: S, DialogueScene: D, DIALOGUES } = game(); S.newGame(); const dialogue = new D();
    const lab = () => dialogue._prepareLines(DIALOGUES.act3_lab_discovery).map(l => l.text).join('\n');
    assert.doesNotMatch(lab(), /The memo calls it GENESIS/);
    dialogue.init({ fileId: 'umbrella_memo', singleText: 'memo' });
    dialogue.cameras = { main: { fadeOut: (ms, r, g, b, fn) => fn(null, 1) } }; dialogue.scene = { stop() {} };
    assert.equal(S.getFlag('file_read_umbrella_memo'), false);
    dialogue._closeDialogue(); assert.equal(S.getFlag('file_read_umbrella_memo'), true);
    assert.match(lab(), /The memo calls it GENESIS/);
    S.save(0); S.newGame(); S.load(0); assert.equal(S.getFlag('file_read_umbrella_memo'), true);
});

test('final confrontation staging uses the current weapon and requires no scripted shot', () => {
    const { SaveSystem: S, InventorySystem: I, DialogueScene: D, DIALOGUES } = game(); S.newGame(); const scene = new D();
    const action = () => scene._prepareLines(DIALOGUES.act4_two_leons_intro).find(l => l.variant === 'ready_weapon').text;
    assert.match(action(), /combat knife/);
    I.addItem('handgun'); I.equipWeapon('handgun'); assert.match(action(), /empty Handgun/);
    I.addItem('ammo_9mm'); I.reload(); assert.match(action(), /raises his Handgun/);
    S.getState().equippedWeapon = null; assert.match(action(), /hands ready/);
    assert.ok(!DIALOGUES.act4_real_leon_identified.some(l => /Barry fires/.test(l.text)));
    assert.ok(!DIALOGUES.act4_two_leons_intro.some(l => /authentication code|RPD basement/.test(l.text)));
    assert.equal(DIALOGUES.act4_two_leons_intro.at(-1).text, DIALOGUES.act4_two_leons_question[0].text);
});

test('premature revelation triggers are deferred rather than consumed', () => {
    const { SaveSystem: S, GameScene: G, CONFIG } = game(); S.newGame(); const scene = new G(); uiScene(scene);
    const launched = []; scene.scene = { launch: (key, data) => launched.push(data) };
    scene._player.x = 0; scene._player.y = 0;
    const trigger = { px: 0, py: 0, radius: 30, cutsceneId: 'act3_creature_revealed', triggered: false };
    scene._cutsceneTriggers = [trigger]; scene._bossTriggers = [];
    scene._updateProximityObjects(); assert.equal(trigger.triggered, false); assert.equal(launched.length, 0);
    assert.equal(S.getFlag(CONFIG.FLAGS.ACT3_CREATURE_SIGHTED), false);
    S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND); S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
    scene._updateProximityObjects(); assert.equal(trigger.triggered, true); assert.equal(launched[0].dialogueId, 'act3_creature_revealed');
});

test('both cargo entrances guide the player to missing companions before allowing the finale', () => {
    const { SaveSystem: S, InventorySystem: I, GameScene: G, MAPS, CONFIG } = game();
    for (const conn of Object.values(MAPS.lab_main.connections).filter(c => c.targetRoom === 'cargo_hold')) {
        S.newGame(); I.addItem('key_cargo'); const scene = new G(); uiScene(scene); scene.time.now = 10000;
        scene._currentRoomId = 'lab_main'; scene._player.x = conn.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        scene._player.y = conn.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        let message, transitions = 0; scene._showFloatingMessage = text => { message = text; };
        scene._transitionToRoom = () => transitions++; scene._animateDoorAndTransition = () => transitions++;
        scene._checkRoomTransitions(); assert.equal(transitions, 0); assert.match(message, /Find Leon/);
        S.setFlag(CONFIG.FLAGS.ACT1_LEON_FOUND); scene.time.now += 3000;
        scene._checkRoomTransitions(); assert.equal(transitions, 0); assert.match(message, /Find Lucia/);
        S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED); scene._checkRoomTransitions(); assert.equal(transitions, 1);
    }
});

test('legacy Leon recruitment flags satisfy the new story prerequisites after loading', () => {
    const { SaveSystem: S, GameScene: G, MAPS, CONFIG } = game(); S.newGame();
    const index = MAPS.restaurant_hall.objects.findIndex(o => o.npcId === 'leon');
    S.setFlag(`npc_spoken_restaurant_hall_${index}`); S.setFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED);
    const scene = new G(); scene.init({ fromSave: true });
    assert.equal(S.getFlag(CONFIG.FLAGS.ACT1_LEON_FOUND), true); assert.equal(scene._storyPartyReady(), true);
});

test('E selects the nearest pickup before scenery or a following companion', () => {
    const { GameScene: G } = game(); const scene = new G(); scene._player = { x: 0, y: 0 };
    const actor = (x, extra = {}) => ({ active: true, x, y: 0, interactRange: 64, ...extra });
    const door = actor(1, { interactType: 'door' });
    const far = actor(40, { interactType: 'item' }); const near = actor(30, { interactType: 'item' });
    const lucia = actor(5, { isFollowing: true }); scene._interactables = [door, far, near]; scene._npcs = [lucia];
    let picked, talked; scene._handleInteract = object => { picked = object; }; scene._handleNPCInteract = npc => { talked = npc; };
    scene._onPlayerInteract(); assert.equal(picked, near); assert.equal(talked, undefined);
    near.active = false; scene._onPlayerInteract(); assert.equal(picked, far);
    scene._interactables = []; scene._onPlayerInteract(); assert.equal(talked, undefined);
    scene._onCompanionTalk(); assert.equal(talked, lucia);
});

test('first meetings still use E while T only talks to the nearest following companion', () => {
    const { GameScene: G } = game(); const scene = new G(); scene._player = { x: 0, y: 0 };
    const stranger = { active: true, isFollowing: false, x: 10, y: 0, interactRange: 64 };
    const leon = { active: true, isFollowing: true, x: 20, y: 0, interactRange: 64 };
    const lucia = { active: true, isFollowing: true, x: 30, y: 0, interactRange: 64 };
    scene._npcs = [lucia, stranger, leon]; let talked; scene._handleNPCInteract = npc => { talked = npc; };
    scene._onPlayerInteract(); assert.equal(talked, stranger);
    scene._onCompanionTalk(); assert.equal(talked, leon);
    scene._isBusy = true; talked = null; scene._onCompanionTalk(); scene._onPlayerInteract(); assert.equal(talked, null);
});

test('pickup failure does not fall through to companion dialogue and prompts match selection', () => {
    const { GameScene: G, SaveSystem: S, InventorySystem: I, CONFIG } = game(); S.newGame();
    I.addItem('first_aid_spray', CONFIG.MAX_INVENTORY_SLOTS - 1);
    const scene = new G(); scene._player = { x: 0, y: 0 }; scene._showFloatingMessage = () => {};
    let prompt = false, npcPrompt = false, talked = false;
    const key = { active: true, interactType: 'item', x: 20, y: 0, interactRange: 48,
        data2: { itemId: 'key_cargo', roomId: 'engine_room_ante', idx: 5 },
        showInteractPrompt: value => { prompt = value; }, destroy() { throw Error('full inventory removed key'); } };
    const lucia = { active: true, isFollowing: true, x: 10, y: 0, interactRange: 64, showInteractPrompt: value => { npcPrompt = value; } };
    scene._interactables = [key]; scene._npcs = [lucia]; scene._handleNPCInteract = () => { talked = true; };
    scene._updateProximityObjects(); assert.equal(prompt, true); assert.equal(npcPrompt, true);
    scene._onPlayerInteract(); assert.equal(talked, false); assert.equal(I.hasItem('key_cargo'), false);
    assert.equal(!!S.isItemCollected('engine_room_ante', 5), false);
});

test('two Leons remain visually distinct and transformation completes before combat is allowed', () => {
    const { SaveSystem: S, GameScene: G } = game(); S.newGame(); const scene = new G(); uiScene(scene);
    const timers = [], animations = []; let finished = false;
    scene.time = { delayedCall: (delay, fn) => { const timer = { delay, fn, remove() {} }; timers.push(timer); return timer; } };
    scene.tweens.add = config => animations.push(config);
    scene.cameras = { main: { shake() {} } };
    scene._createTwoLeonsStage();
    const actors = scene._twoLeonsActors;
    assert.equal(actors.fake.texture, 'leon'); assert.equal(actors.real.texture, 'leon');
    assert.equal(actors.fakeLabel.text, 'LEON A'); assert.equal(actors.realLabel.text, 'LEON B');
    scene._playFalseLeonTransformation(() => { finished = true; });
    assert.equal(scene._player.locked, true); assert.equal(scene._isBusy, true);
    assert.equal(actors.monster.texture, 'creature_p1');
    assert.ok(animations.some(a => a.targets === actors.fake && a.alpha === 0));
    assert.ok(animations.some(a => a.targets === actors.monster && a.alpha === 1));
    assert.equal(finished, false); assert.equal(timers[0].delay, 2800);
    timers[0].fn(); assert.equal(finished, false); assert.equal(actors.fakeLabel.text, 'GENESIS-01');
    assert.equal(timers[1].delay, 1000); timers[1].fn(); assert.equal(finished, true);
});

test('leaving the finale cancels its animation and restores the original Leon companion', () => {
    const { GameScene: G } = game(); const scene = new G(); uiScene(scene);
    const leon = { active: true, npcId: 'leon', visible: true, setVisible(value) { this.visible = value; } };
    scene._npcs = [leon]; let removed = false; const killed = [];
    scene.time = { delayedCall: () => ({ remove: () => { removed = true; } }) };
    scene.tweens.killTweensOf = target => killed.push(target);
    scene._playFalseLeonTransformation(() => { throw Error('cancelled transformation started combat'); });
    assert.equal(leon.visible, false); const monster = scene._twoLeonsActors.monster;
    scene._clearTwoLeonsStage(); assert.equal(removed, true); assert.equal(leon.visible, true);
    assert.equal(scene._twoLeonsStage, null); assert.ok(killed.includes(monster));
    scene._clearTwoLeonsStage(); // Shutdown cleanup can safely run twice.
});

function testCompanion(NPC, scene, x, y) {
    const npc = Object.create(NPC.prototype);
    Object.assign(npc, { scene, x, y, isFollowing: true, _followSpeed: 140, _followRunSpeed: 220,
        _attackRange: 57.6, _attackDamage: 30, _attackCooldown: 0,
        body: { vx: 0, vy: 0, setVelocity(x, y) { this.vx = x; this.vy = y; } } });
    return npc;
}

test('companions navigate around a wall without crossing solid tiles', () => {
    const { NPC, MAPS, RoomNavigation: N } = game();
    const tiles = Array.from({ length: 7 }, (_, y) => Array.from({ length: 7 }, (_, x) =>
        x === 0 || y === 0 || x === 6 || y === 6 || (x === 3 && y <= 4) ? 1 : 0));
    const room = MAPS.test_route = { id: 'test_route', tileWidth: 7, tileHeight: 7, tiles, connections: {} };
    const npc = testCompanion(NPC, { _currentRoomId: room.id }, 80, 80), player = { x: 144, y: 80 };
    const path = N.findPath(room, npc.x, npc.y, player.x, player.y);
    assert.ok(path.some(p => p.y === 176), 'route must use the bottom opening');
    let arrived = false;
    for (let frame = 0; frame < 1000; frame++) {
        npc.update(frame * 16, 16, player, []);
        const x = npc.x + npc.body.vx * 0.016, y = npc.y + npc.body.vy * 0.016;
        assert.ok(N.hasLineOfSight(room, npc.x, npc.y, x, y, 10), 'movement crossed a wall');
        npc.x = x; npc.y = y;
        if (Math.hypot(npc.x - player.x, npc.y - player.y) <= 48 && N.hasLineOfSight(room, npc.x, npc.y, player.x, player.y)) { arrived = true; break; }
    }
    assert.equal(arrived, true);
});

test('walls block companion attacks and close-range enemy combat triggers', () => {
    const { NPC, Enemy, MAPS } = game();
    MAPS.test_wall = { tileWidth: 5, tileHeight: 3, connections: {}, tiles: [[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 1, 1]] };
    const npc = testCompanion(NPC, { _currentRoomId: 'test_wall' }, 60, 48);
    let damage = 0; const enemy = { alive: true, x: 100, y: 48, takeDamage: amount => { damage += amount; } };
    npc.update(1000, 16, { x: 60, y: 48 }, [enemy]); assert.equal(damage, 0);
    MAPS.test_wall.tiles[1][2] = 0; npc.update(1016, 16, { x: 60, y: 48 }, [enemy]); assert.equal(damage, 30);
    const monster = Object.create(Enemy.prototype); let combats = 0;
    Object.assign(monster, { alive: true, roomId: 'test_wall', x: 60, y: 48, speed: 40, detectionRange: 180,
        _state: 'chasing', _lastAttack: 0, body: { velocity: { x: 0 }, setVelocity() {} }, _triggerCombat: () => combats++ });
    MAPS.test_wall.tiles[1][2] = 1; monster.update(4000, 16, { x: 100, y: 48 }); assert.equal(combats, 0);
    MAPS.test_wall.tiles[1][2] = 0; monster.update(4016, 16, { x: 100, y: 48 }); assert.equal(combats, 1);
});

test('enemy death is persisted immediately and emitted only once even if its animation is interrupted', () => {
    const { Enemy, SaveSystem: S, EventSystem: E } = game(); S.newGame(); let deaths = 0;
    E.on('enemy_killed', () => deaths++);
    const enemy = Object.create(Enemy.prototype);
    Object.assign(enemy, { alive: true, roomId: 'aft_deck', enemyIndex: 1, x: 100, y: 100,
        body: { setVelocity() {} }, scene: { tweens: { add() {} } } });
    enemy.die(); assert.equal(S.isEnemyDefeated('aft_deck', 1), true); assert.equal(deaths, 1);
    enemy.scene = null; enemy.die(); assert.equal(deaths, 1);
    S.save(0); S.newGame(); S.load(0); assert.equal(S.isEnemyDefeated('aft_deck', 1), true);
});

test('overflow loot survives saving and room changes and is consumed only after successful pickup', () => {
    const { GameScene: G, SaveSystem: S, InventorySystem: I, CONFIG } = game(); S.newGame();
    I.addItem('first_aid_spray', CONFIG.MAX_INVENTORY_SLOTS - 1);
    const scene = new G(); uiScene(scene); scene._currentRoomId = 'aft_deck';
    const spawned = []; scene._spawnDroppedItem = (room, drop) => spawned.push(drop);
    scene._leaveLootOnFloor('aft_deck', 'ammo_9mm', 336, 208);
    assert.equal(S.getDroppedItems('aft_deck').length, 1); assert.equal(spawned.length, 1);
    S.save(0); S.newGame(); assert.equal(S.load(0), true);
    const drop = S.getDroppedItems('aft_deck')[0]; assert.equal(drop.itemId, 'ammo_9mm');
    let destroyed = false; const pickup = { destroy: () => { destroyed = true; } };
    scene._pickupItem(pickup, { ...drop, roomId: 'aft_deck' });
    assert.equal(destroyed, false); assert.equal(S.getDroppedItems('aft_deck').length, 1);
    I.removeItem('first_aid_spray'); scene._pickupItem(pickup, { ...drop, roomId: 'aft_deck' });
    assert.equal(destroyed, true); assert.equal(I.getItemCount('ammo_9mm'), 1);
    assert.equal(S.getDroppedItems('aft_deck').length, 0);
    assert.equal(S.getState().collectedItems.aft_deck, undefined);
    S.save(0); S.load(0); assert.equal(S.getDroppedItems('aft_deck').length, 0);
});

test('discard actions in both inventory menus require explicit confirmation and can be cancelled', () => {
    const { SaveSystem: S, InventorySystem: I, InventoryScene: Inv } = game(); S.newGame(); I.addItem('handgun');
    for (const method of ['_showActionButtons', '_showContextMenu']) {
        const scene = new Inv(); const ui = uiScene(scene); scene._detailX = 0; scene._detailY = 0; scene._detailW = 300;
        let closed = false; scene._close = () => { closed = true; };
        const menu = () => method === '_showActionButtons' ? scene[method]({ id: 'handgun' }) : scene[method](I.getInventory().findIndex(i => i.id === 'handgun'), 100, 100);
        menu(); ui.click('DISCARD'); assert.equal(I.hasItem('handgun'), true); assert.equal(closed, false);
        ui.click('CANCEL [ESC]'); assert.equal(I.hasItem('handgun'), true); assert.equal(closed, false);
        menu(); ui.click('DISCARD'); ui.click('CONFIRM DISCARD');
        assert.equal(I.hasItem('handgun'), false); assert.equal(closed, true); I.addItem('handgun');
    }
});

test('the Colt Python is obtainable and compatible with older saves of cabin 101', () => {
    const { SaveSystem: S, MAPS, InventorySystem: I } = game(); S.newGame();
    const index = MAPS.cabin_101.objects.findIndex(o => o.itemId === 'barry_revolver');
    assert.ok(index >= 6, 'append the weapon so existing object save indices remain stable');
    const state = S.getState(); state.visitedRooms.push('cabin_101'); state.collectedItems.cabin_101 = [3];
    S.save(0); S.load(0); assert.equal(!!S.isItemCollected('cabin_101', index), false);
    I.addItem('barry_revolver'); I.addItem('ammo_357'); I.equipWeapon('barry_revolver');
    assert.equal(I.getEquippedWeapon().ammo, 6);
});
