/**
 * RE Gaiden Remake - Global Configuration
 */
const CONFIG = {
    // Display
    WIDTH: 960,
    HEIGHT: 640,

    // Tile system
    TILE_SIZE: 32,

    // Player
    PLAYER: {
        SPEED: 140,
        RUN_SPEED: 220,
        HEALTH_MAX: 200,
        STAMINA_MAX: 100,
        STAMINA_REGEN: 12,
    },

    // Camera
    CAMERA: {
        ZOOM: 1.5,
        FOLLOW_LERP: 0.08,
    },

    // Combat
    COMBAT: {
        RETICLE_BASE_SPEED: 160,   // px/sec oscillation speed
        RETICLE_VARIANCE: 0.3,     // random speed variance
        CRIT_ZONE_WIDTH: 30,       // width of critical hit zone
        GOOD_ZONE_WIDTH: 70,       // width of good hit zone
        DODGE_WINDOW: 0.35,        // seconds to dodge after attack signal
        TENSION_RAMP: 0.15,        // speed increase per enemy hurt phase
    },

    // Gameplay
    MAX_INVENTORY_SLOTS: 24,
    SAVE_SLOT_COUNT: 3,

    // Scenes
    SCENES: {
        BOOT: 'BootScene',
        TITLE: 'TitleScene',
        PROLOGUE: 'PrologueScene',
        GAME: 'GameScene',
        COMBAT: 'CombatScene',
        HUD: 'HUDScene',
        DIALOGUE: 'DialogueScene',
        INVENTORY: 'InventoryScene',
        GAME_OVER: 'GameOverScene',
        ENDING: 'EndingScene',
    },

    // Colors
    COLORS: {
        BLOOD_RED: 0xaa0000,
        DARK_RED: 0x550000,
        RUST: 0x7a3b2e,
        CONCRETE: 0x2a2a2a,
        METAL: 0x1e2430,
        SAFE_ROOM_TINT: 0x003320,
        WARNING: 0xffaa00,
        CRITICAL: 0xff3300,
        TEXT_PRIMARY: '#e0d8d0',
        TEXT_DIM: '#888880',
        TEXT_RED: '#cc2222',
        HUD_BG: 'rgba(0,0,0,0.75)',
    },

    // Game flags used by SaveSystem
    FLAGS: {
        ACT1_LEON_FOUND: 'act1_leon_found',
        ACT1_RADIO_FOUND: 'act1_radio_found',
        ACT2_LUCIA_LOCATED: 'act2_lucia_located',
        ACT2_LAB_KEY_FOUND: 'act2_lab_key_found',
        ACT3_LAB_ENTERED: 'act3_lab_entered',
        ACT3_CREATURE_SIGHTED: 'act3_creature_sighted',
        ACT4_LEON_SPLIT: 'act4_leon_split',
        ACT4_REAL_LEON_SAVED: 'act4_real_leon_saved',
        ACT4_CREATURE_DEAD: 'act4_creature_dead',
        GAME_COMPLETE: 'game_complete',
    },

    // Acts / story progression
    ACTS: {
        ACT1: 'act1',
        ACT2: 'act2',
        ACT3: 'act3',
        ACT4: 'act4',
    },

    // Debug
    DEBUG: false,
};
