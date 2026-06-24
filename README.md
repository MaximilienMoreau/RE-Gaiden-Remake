<div align="center">

```
██████╗ ███████╗███████╗██╗██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝██╔════╝██║██╔══██╗██╔════╝████╗  ██║╚══██╔══╝
██████╔╝█████╗  ███████╗██║██║  ██║█████╗  ██╔██╗ ██║   ██║
██╔══██╗██╔══╝  ╚════██║██║██║  ██║██╔══╝  ██║╚██╗██║   ██║
██║  ██║███████╗███████║██║██████╔╝███████╗██║ ╚████║   ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝

         E V I L   G A I D E N  ·  R E M A K E
```

**An unofficial fan remake of the 2001 Game Boy Color game**
*Resident Evil Gaiden* — rebuilt from scratch in Phaser 3.

![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Phaser](https://img.shields.io/badge/Phaser-3.60-8B0000?style=flat-square)
![No Build](https://img.shields.io/badge/Build_step-None-darkgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Fan_Project-555?style=flat-square)

</div>

---

## ▶ How to Run

```
1. Clone or download the repository
2. Open index.html in Chrome or Firefox
3. That's it.
```

> Requires an internet connection to load Phaser 3 from CDN. No install, no build step, no dependencies.

---

## 🎭 Story & Lore

> *September 14, 2002. Four years after Raccoon City. A luxury cruise liner drifts 200 nautical miles off the Mediterranean coast — no distress beacon, no radio contact. Umbrella's fingerprints are all over the intel. Barry Burton is activated.*

### Changes from the original (GBC, 2001)

| | Original | This Remake |
|---|---|---|
| **Protagonist** | Leon S. Kennedy (RPD) | Barry Burton (former S.T.A.R.S.) |
| **Leon's role** | Main character | Companion / missing person |
| **Timeline** | During Raccoon City | September 2002 — post-Raccoon City |
| **Ship** | Generic ocean liner | M.S. Starlight — luxury cruise liner |
| **B.O.W.** | Unnamed creature | **GENESIS-01** — adaptive mimicry project |
| **Barry's affiliation** | S.T.A.R.S. | Anti-Umbrella clandestine operative |

### Four Acts

| Act | Title | Summary |
|---|---|---|
| **I** | Arrival | Barry drops onto the Starlight mid-outbreak. Fights through passenger decks. Finds Leon. |
| **II** | The Search | Descend to the lower decks. Fight through the restaurant and engine corridors. Find Lucia. |
| **III** | The Lab | Discover Umbrella's hidden laboratory. Uncover The Creature's origin and true capability. |
| **IV** | Two Leons | The Creature has copied Leon's appearance. Barry must identify the real one — then face the final boss. |

---

## 🎮 Controls

### Exploration

| Key | Action |
|:---:|---|
| `WASD` / `↑↓←→` | Move |
| `SHIFT` | Run |
| `E` | Interact · Pick up · Talk |
| `I` | Open inventory |
| `R` | Reload weapon |
| `SPACE` / `ENTER` | Advance dialogue |
| `ESC` | Skip dialogue / cutscene |

### Combat

Combat triggers automatically when Barry gets close to an enemy. A **targeting reticle** oscillates across the enemy time your shot to land in the right zone.

| Key | Action |
|:---:|---|
| `SPACE` / `F` | **Fire** — or **Dodge** if an attack warning is active |
| `H` | Use best available heal item |

**Hit zones:**

```
 ◄──────────────────────────────────────►
 │   MISS   │  HIT  │ CRIT │  HIT  │ MISS │
 │   ×0.2   │  ×1.0 │  ×3  │  ×1.0 │ ×0.2 │
 ◄──────────────────────────────────────►
```

- **No ammo?** Barry automatically falls back to his knife (10 damage, no reticle).
- **Dodge window:** When the enemy flashes an attack warning, press `SPACE` / `F` within the window to avoid all damage instead of firing.

### Inventory

| Action | How |
|---|---|
| Select item | Left-click a slot |
| Context menu | Right-click a slot |
| Use / Equip / Read | Click the action button on the right panel |
| Combine herbs | Select a green or red herb **COMBINE** appears if the partner is in inventory |
| Close | `I` or `ESC` |

---

## 🔫 Weapons & Ammo

Each ammo item in inventory represents a **box** of rounds loaded per use:

| Ammo | Rounds / box | Weapon |
|---|:---:|---|
| `.357 Magnum Rounds` | 6 | Colt Python; Barry's signature revolver |
| `9mm Rounds` | 15 | SIG P226 Handgun; Leon's sidearm |
| `12-Gauge Shells` | 6 | Remington M870 Shotgun |

> **Switching weapons** preserves each weapon's loaded chamber — you won't lose rounds by switching away and back.

---

## 👥 Companions

After key story beats, **Leon** and **Lucia** join Barry and follow him through every room.

| Companion | Joins after… | Ability |
|---|---|---|
| **Leon Kennedy** | First meeting in the restaurant hall | Attacks nearby enemies automatically |
| **Lucia** | Found in the engine room antechamber | Attacks enemies, immune to the virus |

Companions match Barry's walking speed and sprint to catch up when they fall behind.

---

## 💾 Save & Storage

### Saving
Interact with a **typewriter** (green glow) to open the save menu. Three slots are available, each showing the room name and save date.

### Item Box
Interact with an **item box** in safe rooms to access long-term storage. Click **[TAKE]** to withdraw items (requires a free inventory slot). Contents persist across saves.

---

## 🗺 Rooms

| Room ID | Name | Act | Notes |
|---|---|:---:|---|
| `aft_deck` | Aft Deck | I | Starting area |
| `deck_corridor_a` | Deck 3 — Corridor A | I | |
| `cabin_101` | Cabin 101 | I | 🟢 Safe room |
| `cabin_102` | Cabin 102 | I | |
| `cabin_103` | Cabin 103 | I | |
| `restaurant_hall` | Restaurant & Dance Hall | II | |
| `kitchen` | Kitchen | II | 🟢 Safe room |
| `bar` | Bar & Lounge | II | |
| `lower_corridor_a` | Lower Deck — Corridor | II | |
| `engine_room_ante` | Engine Room Antechamber | II | |
| `engine_room` | Engine Room | II | |
| `storage_a` | Storage Room A | III | 🟢 Safe room |
| `storage_b` | Storage Room B | III | |
| `lab_corridor` | Umbrella Lab — Corridor | III | |
| `lab_main` | Hidden Laboratory | III | |
| `cargo_hold` | Main Cargo Hold | IV | Final area |

---

## 🎵 Music

All music is **synthesized procedurally** via the Web Audio API zero audio files.

| Key | Location | Style |
|---|---|---|
| `title` | Title screen | Slow ominous drone |
| `safe_room` | Safe rooms | Calm pentatonic melody |
| `exploration` | Deck corridors | Low ambient pulse |
| `tension` | Outdoor / engine rooms | Dissonant, fast |
| `combat` | All combat encounters | Fast staccato industrial |
| `boss` | Boss fights | Layered, intense |
| `ending` | Ending sequence | Ambient chord resolution |

---

## 🛠 Tech Stack

| | |
|---|---|
| **Engine** | Phaser 3.60 (CDN) |
| **Language** | Vanilla JavaScript — no build tools |
| **Graphics** | 100% procedural — Phaser Graphics API |
| **Audio** | Web Audio API — synthesized BGM & SFX |
| **Save system** | `localStorage` — 3 slots |

---

## 📁 Project Structure

```
index.html
style.css
js/
├── Config.js                  — Global constants (tile size, speeds, scene keys, flags)
├── main.js                    — Phaser game init & scene registration
│
├── utils/
│   ├── AssetGenerator.js      — All sprites & textures drawn in code
│   └── AudioSynth.js          — Procedural BGM (7 tracks) + SFX
│
├── data/
│   ├── Items.js               — Item definitions (weapons, heals, keys, files, ammo)
│   ├── Enemies.js             — Enemy stats, combat config, drops
│   ├── Maps.js                — 16 rooms: tiles, objects, connections, doors
│   └── Dialogues.js           — Full story dialogue and cutscene scripts
│
├── systems/
│   ├── EventSystem.js         — Global event bus (emit / on / off)
│   ├── SaveSystem.js          — Save/load via localStorage, flags, door state
│   └── InventorySystem.js     — Items, weapon equip, reload, combining, item box
│
├── entities/
│   ├── Player.js              — Barry: movement, input, flashlight, physics
│   ├── Enemy.js               — AI: patrol → aggro → chase → combat trigger
│   ├── NPC.js                 — Dialogue, companion follow, wall collision
│   └── Interactable.js        — Items, doors, save points, examine objects
│
└── scenes/
    ├── BootScene.js           — Procedural asset generation on startup
    ├── TitleScene.js          — Main menu (new game · load · options)
    ├── PrologueScene.js       — Opening cinematic text sequence
    ├── GameScene.js           — Exploration: rooms, transitions, triggers
    ├── HUDScene.js            — Overlay: HP bar, weapon, ammo, act indicator
    ├── CombatScene.js         — Reticle combat with dodge window & phases
    ├── DialogueScene.js       — Dialogue overlay with typewriter effect
    ├── InventoryScene.js      — Inventory grid: use · equip · read · combine
    ├── GameOverScene.js       — Death screen with continue / title options
    └── EndingScene.js         — Ending cinematic, epilogue, scrolling credits
```

---

## ➕ Adding Content

<details>
<summary><strong>New room</strong></summary>

Add an entry to `MAPS` in `Maps.js` with `tiles`, `objects`, and `connections`. Connect it from an existing room via its `connections` object. Tile code `9` at a connection position renders the animated door passage automatically.

</details>

<details>
<summary><strong>New item</strong></summary>

Add an entry to `ITEMS` in `Items.js`. Supported types: `weapon`, `heal`, `key`, `file`, `ammo`. For ammo, set `amount` to the number of bullets per inventory unit — this drives both the reload and equip logic.

</details>

<details>
<summary><strong>New enemy</strong></summary>

Add an entry to `ENEMIES` in `Enemies.js`. Set `combat.reticleSpeed` to control difficulty (higher = faster reticle), and `attackDamage` / `attackRate` for the enemy's counter-attack rhythm. Multi-phase bosses use `combat.phases` and `combat.nextPhase`.

</details>

<details>
<summary><strong>New dialogue</strong></summary>

Add an entry to `DIALOGUES` in `Dialogues.js` as an array of `{ speaker, text, style? }` objects. Supported styles: `system` `highlight` `red` `dim` `action` `examine`.

</details>

<details>
<summary><strong>New BGM track</strong></summary>

Add a `_bgmMyTrack()` method to `AudioSynth`, register it in `playBgm()`, then reference the key name in any room's `bgm:` field in `Maps.js`.

</details>

---

<div align="center">

*RESIDENT EVIL is a trademark of Capcom Co., Ltd.*
*This is an unofficial fan project with no commercial intent.*

</div>
