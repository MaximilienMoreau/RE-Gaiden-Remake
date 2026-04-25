# Resident Evil Gaiden — Remake

A fan-made remake of the 2001 Game Boy Color game *Resident Evil Gaiden*, built in Phaser 3 with vanilla JavaScript. No build tools, no external assets — everything is generated in code.

---

## Lore

| Original (GBC, 2001) | This Remake |
|---|---|
| Leon is an RPD officer | Leon is a **USSTRATCOM field agent** |
| Set during Raccoon City | Set **September 2002**, post-Raccoon City |
| Ship: ocean liner | Ship: **M.S. Starlight** (luxury cruise liner) |
| B.O.W. creature | **GENESIS-01 / "The Creature"** — Umbrella adaptive mimicry project |
| Barry Burton (S.T.A.R.S.) | Barry: former S.T.A.R.S., now **Anti-Umbrella clandestine operative** |

### Story — 4 Acts

- **Act 1 — Arrival**: Barry arrives aboard the Starlight during a full outbreak. Meets Leon.
- **Act 2 — The Search**: Find Lucia. Fight through the restaurant, engine room, and cargo hold.
- **Act 3 — The Lab**: Discover Umbrella's hidden laboratory. Uncover The Creature's origin.
- **Act 4 — Two Leons**: The creature can copy people. Barry must identify the real Leon. Final boss.

---

## How to Run

Open `index.html` in a browser (Chrome or Firefox). Requires an internet connection to load Phaser 3 from CDN.

```
# No install, no build step. Just open:
index.html
```

---

## Controls

| Key | Action |
|---|---|
| `WASD` / Arrow keys | Move |
| `SHIFT` | Run |
| `E` | Interact / Pick up |
| `I` | Inventory |
| `R` | Reload weapon |
| `SPACE` / `ENTER` | Advance dialogue |
| `ESC` | Skip dialogue |

---

## Tech Stack

| | |
|---|---|
| **Engine** | Phaser 3.60 (CDN) |
| **Language** | Vanilla JavaScript (no build tools) |
| **Graphics** | Procedurally generated via Phaser Graphics API |
| **Audio** | Web Audio API — synthesized music & SFX, no audio files |
| **Save system** | `localStorage` |

---

## Project Structure

```
index.html
style.css
js/
├── Config.js                  — Global constants (tile size, speeds, scene keys, flags)
├── main.js                    — Phaser game init, scene registration
│
├── utils/
│   ├── AssetGenerator.js      — All sprites & textures drawn in code
│   └── AudioSynth.js          — Procedural BGM (7 tracks) + sound effects
│
├── data/
│   ├── Items.js               — Item definitions (weapons, heals, keys, files)
│   ├── Enemies.js             — Enemy stats and behavior configs
│   ├── Maps.js                — 15 rooms: tiles, objects, connections, doors
│   └── Dialogues.js           — All story dialogue and cutscene scripts
│
├── systems/
│   ├── EventSystem.js         — Global event bus (emit/on/off)
│   ├── SaveSystem.js          — Save/load via localStorage, flags, door states
│   └── InventorySystem.js     — Item management, weapon equip, combining
│
├── entities/
│   ├── Player.js              — Barry Burton: movement, input, flashlight, physics
│   ├── Enemy.js               — Enemy AI: patrol, aggro, combat trigger
│   ├── NPC.js                 — NPCs: dialogue, companion follow behavior
│   └── Interactable.js        — Items, doors, save points, examine objects
│
└── scenes/
    ├── BootScene.js           — Asset generation on startup
    ├── TitleScene.js          — Main menu
    ├── PrologueScene.js       — Opening cinematic text
    ├── GameScene.js           — Main exploration (room loading, transitions, triggers)
    ├── HUDScene.js            — Overlay HUD (HP, weapon, status)
    ├── CombatScene.js         — Turn-based combat with oscillating reticle
    ├── DialogueScene.js       — Dialogue/cutscene overlay with typewriter effect
    ├── InventoryScene.js      — Inventory grid, item actions (use, equip, read, combine)
    ├── GameOverScene.js       — Death screen
    └── EndingScene.js         — Ending sequence
```

---

## Rooms (Maps.js)

| Room ID | Name | Act |
|---|---|---|
| `aft_deck` | Aft Deck | 1 |
| `deck_corridor_a` | Deck 3 — Corridor A | 1 |
| `cabin_101` | Cabin 101 — Safe Room | 1 |
| `cabin_102` | Cabin 102 | 1 |
| `cabin_103` | Cabin 103 | 1 |
| `restaurant_hall` | Restaurant & Dance Hall | 2 |
| `kitchen` | Kitchen — Safe Room | 2 |
| `bar` | Bar & Lounge | 2 |
| `lower_corridor_a` | Lower Deck — Corridor | 2 |
| `engine_room_ante` | Engine Room — Antechamber | 2 |
| `engine_room` | Engine Room | 2 |
| `storage_a` | Cargo Storage A — Safe Room | 3 |
| `storage_b` | Cargo Storage B | 3 |
| `lab_corridor` | Umbrella Laboratory — Corridor | 3 |
| `cargo_hold` | Main Cargo Hold | 4 |

---

## Music

All BGM is synthesized procedurally. Each track is a function in `AudioSynth.js`:

| Type key | Used in | Style |
|---|---|---|
| `title` | Title screen | Slow ominous drone |
| `safe_room` | Cabin 101, Kitchen, Storage A | Calm pentatonic melody |
| `exploration` | Deck corridors | Low ambient pulse |
| `tension` | Deck, engine rooms | Dissonant, fast |
| `combat` | All combat encounters | Fast staccato industrial |
| `boss` | Boss fights | Layered, intense |
| `ending` | Ending sequence | Ambient chord |

Each room's BGM is set via the `bgm:` property in `Maps.js`.

---

## Adding Content

### New room
Add an entry to `MAPS` in `Maps.js` with `tiles`, `objects`, and `connections`. Connect it from another room via its `connections` object.

### New item
Add an entry to `ITEMS` in `Items.js`. Supported types: `weapon`, `heal`, `key`, `file`, `ammo`.

### New dialogue
Add an entry to `DIALOGUES` in `Dialogues.js` as an array of `{ speaker, text, style? }` objects.

### New BGM track
Add a `_bgmMyTrack()` method to `AudioSynth`, register it in `playBgm()`, then use the key name in a room's `bgm:` field.
