# Resident Evil Gaiden Remake

A fan-made remake of the 2001 Game Boy Color game *Resident Evil Gaiden*, built in Phaser 3 with vanilla JavaScript.

## Lore

| Original (GBC, 2001) | This Remake |
|---|---|
| Leon is an RPD officer | Leon is a **USSTRATCOM field agent** |
| Set during Raccoon City | Set **September 2002**, post-Raccoon City |
| Ship: ocean liner | Ship: **M.S. Starlight** (luxury cruise liner) |
| B.O.W. creature | **GENESIS-01 / "The Creature"** — Umbrella adaptive mimicry project |
| Barry Burton (S.T.A.R.S.) | Barry: former S.T.A.R.S., now **Anti-Umbrella clandestine operative** |

### Story — 4 Acts

- **Act 1: Arrival**: Barry lands on the Starlight during a full outbreak. Searches the passenger decks, meets Leon.
- **Act 2: The Search**: Descend to the lower decks. Find Lucia in the engine room. Fight through the restaurant and engineering corridors.
- **Act 3: The Lab**: Discover Umbrella's hidden laboratory. Uncover The Creature's origin and its terrifying ability.
- **Act 4: Two Leons**: The Creature has copied Leon. Barry must identify the real one — then face the final boss.

---

## How to Run

Open `index.html` in a browser (Chrome or Firefox). Requires an internet connection to load Phaser 3 from CDN.

```
# No install, no build step. Just open:
index.html
```

---

## Controls

### Exploration

| Key | Action |
|---|---|
| `WASD` / Arrow keys | Move |
| `SHIFT` | Run |
| `E` | Interact / Pick up item / Talk to NPC |
| `I` | Open inventory |
| `R` | Reload weapon |
| `SPACE` / `ENTER` | Advance dialogue |
| `ESC` | Skip dialogue / cutscene |

### Combat

Combat triggers automatically when Barry gets close to an enemy. A targeting reticle oscillates horizontally — time your shot for maximum damage.

| Key | Action |
|---|---|
| `SPACE` / `F` | **Fire** (or **Dodge** if an attack warning is flashing) |
| `H` | Use best available heal item (spray > mixed herb > green herb) |

**Hit zones:**
- Center (green) → **Critical hit** — ×3 damage
- Near center (yellow) → **Hit** — normal damage
- Edges (red) → **Miss** — ammo spent, no damage

**No ammo?** Barry automatically uses his **knife** (10 damage, no reticle required).

**Enemy attacks:** When the enemy flashes an attack warning, press `SPACE` / `F` within the dodge window to avoid all damage instead of firing.

### Inventory

| Action | How |
|---|---|
| Select item | Left-click a slot |
| Context menu | Right-click a slot |
| Use / Equip / Read | Click action button on the right panel |
| Combine herbs | Select one herb — a **COMBINE** button appears if the partner is in inventory |
| Close | `I` or `ESC` |

---

## Weapons & Ammo

Each ammo item in the inventory represents a **box** of rounds. The amount of rounds per box depends on the calibre:

