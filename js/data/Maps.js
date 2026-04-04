/**
 * Map / Room definitions for the M.S. Starlight
 *
 * Tile codes:
 * 0 = floor_metal
 * 1 = wall_metal
 * 2 = floor_carpet
 * 3 = wall_dark
 * 4 = floor_grate
 * 5 = floor_water
 * 6 = wall_pipe
 * 7 = obstacle (crate, pillar)
 * 8 = save_room floor
 * 9 = door_closed (will be replaced dynamically)
 * D = door (marker - replaced at runtime)
 *
 * Each room object:
 *   id, name, bgm, tileWidth, tileHeight, tiles (2D array), objects [], connections {}
 */
const MAPS = {

    // =========================================================
    // ACT 1
    // =========================================================
    aft_deck: {
        id: 'aft_deck',
        name: 'Aft Deck',
        act: 1,
        bgm: 'tension',
        tileWidth: 20,
        tileHeight: 15,
        ambience: 'wind_sea',
        tiles: [
            // Poupe du bateau : la coque se rétrécit vers l'arrière, mer de chaque côté
            [5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5],  // poupe (bord arrière)
            [5,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,5],  // pont s'élargit
            [5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5],  // pleine largeur
            [1,0,0,0,7,7,0,0,0,0,0,0,0,7,7,0,0,0,0,1],  // bollards d'amarrage
            [1,0,0,0,7,7,0,0,0,0,0,0,0,7,7,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0,0,0,0,1],  // ventilateurs de pont
            [1,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,7,7,0,0,0,0,0,0,0,0,0,0,0,7,7,0,0,1],  // caisses d'équipement
            [1,0,7,7,0,0,0,0,0,0,0,0,0,0,0,7,7,0,0,1],
            [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],  // porte vers l'intérieur
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'player_start', tx: 10, ty: 6 },
            { type: 'enemy', tx: 3, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 16, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 10, ty: 11, enemyId: 'zombie_sailor' },
            { type: 'item', tx: 5, ty: 11, itemId: 'ammo_9mm' },
            { type: 'examine', tx: 2, ty: 3, text: 'examine.overturned_table' },
            { type: 'examine', tx: 17, ty: 3, text: 'examine.blood_on_wall' },
            { type: 'trigger', tx: 10, ty: 1, eventId: 'prologue_arrived', once: true },
        ],
        connections: {
            south: { tx: 9, ty: 13, targetRoom: 'deck_corridor_a', targetTx: 9, targetTy: 1 },
        },
        cutsceneOnEnter: null,
    },

    deck_corridor_a: {
        id: 'deck_corridor_a',
        name: 'Deck 3 — Corridor A',
        act: 1,
        bgm: 'exploration',
        tileWidth: 20,
        tileHeight: 12,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1],
            [1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'enemy', tx: 5, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 13, ty: 5, enemyId: 'zombie_sailor' },
            { type: 'item', tx: 5, ty: 3, itemId: 'herb_green' },
            { type: 'door', tx: 1, ty: 1, doorId: 'door_cabin_101', locked: false },
            { type: 'door', tx: 18, ty: 1, doorId: 'door_cabin_102', locked: false },
            { type: 'door', tx: 1, ty: 10, doorId: 'door_cabin_103', locked: true, keyId: 'key_cabin' },
            { type: 'note', tx: 9, ty: 5, noteId: 'note_leon' },
        ],
        connections: {
            north: { tx: 9, ty: 1, targetRoom: 'aft_deck', targetTx: 9, targetTy: 13 },
            north_west: { tx: 1, ty: 1, targetRoom: 'cabin_101', targetTx: 5, targetTy: 6 },
            north_east: { tx: 18, ty: 1, targetRoom: 'cabin_102', targetTx: 5, targetTy: 6 },
            south: { tx: 9, ty: 11, targetRoom: 'restaurant_hall', targetTx: 9, targetTy: 1 },
        },
    },

    cabin_101: {
        id: 'cabin_101',
        name: 'Cabin 101 — Safe Room',
        act: 1,
        bgm: 'safe_room',
        tileWidth: 12,
        tileHeight: 9,
        isSafeRoom: true,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,7,8,8,8,8,7,8,8,1],
            [1,8,8,7,8,8,8,8,7,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,9,8,8,8,8,8,8,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'player_start', tx: 5, ty: 5 },
            { type: 'save_point', tx: 9, ty: 3 },
            { type: 'item_box', tx: 3, ty: 3 },
            { type: 'examine', tx: 9, ty: 4, text: 'examine.typewriter' },
            { type: 'examine', tx: 6, ty: 5, text: 'examine.mirror_cabin' },
        ],
        connections: {
            north: { tx: 4, ty: 7, targetRoom: 'deck_corridor_a', targetTx: 1, targetTy: 2 },
        },
    },

    cabin_102: {
        id: 'cabin_102',
        name: 'Cabin 102',
        act: 1,
        bgm: 'exploration',
        tileWidth: 12,
        tileHeight: 9,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,7,7,2,2,2,7,7,2,1],
            [1,2,2,7,7,2,2,2,7,7,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,9,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'enemy', tx: 6, ty: 4, enemyId: 'zombie' },
            { type: 'item', tx: 9, ty: 5, itemId: 'ammo_9mm' },
            { type: 'item', tx: 2, ty: 5, itemId: 'herb_green' },
            { type: 'file', tx: 7, ty: 2, fileId: 'diary_passenger' },
            { type: 'examine', tx: 7, ty: 2, text: 'examine.overturned_table' },
        ],
        connections: {
            north: { tx: 4, ty: 7, targetRoom: 'deck_corridor_a', targetTx: 18, targetTy: 2 },
        },
    },

    // =========================================================
    // ACT 2
    // =========================================================
    restaurant_hall: {
        id: 'restaurant_hall',
        name: 'Main Restaurant',
        act: 2,
        bgm: 'tension',
        tileWidth: 24,
        tileHeight: 18,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,7,7,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,9,0,1],
            [1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'player_start', tx: 11, ty: 2 },
            { type: 'enemy', tx: 4, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 12, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 19, ty: 8, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 6, ty: 12, enemyId: 'zombie_dog' },
            { type: 'enemy', tx: 16, ty: 12, enemyId: 'zombie_sailor' },
            { type: 'item', tx: 21, ty: 5, itemId: 'herb_green' },
            { type: 'item', tx: 2, ty: 12, itemId: 'ammo_9mm' },
            { type: 'npc_trigger', tx: 5, ty: 16, npcId: 'leon', dialogueId: 'act1_leon_first_meeting', once: true },
            { type: 'examine', tx: 5, ty: 3, text: 'examine.blood_on_wall' },
        ],
        connections: {
            north: { tx: 11, ty: 1, targetRoom: 'deck_corridor_a', targetTx: 9, targetTy: 11 },
            south: { tx: 11, ty: 17, targetRoom: 'lower_corridor_a', targetTx: 11, targetTy: 1 },
            east: { tx: 22, ty: 14, targetRoom: 'kitchen', targetTx: 1, targetTy: 5 },
            west: { tx: 4, ty: 14, targetRoom: 'bar', targetTx: 8, targetTy: 5 },
        },
    },

    kitchen: {
        id: 'kitchen',
        name: 'Kitchen — Safe Room',
        act: 2,
        bgm: 'safe_room',
        tileWidth: 14,
        tileHeight: 10,
        isSafeRoom: true,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,8,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,7,7,7,8,8,8,8,7,7,7,8,1],
            [1,8,7,7,7,8,8,8,8,7,7,7,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,8,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,9,8,8,8,8,8,8,8,8,8,8,8,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'save_point', tx: 10, ty: 3 },
            { type: 'item_box', tx: 2, ty: 5 },
            { type: 'item', tx: 6, ty: 6, itemId: 'herb_green' },
            { type: 'item', tx: 7, ty: 6, itemId: 'herb_red' },
            { type: 'item', tx: 11, ty: 6, itemId: 'first_aid_spray' },
        ],
        connections: {
            west: { tx: 1, ty: 8, targetRoom: 'restaurant_hall', targetTx: 22, targetTy: 14 },
        },
    },

    bar: {
        id: 'bar',
        name: 'Ship Bar',
        act: 2,
        bgm: 'exploration',
        tileWidth: 14,
        tileHeight: 10,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,7,7,7,7,7,7,7,7,7,7,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,7,2,2,2,2,7,2,2,2,1],
            [1,2,2,2,7,2,2,2,2,7,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,9,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'enemy', tx: 6, ty: 5, enemyId: 'zombie' },
            { type: 'enemy', tx: 3, ty: 6, enemyId: 'zombie_sailor' },
            { type: 'item', tx: 11, ty: 5, itemId: 'antibiotic' },
            { type: 'file', tx: 5, ty: 2, fileId: 'log_captain' },
        ],
        connections: {
            east: { tx: 9, ty: 8, targetRoom: 'restaurant_hall', targetTx: 4, targetTy: 14 },
        },
    },

    lower_corridor_a: {
        id: 'lower_corridor_a',
        name: 'Lower Deck — Corridor',
        act: 2,
        bgm: 'tension',
        tileWidth: 20,
        tileHeight: 8,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
            [6,0,0,7,7,0,0,0,0,0,0,0,0,0,7,7,0,0,0,6],
            [6,0,0,7,7,0,0,0,0,0,0,0,0,0,7,7,0,0,0,6],
            [6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'enemy', tx: 5, ty: 3, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 14, ty: 3, enemyId: 'licker' },
            { type: 'item', tx: 17, ty: 1, itemId: 'ammo_9mm' },
            { type: 'trigger', tx: 10, ty: 4, eventId: 'act2_licker_warning', once: true },
        ],
        connections: {
            north: { tx: 11, ty: 1, targetRoom: 'restaurant_hall', targetTx: 11, targetTy: 17 },
            south: { tx: 9, ty: 7, targetRoom: 'engine_room_ante', targetTx: 9, targetTy: 1 },
        },
    },

    engine_room_ante: {
        id: 'engine_room_ante',
        name: 'Engine Room — Antechamber',
        act: 2,
        bgm: 'tension',
        tileWidth: 16,
        tileHeight: 12,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,7,7,4,4,4,4,4,4,4,4,7,7,4,1],
            [1,4,7,7,4,4,4,4,4,4,4,4,7,7,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,7,4,4,4,4,4,4,4,4,4,4,7,4,1],
            [1,4,7,4,4,4,4,4,4,4,4,4,4,7,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,9,4,4,4,4,4,4,4,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'player_start', tx: 8, ty: 2 },
            { type: 'enemy', tx: 4, ty: 6, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 11, ty: 6, enemyId: 'zombie_dog' },
            { type: 'item', tx: 13, ty: 2, itemId: 'ammo_12g' },
            { type: 'item', tx: 2, ty: 8, itemId: 'herb_green' },
            { type: 'cutscene_trigger', tx: 8, ty: 5, cutsceneId: 'act2_engine_room', once: true },
            { type: 'npc', tx: 7, ty: 8, npcId: 'lucia_first_meeting', dialogueId: 'act2_lucia_found', once: true },
        ],
        connections: {
            north: { tx: 7, ty: 1, targetRoom: 'lower_corridor_a', targetTx: 9, targetTy: 7 },
            south: { tx: 7, ty: 11, targetRoom: 'engine_room', targetTx: 7, targetTy: 1 },
        },
    },

    engine_room: {
        id: 'engine_room',
        name: 'Engine Room',
        act: 2,
        bgm: 'tension',
        tileWidth: 22,
        tileHeight: 18,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,6,6,6,4,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,4,1],
            [1,6,6,6,4,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,5,5,5,5,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,5,5,5,5,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,9,4,4,4,4,4,4,4,4,4,4,4,9,4,4,4,4,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'enemy', tx: 5, ty: 8, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 15, ty: 8, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 10, ty: 12, enemyId: 'lurker', waterTile: true },
            { type: 'enemy', tx: 8, ty: 6, enemyId: 'zombie_dog' },
            { type: 'item', tx: 19, ty: 5, itemId: 'shotgun' },
            { type: 'item', tx: 2, ty: 15, itemId: 'ammo_12g' },
            { type: 'examine', tx: 10, ty: 8, text: 'examine.engine_room_console' },
            { type: 'locked_door', tx: 16, ty: 16, doorId: 'engine_cargo_door', keyId: 'key_cargo', targetRoom: 'storage_a' },
        ],
        connections: {
            north: { tx: 4, ty: 1, targetRoom: 'engine_room_ante', targetTx: 7, targetTy: 11 },
            west: { tx: 4, ty: 16, targetRoom: 'storage_a', targetTx: 8, targetTy: 1 },
            east: { tx: 16, ty: 16, targetRoom: 'storage_b', targetTx: 1, targetTy: 5, locked: true, keyId: 'key_cargo' },
        },
    },

    // =========================================================
    // ACT 3
    // =========================================================
    storage_a: {
        id: 'storage_a',
        name: 'Storage Room A',
        act: 3,
        bgm: 'exploration',
        tileWidth: 14,
        tileHeight: 10,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,7,7,0,0,0,0,7,7,0,0,0,1],
            [1,0,7,7,0,0,0,0,7,7,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,7,7,0,0,0,0,7,7,0,0,0,1],
            [1,0,7,7,0,0,0,0,7,7,0,0,0,1],
            [1,0,0,0,9,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'item', tx: 2, ty: 4, itemId: 'ammo_9mm' },
            { type: 'item', tx: 10, ty: 4, itemId: 'herb_green' },
            { type: 'item', tx: 11, ty: 7, itemId: 'antibiotic' },
            { type: 'file', tx: 2, ty: 2, fileId: 'umbrella_memo' },
            { type: 'examine', tx: 8, ty: 2, text: 'examine.umbrella_container' },
        ],
        connections: {
            north: { tx: 8, ty: 1, targetRoom: 'engine_room', targetTx: 4, targetTy: 16 },
            south_east: { tx: 12, ty: 8, targetRoom: 'lab_corridor', targetTx: 1, targetTy: 5, locked: true, keyId: 'key_lab' },
        },
    },

    storage_b: {
        id: 'storage_b',
        name: 'Storage Room B',
        act: 3,
        bgm: 'exploration',
        tileWidth: 12,
        tileHeight: 10,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,7,7,7,0,0,0,0,0,0,1],
            [1,0,7,7,7,0,0,7,7,0,0,1],
            [1,0,0,0,0,0,0,7,7,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,9,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'item', tx: 8, ty: 2, itemId: 'ammo_12g' },
            { type: 'item', tx: 4, ty: 6, itemId: 'key_lab' },
            { type: 'item', tx: 9, ty: 6, itemId: 'first_aid_spray' },
            { type: 'examine', tx: 8, ty: 3, text: 'examine.umbrella_container_open' },
        ],
        connections: {
            west: { tx: 1, ty: 8, targetRoom: 'engine_room', targetTx: 16, targetTy: 16 },
        },
    },

    lab_corridor: {
        id: 'lab_corridor',
        name: 'Hidden Laboratory — Corridor',
        act: 3,
        bgm: 'tension',
        tileWidth: 16,
        tileHeight: 8,
        tiles: [
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3],
            [3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,3,3,3,3,3,3,9,3,3,3,3,3,3,3,3],
        ],
        objects: [
            { type: 'enemy', tx: 6, ty: 2, enemyId: 'licker' },
            { type: 'item', tx: 12, ty: 2, itemId: 'ammo_9mm' },
            { type: 'item', tx: 3, ty: 5, itemId: 'herb_mixed' },
            { type: 'cutscene_trigger', tx: 8, ty: 3, cutsceneId: 'act3_lab_discovery', once: true },
        ],
        connections: {
            west: { tx: 1, ty: 5, targetRoom: 'storage_a', targetTx: 12, targetTy: 8 },
            south: { tx: 7, ty: 7, targetRoom: 'lab_main', targetTx: 8, targetTy: 1 },
        },
    },

    lab_main: {
        id: 'lab_main',
        name: 'Hidden Laboratory',
        act: 3,
        bgm: 'tension',
        tileWidth: 20,
        tileHeight: 16,
        tiles: [
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,7,7,0,0,7,7,0,0,0,0,7,7,0,0,7,7,0,3],
            [3,0,7,7,0,0,7,7,0,0,0,0,7,7,0,0,7,7,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,3],
            [3,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,7,7,0,0,7,7,0,0,0,0,7,7,0,0,7,7,0,3],
            [3,0,7,7,0,0,7,7,0,0,0,0,7,7,0,0,7,7,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
            [3,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,3],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        ],
        objects: [
            { type: 'enemy', tx: 5, ty: 5, enemyId: 'zombie_sailor' },
            { type: 'enemy', tx: 14, ty: 5, enemyId: 'licker' },
            { type: 'enemy', tx: 10, ty: 10, enemyId: 'zombie_dog' },
            { type: 'item', tx: 17, ty: 3, itemId: 'ammo_9mm' },
            { type: 'item', tx: 2, ty: 11, itemId: 'herb_mixed' },
            { type: 'file', tx: 10, ty: 7, fileId: 'lucia_letter' },
            { type: 'npc', tx: 10, ty: 6, npcId: 'lucia_lab', dialogueId: 'act2_lucia_found', once: true, condition: 'lucia_not_found' },
            { type: 'cutscene_trigger', tx: 10, ty: 8, cutsceneId: 'act3_creature_revealed', once: true },
            { type: 'locked_door', tx: 16, ty: 14, keyId: 'key_cargo', targetRoom: 'cargo_hold' },
        ],
        connections: {
            north: { tx: 8, ty: 1, targetRoom: 'lab_corridor', targetTx: 8, targetTy: 7 },
            south: { tx: 3, ty: 14, targetRoom: 'cargo_hold', targetTx: 5, targetTy: 1, locked: true, keyId: 'key_cargo' },
            south_east: { tx: 16, ty: 14, targetRoom: 'cargo_hold', targetTx: 14, targetTy: 1 },
        },
    },

    // =========================================================
    // ACT 4 — FINAL AREAS
    // =========================================================
    cargo_hold: {
        id: 'cargo_hold',
        name: 'Cargo Hold',
        act: 4,
        bgm: 'combat',
        tileWidth: 22,
        tileHeight: 20,
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,7,7,7,7,4,4,4,4,4,4,4,4,4,4,7,7,7,7,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,7,7,4,4,4,4,4,4,4,4,4,4,4,4,4,7,7,4,4,1],
            [1,4,7,7,4,4,4,4,4,4,4,4,4,4,4,4,4,7,7,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        objects: [
            { type: 'player_start', tx: 11, ty: 3 },
            { type: 'item', tx: 2, ty: 16, itemId: 'ammo_12g' },
            { type: 'item', tx: 19, ty: 16, itemId: 'ammo_9mm' },
            { type: 'item', tx: 11, ty: 15, itemId: 'first_aid_spray' },
            { type: 'examine', tx: 3, ty: 2, text: 'examine.umbrella_container_open' },
            { type: 'boss_trigger', tx: 11, ty: 10, bossId: 'creature_p1', cutsceneId: 'act3_creature_revealed', once: true },
            { type: 'cutscene_trigger', tx: 11, ty: 6, cutsceneId: 'act4_two_leons_intro', once: true, condition: 'act3_creature_sighted' },
        ],
        connections: {
            north: { tx: 5, ty: 1, targetRoom: 'lab_main', targetTx: 3, targetTy: 14 },
        },
    },
};

// Room order for progression tracking
const ROOM_ORDER = [
    'aft_deck',
    'deck_corridor_a',
    'cabin_101',
    'cabin_102',
    'restaurant_hall',
    'kitchen',
    'bar',
    'lower_corridor_a',
    'engine_room_ante',
    'engine_room',
    'storage_a',
    'storage_b',
    'lab_corridor',
    'lab_main',
    'cargo_hold',
];
