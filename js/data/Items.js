/**
 * Item definitions
 */
const ITEMS = {
    // Weapons
    HANDGUN: {
        id: 'handgun',
        name: 'Handgun',
        desc: 'Standard-issue SIG P226. Reliable and accurate. Leon\'s sidearm.',
        type: 'weapon',
        subtype: 'gun',
        ammoType: 'ammo_9mm',
        ammoCapacity: 15,
        damage: 30,
        icon: 'item_handgun',
        size: [2, 1],
        stackable: false,
        examineText: 'A SIG Sauer P226. Chambered in 9mm. Carries 15 rounds. Standard USSTRATCOM issue sidearm. The grip bears a subtle "L.K." scratch — Leon\'s mark.',
    },
    SHOTGUN: {
        id: 'shotgun',
        name: 'Remington M870',
        desc: 'Pump-action shotgun. Devastating at close range.',
        type: 'weapon',
        subtype: 'gun',
        ammoType: 'ammo_12g',
        ammoCapacity: 6,
        damage: 90,
        icon: 'item_shotgun',
        size: [3, 1],
        stackable: false,
        examineText: 'A Remington 870 pump-action. Found aboard the Starlight. Whatever Barry was carrying, he left this behind. Good thing.',
    },

    KNIFE: {
        id: 'knife',
        name: 'Couteau de combat',
        desc: 'Couteau tactique de Barry. Corps à corps uniquement.',
        type: 'weapon',
        subtype: 'melee',
        damage: 10,
        icon: 'item_knife',
        size: [1, 1],
        stackable: false,
        examineText: 'Un couteau tactique militaire. Lame courte, acier inoxydable. Efficace uniquement à bout portant. Dernier recours quand les munitions manquent.',
    },

    BARRY_REVOLVER: {
        id: 'barry_revolver',
        name: 'Colt Python .357',
        desc: 'Le révolver de Barry. Puissant et fiable. Six coups.',
        type: 'weapon',
        subtype: 'gun',
        ammoType: 'ammo_357',
        ammoCapacity: 6,
        damage: 45,
        icon: 'item_barry_revolver',
        size: [2, 1],
        stackable: false,
        examineText: 'Un Colt Python .357 Magnum. Usé par des années de service. "B.B." est gravé sur la crosse. L\'arme de signature de Barry — et elle tire toujours comme au premier jour.',
    },

    // Ammo
    AMMO_357: {
        id: 'ammo_357',
        name: 'Balles .357 Magnum',
        desc: 'Munitions pour révolver. 6 cartouches par chargeur rapide.',
        type: 'ammo',
        amount: 6,
        icon: 'item_ammo_357',
        size: [1, 1],
        stackable: true,
        maxStack: 5,
    },
    AMMO_9MM: {
        id: 'ammo_9mm',
        name: '9mm Rounds',
        desc: 'Handgun ammunition. 15 rounds per box.',
        type: 'ammo',
        amount: 15,
        icon: 'item_ammo_9mm',
        size: [1, 1],
        stackable: true,
        maxStack: 5,
    },
    AMMO_12G: {
        id: 'ammo_12g',
        name: '12-Gauge Shells',
        desc: 'Shotgun shells. 6 rounds per box.',
        type: 'ammo',
        amount: 6,
        icon: 'item_ammo_12g',
        size: [1, 1],
        stackable: true,
        maxStack: 4,
    },

    // Healing items
    HERB_GREEN: {
        id: 'herb_green',
        name: 'Green Herb',
        desc: 'Medicinal herb. Restores a small amount of health.',
        type: 'heal',
        healAmount: 40,
        icon: 'item_herb_green',
        size: [1, 1],
        stackable: true,
        maxStack: 3,
        combinable: ['herb_red'],
        examineText: 'A medicinal herb known to have some healing effect. The smell is earthy and sharp.',
    },
    HERB_RED: {
        id: 'herb_red',
        name: 'Red Herb',
        desc: 'On its own, useless. Combined with a green herb, greatly boosts potency.',
        type: 'heal',
        healAmount: 0,
        icon: 'item_herb_red',
        size: [1, 1],
        stackable: false,
        combinable: ['herb_green'],
        examineText: 'A rare herb. Alone it has no healing properties. Combined with a green herb, the result is far more effective.',
    },
    HERB_MIXED: {
        id: 'herb_mixed',
        name: 'Mixed Herb (G+R)',
        desc: 'Green and red herbs combined. Fully restores health.',
        type: 'heal',
        healAmount: 200,
        icon: 'item_herb_mixed',
        size: [1, 1],
        stackable: false,
        examineText: 'A potent combination of green and red herbs. Smells terrible. Works miraculously.',
    },
    FIRST_AID_SPRAY: {
        id: 'first_aid_spray',
        name: 'First Aid Spray',
        desc: 'A medical aerosol that fully restores health.',
        type: 'heal',
        healAmount: 999,
        icon: 'item_faspray',
        size: [1, 1],
        stackable: false,
        examineText: 'USSTRATCOM field medical spray. Proprietary compound. Coagulates wounds instantly. Full recovery guaranteed.',
    },
    ANTIBIOTIC: {
        id: 'antibiotic',
        name: 'Antibiotic',
        desc: 'Slows virus infection progression. Use if poisoned or bitten.',
        type: 'heal',
        healAmount: 20,
        curesPoison: true,
        icon: 'item_antibiotic',
        size: [1, 1],
        stackable: true,
        maxStack: 3,
        examineText: 'Military-grade antibiotic capsule. Slows T-virus infection. Not a cure — just buys time.',
    },

    // Key items
    KEY_CABIN: {
        id: 'key_cabin',
        name: 'Cabin Passkey',
        desc: 'Magnetic keycard for passenger cabins. Coded for Deck 3.',
        type: 'key',
        icon: 'item_key_cabin',
        size: [1, 1],
        stackable: false,
        examineText: 'A magnetic keycard. "DECK 3 — CABIN ACCESS" is printed on the surface. Still active.',
    },
    KEY_CARGO: {
        id: 'key_cargo',
        name: 'Cargo Hold Key',
        desc: 'Heavy mechanical key. Opens the main cargo hold.',
        type: 'key',
        icon: 'item_key_cargo',
        size: [1, 1],
        stackable: false,
        examineText: 'A heavy steel key. "CARGO A" is stamped on the bow. Someone kept this close.',
    },
    KEY_LAB: {
        id: 'key_lab',
        name: 'Laboratory Keycard',
        desc: 'Umbrella Corporation clearance card. Opens the hidden laboratory.',
        type: 'key',
        icon: 'item_key_lab',
        size: [1, 1],
        stackable: false,
        examineText: 'An Umbrella-issue security card. Blue clearance. Level 4. The corporation is gone — but their locks remain.',
    },

    // Documents / files
    DIARY_PASSENGER: {
        id: 'diary_passenger',
        name: 'Passenger Diary',
        desc: 'A personal diary found in cabin 103.',
        type: 'file',
        icon: 'item_diary',
        size: [1, 1],
        stackable: false,
        fileContent: `PASSENGER DIARY — M. DEVEREUX

Day 1 at sea:
Wonderful crossing so far. The Starlight is everything the brochure promised. Met a charming American at dinner. Said he worked in "private security." Eyes like a man carrying the world.

Day 2:
Strange smell from the lower decks. Management assures us it is a plumbing issue. The American isn't at breakfast. A woman in the lounge is coughing badly.

Day 3:
Screaming from the corridor last night. I barricaded my door. God help us. God help us all.

The final entry ends mid-sentence. The ink is smeared.`,
    },
    LOG_CAPTAIN: {
        id: 'log_captain',
        name: "Captain's Log",
        desc: "The captain's final entries. Something went very wrong.",
        type: 'file',
        icon: 'item_diary',
        size: [1, 1],
        stackable: false,
        fileContent: `CAPTAIN'S LOG — STARLIGHT — CAPT. R. MALONE

Entry 847:
We have taken on a special cargo at the request of our charter company. Sealed containers, lower hold. I was told not to ask questions. The money was good.

Entry 848:
A passenger has been quarantined. Dr. Hayes from the ship's medical bay says it's food poisoning. I don't believe him. The passengers in adjacent cabins are reporting nightmares.

Entry 849:
Three crew members failed to report for duty this morning. I went to check on them personally. What I saw... I cannot write it. I've locked myself on the bridge. I've sent a distress signal. No response from coast guard. Someone is jamming our communications.

Entry 850:
They are at the door. I can hear them. Whatever Umbrella put in that hold — it is loose. God forgive me for accepting their money.

The log ends here.`,
    },
    UMBRELLA_MEMO: {
        id: 'umbrella_memo',
        name: 'Umbrella Internal Memo',
        desc: 'A classified memorandum. The Umbrella logo is partially obscured.',
        type: 'file',
        icon: 'item_diary',
        size: [1, 1],
        stackable: false,
        fileContent: `[CLASSIFIED — UMBRELLA CORPORATION]
[PROJECT: GENESIS — PHASE II]
[TRANSPORT MANIFEST — VESSEL: STARLIGHT]

Container REG-01 through REG-06: Standard T-virus cultures. Refrigeration required.

Container REG-07: SUBJECT ZERO. DO NOT OPEN UNDER ANY CIRCUMSTANCES.
Classification: NE-α (Non-standard Evolution, Alpha tier)
Special note: Subject Zero displays unprecedented adaptive mimicry. Ability to absorb and replicate human genetic templates confirmed. Extreme caution. Subject has demonstrated awareness of its containment situation.

IN THE EVENT OF CONTAINMENT BREACH:
Eliminate all witnesses. Destroy vessel. Report: "Mechanical failure. No survivors."

— Director Wesker, Umbrella Special Operations`,
    },
    NOTE_LEON: {
        id: 'note_leon',
        name: "Leon's Note",
        desc: 'A hastily written note. Leon\'s handwriting.',
        type: 'file',
        icon: 'item_diary',
        size: [1, 1],
        stackable: false,
        fileContent: `Barry —

If you're reading this, USSTRATCOM sent you. Good.
I've been aboard for six hours. Radio is gone. Situation is FUBAR.

The girl — Lucia — is real. Umbrella calls her Subject KD-1. Complete T-virus immunity. She is the only reason this ship exists. Keep her alive.

I last saw her near the restaurant, Level 2. She was heading for the engine room. Said she knew a service boat route to the lower decks.

Watch for the big one. I emptied half a magazine into it and it kept walking. Not a Tyrant — something different. Something that watches you back.

Don't trust anyone who looks like me.

— L`,
    },
    LUCIA_LETTER: {
        id: 'lucia_letter',
        name: "Lucia's Letter",
        desc: 'A letter written by Lucia. Trembling handwriting.',
        type: 'file',
        icon: 'item_diary',
        size: [1, 1],
        stackable: false,
        fileContent: `To whoever finds this:

My name is Lucia. I am 16 years old.

I was taken from my family three years ago by doctors who worked for Umbrella. They said I had a "rare genetic condition." They called it the Kodiak factor. It makes me immune to their viruses.

For three years I was a test subject. They took my blood. They injected me with things. They watched me survive what others didn't.

I escaped when the ship's doctor helped me. His name was Dr. Matthews. He is dead now.

I don't know why I'm immune. I don't know what they were trying to make from my blood. But if someone finds this, please — tell my mother I'm alive. Her name is Elena. She lives in Lyon, France.

I'm going to try to reach the engine room. There's a service boat there. I'll try to get off this ship.

Please find me.
— Lucia`,
    },
};