| Ammo | Rounds per box | Weapon |
|---|---|---|
| `.357 Magnum Rounds` | 6 | Colt Python (Barry's revolver) |
| `9mm Rounds` | 15 | Handgun (SIG P226) |
| `12-Gauge Shells` | 6 | Remington M870 Shotgun |

When you equip a weapon or reload (`R`), rounds are automatically drawn from the ammo box(es) in your inventory to fill the chamber.

To **switch weapons**, select the other weapon in the inventory and click **EQUIP**. Each weapon remembers its own loaded chamber — switching away and back doesn't cost you bullets.

---

## Companions

After key story moments, Leon and Lucia join Barry and follow him through every room until the end of the game.

- **Leon** — joins after the first meeting in the restaurant hall. Attacks nearby enemies automatically.
- **Lucia** — joins after being found in the engine room antechamber (or the laboratory if not found earlier). Also attacks enemies.

Companions match Barry's walking speed and run to catch up when they fall behind.

---

## Saving

- Interact with a **typewriter** (green glow) to open the save menu.
- 3 save slots are available.
- The game displays the room name and date for each slot.
- In-game hint: `[E]` on a typewriter → select a slot → saved.

## Item Box

- Interact with an **item box** object in safe rooms to open it.
- Lists everything currently stored — click **[TAKE]** to withdraw an item into your inventory (requires a free slot).
- Item box contents persist across saves.

---

## Tech Stack

| | |
|---|---|
| **Engine** | Phaser 3.60 (CDN) |
| **Language** | Vanilla JavaScript (no build tools) |
| **Graphics** | Procedurally generated via Phaser Graphics API |
| **Audio** | Web Audio API — synthesized music & SFX, no audio files |
| **Save system** | `localStorage` (3 slots) |

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
│   ├── Maps.js                — 16 rooms: tiles, objects, connections, doors
│   └── Dialogues.js           — All story dialogue and cutscene scripts
│
├── systems/
│   ├── EventSystem.js         — Global event bus (emit/on/off)
│   ├── SaveSystem.js          — Save/load via localStorage, flags, door states
│   └── InventorySystem.js     — Item management, weapon equip, reload, combining
│
├── entities/
│   ├── Player.js              — Barry Burton: movement, input, flashlight, physics
│   ├── Enemy.js               — Enemy AI: patrol, aggro, combat trigger
│   ├── NPC.js                 — NPCs: dialogue, companion follow & wall collision
│   └── Interactable.js        — Items, doors, save points, examine objects
│
└── scenes/
    ├── BootScene.js           — Asset generation on startup
    ├── TitleScene.js          — Main menu (new game, load, options)
    ├── PrologueScene.js       — Opening cinematic text
    ├── GameScene.js           — Main exploration (rooms, transitions, triggers, HUD)
    ├── HUDScene.js            — Overlay HUD (HP, weapon, ammo, act indicator)
    ├── CombatScene.js         — Reticle-based combat with dodge window
    ├── DialogueScene.js       — Dialogue/cutscene overlay with typewriter effect
    ├── InventoryScene.js      — Inventory grid (use, equip, read, combine, discard)
    ├── GameOverScene.js       — Death screen with continue/title options
    └── EndingScene.js         — Ending cinematic, epilogue, credits
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
| `storage_a` | Storage Room A — Safe Room | 3 |
| `storage_b` | Storage Room B | 3 |
| `lab_corridor` | Umbrella Laboratory — Corridor | 3 |
| `lab_main` | Hidden Laboratory | 3 |
| `cargo_hold` | Main Cargo Hold | 4 |

---

## Music

All BGM is synthesized procedurally. Each track is a method in `AudioSynth.js`:

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
Add an entry to `MAPS` in `Maps.js` with `tiles`, `objects`, and `connections`. Connect it from another room via its `connections` object. Tile code `9` at a connection point renders the door passage automatically.

### New item
Add an entry to `ITEMS` in `Items.js`. Supported types: `weapon`, `heal`, `key`, `file`, `ammo`. For ammo, set `amount` to the number of bullets per inventory unit — this is used by the reload and equip logic.

### New enemy
Add an entry to `ENEMIES` in `Enemies.js`. Set `combat.reticleSpeed` to control difficulty (higher = faster reticle), `attackDamage` and `attackRate` for the enemy's counter-attack rhythm.

### New dialogue
Add an entry to `DIALOGUES` in `Dialogues.js` as an array of `{ speaker, text, style? }` objects. Supported styles: `system`, `highlight`, `red`, `dim`, `action`, `examine`.

### New BGM track
Add a `_bgmMyTrack()` method to `AudioSynth`, register it in `playBgm()`, then reference the key name in a room's `bgm:` field.
