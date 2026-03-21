/**
 * All in-game dialogues, cutscene scripts, and NPC conversations.
 */
const DIALOGUES = {

    // =========================================================
    // PROLOGUE
    // =========================================================
    prologue: [
        { speaker: 'SYSTEM', text: 'September 14, 2002.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Three years after the destruction of Raccoon City.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The United States Strategic Command — USSTRATCOM —\nhas quietly expanded its biological threat division\nin the wake of the T-virus outbreak.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Their best operative:', style: 'system' },
        { speaker: 'SYSTEM', text: 'LEON SCOTT KENNEDY\nFormer R.P.D. Raccoon City — Sole Survivor\nCurrent: USSTRATCOM Field Agent — Classified', style: 'highlight' },
        { speaker: 'SYSTEM', text: 'A distress signal of unknown origin was received\nfrom the luxury cruise liner M.S. STARLIGHT,\ncurrently drifting 200 nautical miles off the coast\nof the Mediterranean.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Signal content: "OUTBREAK. ALL DEAD. GOD HELP US."', style: 'red' },
        { speaker: 'SYSTEM', text: 'USSTRATCOM intelligence suggests a person of interest\nis aboard — a young girl with a unique biological profile\ndesignated by Umbrella as Subject KD-1.\nCodename: LUCIA.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Leon was dropped by helicopter onto the Starlight\'s\naft deck at 02:14 hours.', style: 'system' },
        { speaker: 'SYSTEM', text: 'He was told to find the girl and get out.\nNo other survivors necessary.', style: 'system' },
        { speaker: 'LEON', text: 'No survivors necessary. That\'s a hell of a briefing.', portrait: 'leon' },
        { speaker: 'SYSTEM', text: 'He didn\'t follow those orders last time either.', style: 'dim' },
    ],

    // =========================================================
    // ACT 1 — FIRST MEETING WITH BARRY
    // =========================================================
    act1_barry_first_meeting: [
        { speaker: 'BARRY', text: 'You\'re Leon Kennedy. I\'d recognize those cheekbones anywhere.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Barry Burton. USSTRATCOM told me you\'d already be aboard.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'They told me you were dead. Nice to be proven wrong.', portrait: 'barry' },
        { speaker: 'LEON', text: 'I get that a lot. What\'s the situation?', portrait: 'leon' },
        { speaker: 'BARRY', text: 'The situation is a category five nightmare. Full outbreak. Every deck I\'ve been to — passengers, crew — all infected. Something tore the medical bay apart from the inside. I found this.', portrait: 'barry' },
        { speaker: 'BARRY', text: '[He holds up the Umbrella memo]', style: 'action' },
        { speaker: 'LEON', text: '...They chartered this ship for a transport run.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'And whatever was in Container REG-07 is loose. I\'ve seen it. Shot it. Didn\'t do much. Leon — it looked at me like it was thinking.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Adaptive mimicry... I\'ve seen files on something like this. Never field deployment. Where\'s the girl?', portrait: 'leon' },
        { speaker: 'BARRY', text: 'Last seen heading through the restaurant toward the lower decks. She\'s fast and she\'s smart. She left me a note. Says she\'s trying to reach a service boat in the engine room.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Then that\'s where we go.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'Together?', portrait: 'barry' },
        { speaker: 'LEON', text: 'You said you shot it and it walked away. Yeah, together.', portrait: 'leon' },
    ],

    // =========================================================
    // ACT 1 — FINDING BARRY'S NOTE (before meeting)
    // =========================================================
    act1_barry_note_found: [
        { speaker: 'LEON', text: 'Barry\'s handwriting. He made it this far.', portrait: 'leon' },
        { speaker: 'LEON', text: '"Don\'t trust anyone who looks like you." What the hell does that mean?', portrait: 'leon' },
    ],

    // =========================================================
    // ACT 2 — LUCIA FIRST MEETING
    // =========================================================
    act2_lucia_found: [
        { speaker: 'LUCIA', text: '—STAY BACK—', portrait: 'lucia' },
        { speaker: 'LEON', text: 'Easy. Easy. I\'m not one of them. My name is Leon Kennedy. USSTRATCOM. I\'m looking for you, Lucia.', portrait: 'leon' },
        { speaker: 'LUCIA', text: '...How do you know my name?', portrait: 'lucia' },
        { speaker: 'LEON', text: 'Because I was sent to find you. You\'re safe now.', portrait: 'leon' },
        { speaker: 'LUCIA', text: '[She stares at him for a long moment]', style: 'action' },
        { speaker: 'LUCIA', text: 'You survived Raccoon City.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'How do you know about that?', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'Umbrella kept files on the survivors. They talked about you. Said you were... unpredictable.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'They weren\'t wrong. Are you hurt?', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'I don\'t get hurt. Not by... this. I never have.', portrait: 'lucia' },
        { speaker: 'BARRY', text: 'That\'s the Kodiak factor. Her blood produces antibodies that neutralize the T-virus at first contact.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Which makes her the most important person on this ship.', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'I\'m not a test subject anymore.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'No. You\'re a survivor. There\'s a difference.', portrait: 'leon' },
    ],

    // =========================================================
    // ACT 2 — ENTERING THE ENGINE ROOM
    // =========================================================
    act2_engine_room: [
        { speaker: 'BARRY', text: 'Something moved down here. Not a zombie. Too fast.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Licker?', portrait: 'leon' },
        { speaker: 'BARRY', text: 'Wrong size. Wrong shape.', portrait: 'barry' },
        { speaker: 'LUCIA', text: 'It was The Creature. I saw it follow you from the restaurant.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'It\'s been tracking us?', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'No. It\'s been watching. There\'s a difference.', portrait: 'lucia' },
        { speaker: 'BARRY', text: '...She sounds like you, Leon.', portrait: 'barry' },
    ],

    // =========================================================
    // ACT 3 — DISCOVERING THE LAB
    // =========================================================
    act3_lab_discovery: [
        { speaker: 'LEON', text: 'This wasn\'t on the ship\'s manifest. A fully equipped lab. They built this in the cargo hold.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'How long do you think this has been here?', portrait: 'barry' },
        { speaker: 'LEON', text: 'Based on the equipment... at least two years. This ship was converted long before this voyage.', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'I was here. In that containment chamber.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'Lucia...', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'It\'s fine. I know what they did to me. I\'ve made peace with it. What I want to know is why that... thing... is here on the same ship.', portrait: 'lucia' },
        { speaker: 'BARRY', text: 'They were trying to synthesize your immunity. Use your antibodies as a template to create a BOW that could survive anything — any pathogen, any environment.', portrait: 'barry' },
        { speaker: 'BARRY', text: 'The Creature is the prototype. An organism designed to absorb and replicate biological information from any living host.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Absorb and replicate. Including... people.', portrait: 'leon' },
        { speaker: 'BARRY', text: '...Yeah.', portrait: 'barry' },
        { speaker: 'LUCIA', text: 'We have to destroy it. Not just escape. We have to make sure it never leaves this ship.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'Agreed.', portrait: 'leon' },
    ],

    // =========================================================
    // ACT 3 — CREATURE FIRST SIGHTING
    // =========================================================
    act3_creature_revealed: [
        { speaker: 'SYSTEM', text: '...', style: 'dim' },
        { speaker: 'BARRY', text: 'Leon. Leon get away from—', portrait: 'barry' },
        { speaker: 'SYSTEM', text: '[THE CREATURE MOVES]', style: 'red' },
        { speaker: 'LEON', text: 'BARRY! SHOOT IT—', portrait: 'leon' },
        { speaker: 'SYSTEM', text: '[GUNFIRE. DARKNESS. SILENCE.]', style: 'red' },
    ],

    // =========================================================
    // ACT 4 — THE TWO LEONS SCENE (BARRY POV)
    // =========================================================
    act4_two_leons_intro: [
        { speaker: 'BARRY', text: 'Leon? Leon, is that you?', portrait: 'barry' },
        { speaker: 'LEON_A', text: 'Barry. It got me. I barely got free. Where\'s Lucia?', portrait: 'leon' },
        { speaker: 'BARRY', text: 'She\'s... Barry stops. He hears another sound.', style: 'action' },
        { speaker: 'LEON_B', text: 'Barry. Don\'t listen to it. That isn\'t me.', portrait: 'leon' },
        { speaker: 'BARRY', text: '...Both of you look exactly like Leon. Sound like him. Walk like him.', portrait: 'barry' },
        { speaker: 'LEON_A', text: 'I\'m Leon. That thing is The Creature. It absorbed my DNA when it grabbed me in the lab corridor.', portrait: 'leon' },
        { speaker: 'LEON_B', text: 'Barry, think. Raccoon City. The RPD basement. What did I tell you when we spoke after I got out?', portrait: 'leon' },
        { speaker: 'BARRY', text: 'I never spoke to you after Raccoon City.', portrait: 'barry' },
        { speaker: 'LEON_B', text: 'Exactly. Because we\'ve never met before today. The real Leon would know that.', portrait: 'leon' },
        { speaker: 'LEON_A', text: '...', style: 'dim' },
        { speaker: 'BARRY', text: 'There\'s only one way to know for certain.', portrait: 'barry' },
        { speaker: 'BARRY', text: '[Barry raises the .357]', style: 'action' },
        { speaker: 'BARRY', text: 'USSTRATCOM authentication code. Both of you. Now.', portrait: 'barry' },
    ],

    act4_two_leons_question: [
        { speaker: 'BARRY', text: 'What was the name of the girl Leon escaped Raccoon City with?', portrait: 'barry' },
        // This is a choice scene - handled by code
    ],

    act4_real_leon_identified: [
        { speaker: 'BARRY', text: 'Claire Redfield.', portrait: 'barry' },
        { speaker: 'BARRY', text: '...You got it right.', portrait: 'barry' },
        { speaker: 'BARRY', text: 'The other one didn\'t.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Barry. It\'s okay. Do it.', portrait: 'leon' },
        { speaker: 'BARRY', text: '[Barry fires. The Creature reels — its disguise fracturing, flesh splitting, something else pushing through.]', style: 'action' },
        { speaker: 'SYSTEM', text: 'THE CREATURE HAS SHED ITS LEON FORM.', style: 'red' },
        { speaker: 'SYSTEM', text: 'FINAL ENCOUNTER INITIATED.', style: 'red' },
    ],

    act4_lucia_saves_leon: [
        { speaker: 'LUCIA', text: 'Leon. You need to hold still.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'What are you... Lucia—', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'I told you. I\'m not a test subject anymore. But maybe I can still do some good.', portrait: 'lucia' },
        { speaker: 'LEON', text: 'Your blood—', portrait: 'leon' },
        { speaker: 'LUCIA', text: 'Will neutralize whatever it injected into you when it absorbed your template. Trust me.', portrait: 'lucia' },
        { speaker: 'LEON', text: '...I trust you.', portrait: 'leon' },
        { speaker: 'SYSTEM', text: '[Lucia injects a syringe of her own blood. Leon convulses — then stills.]', style: 'action' },
        { speaker: 'LEON', text: 'I feel... I feel like myself again.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'Good. Because we need to go. This ship isn\'t going to last.', portrait: 'barry' },
    ],

    // =========================================================
    // ENDING
    // =========================================================
    ending_escape: [
        { speaker: 'SYSTEM', text: 'The Starlight began to list at 04:47 hours.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The Creature\'s destruction had ruptured critical systems in the cargo hold.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Leon, Barry, and Lucia reached the aft deck with six minutes to spare.', style: 'system' },
        { speaker: 'LEON', text: 'USSTRATCOM, this is Kennedy. We have the package. Three for extraction. Coordinates to follow.', portrait: 'leon' },
        { speaker: 'USSTRATCOM', text: 'Copy that, Kennedy. Helicopter en route. ETA four minutes.', style: 'radio' },
        { speaker: 'BARRY', text: 'Four minutes. We\'ve got four minutes watching this thing sink.', portrait: 'barry' },
        { speaker: 'LUCIA', text: 'All those people...', portrait: 'lucia' },
        { speaker: 'LEON', text: 'We couldn\'t save them. We can make sure it doesn\'t happen again.', portrait: 'leon' },
        { speaker: 'BARRY', text: 'How? Umbrella is still out there. Scattered, sure. But out there.', portrait: 'barry' },
        { speaker: 'LEON', text: 'Not for much longer.', portrait: 'leon' },
        { speaker: 'SYSTEM', text: '[The M.S. Starlight sinks beneath the waves at 05:02 hours.]', style: 'action' },
        { speaker: 'SYSTEM', text: '[With it goes GENESIS-01, the T-virus cultures, and every record of what Umbrella attempted here.]', style: 'action' },
        { speaker: 'SYSTEM', text: '[Almost every record.]', style: 'dim' },
    ],

    ending_epilogue: [
        { speaker: 'SYSTEM', text: 'EPILOGUE', style: 'title' },
        { speaker: 'SYSTEM', text: 'Lucia was taken into USSTRATCOM protective custody.\nShe agreed to assist in T-virus countermeasure research\non the condition that she be reunited with her family\nin Lyon, France.', style: 'system' },
        { speaker: 'SYSTEM', text: 'USSTRATCOM honored the agreement.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Barry Burton returned to his family in Canada.\nHe filed a detailed report on GENESIS-01.\nThe report was classified at the highest level\nand buried.', style: 'system' },
        { speaker: 'SYSTEM', text: 'He wasn\'t surprised.', style: 'dim' },
        { speaker: 'SYSTEM', text: 'Leon Scott Kennedy submitted a full account of events\naboard the Starlight to USSTRATCOM Command.\nThe account was forwarded to a classified European\noperations division — designation unknown.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The next morning, Leon received new orders.\nAnother country. Another outbreak.\nAnother name he would try to remember\nlong after the mission ended.', style: 'system' },
        { speaker: 'LEON', text: 'Raccoon City. The Starlight. Every name. Every face.\nI keep them with me. It\'s the least I can do.', portrait: 'leon' },
        { speaker: 'SYSTEM', text: 'THE END', style: 'title' },
    ],

    // =========================================================
    // NPC AMBIENT LINES
    // =========================================================
    barry_ambient: [
        'Stay close. The corridors narrow up ahead.',
        'I\'ve got 38 rounds left. Make them count.',
        'This smell... same as Raccoon City. God, I never wanted to smell this again.',
        'Jill would have something smart to say right now.',
        'Keep your eyes up. They don\'t always come at ground level.',
        'These lickers are sensitive to sound. Walk slow.',
    ],

    leon_monologue: [
        'Raccoon City was supposed to be the last time.',
        'The smell of it. You never forget it.',
        'Somewhere on this ship is the reason all these people are dead.',
        'Find the girl. Get out. Simple. Nothing is ever simple.',
        'Barry\'s holding something back. He always does when something scares him.',
    ],

    lucia_ambient: [
        'There were 12 of us in the lab. I\'m the only one left.',
        'The doctor who helped me... his name was Dr. Matthews. Please don\'t let him be forgotten.',
        'I can feel when The Creature is near. Something changes in the air.',
        'My mother\'s name is Elena. She\'s in Lyon. Please remember that.',
        'I\'m not afraid of the zombies. I just feel sorry for them.',
    ],

    // =========================================================
    // SAVE ROOM QUOTES
    // =========================================================
    save_room_quotes: [
        '"The difference between a soldier and a survivor is that a survivor knows when to rest." — Unknown',
        '"Every moment of quiet is borrowed time." — L.K.',
        '"I had a daughter about Lucia\'s age once. In another life." — B.B.',
        '"These walls remember when this was a living ship. They don\'t yet know what it\'s become." — Unknown passenger',
        '"Write it down. The names. The faces. Then get up and fight." — L.K.',
        '"Umbrella made so many of these things. How many of them are out there, scattered? How many ships haven\'t been found yet?" — B.B.',
    ],

    // =========================================================
    // EXAMINE ROOM TEXTS
    // =========================================================
    examine: {
        overturned_table: 'A dining table overturned in a struggle. The plates are still on the floor, unbroken. Whatever happened here, it happened fast.',
        blood_on_wall: 'A handprint in blood. Too high on the wall to be from someone falling. Made by someone trying to hold themselves up.',
        locked_door_cargo: 'A reinforced cargo door. "AUTHORIZED PERSONNEL ONLY." The mechanism is electronic — and damaged. A mechanical override key would open this.',
        engine_room_console: 'Main engine control panel. Non-functional. Several systems were manually disabled — deliberately. Someone wanted to make sure this ship didn\'t go anywhere.',
        umbrella_container: 'One of six sealed containers. Umbrella markings. The refrigeration unit is still running. The contents are labeled "REG-01 through REG-06: T-VIRUS CULTURE." These are intact.',
        umbrella_container_open: 'Container REG-07. Open. The interior restraints are shredded from the inside. Whatever was in here wanted out badly enough.',
        typewriter: 'An old portable typewriter. In this room, with this quiet — you can almost believe you\'re safe. Almost.',
        mirror_cabin: 'Your reflection. Leon looks back at you. For a moment, you study the face — checking it\'s still yours.',
    },
};
