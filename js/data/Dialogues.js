/**
 * All in-game dialogues, cutscene scripts, and NPC conversations.
 */
const DIALOGUES = {

    // =========================================================
    // PROLOGUE
    // =========================================================
    prologue: [
        { speaker: 'SYSTEM', text: 'September 14, 2002.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Four years after the destruction of Raccoon City.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The United States Strategic Command — USSTRATCOM —\nsent their best field agent to investigate reports\nof a bioterrorism incident aboard a luxury cruise liner.', style: 'system' },
        { speaker: 'SYSTEM', text: 'LEON SCOTT KENNEDY.\nFormer R.P.D. Raccoon City.\nHe boarded the M.S. STARLIGHT six hours ago.', style: 'system' },
        { speaker: 'SYSTEM', text: 'He never reported back.', style: 'red' },
        { speaker: 'SYSTEM', text: 'BARRY BURTON\nFormer S.T.A.R.S. — Raccoon City — Alpha Team\nCurrent: Private Sector. Semi-retired.\nStatus: Activated — Emergency Protocol', style: 'highlight' },
        { speaker: 'SYSTEM', text: 'USSTRATCOM reached out through back channels.\nNot a request. A favor owed.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The M.S. STARLIGHT — 200 nautical miles off the\nMediterranean coast. Drifting. No distress beacon.\nNo radio contact. No sign of life.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Umbrella\'s fingerprints were all over the intel.\nAnd a girl — a young girl — was reported aboard.\nDesignated by Umbrella as Subject KD-1.\nCodename: LUCIA.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Barry was dropped by helicopter onto the Starlight\'s\naft deck at 02:14 hours.', style: 'system' },
        { speaker: 'SYSTEM', text: 'He was told to find Leon. Find the girl. Get them out.', style: 'system' },
        { speaker: 'BARRY', text: 'Leon, you had better be alive. I did not come all this way to carry a body bag.', portrait: 'barry' },
        { speaker: 'SYSTEM', text: 'The words sounded braver than he felt.', style: 'dim' },
    ],

    prologue_arrived: [
        { speaker: 'SYSTEM', text: 'AFT DECK — M.S. STARLIGHT — 02:14 HRS', style: 'system' },
        { speaker: 'BARRY', text: 'Hell of a welcome.', portrait: 'barry' },
        { speaker: 'BARRY', text: 'Leon. Wherever you are — I\'m coming.', portrait: 'barry' },
    ],

    act2_licker_warning: [
        { speaker: 'BARRY', text: 'Something moved on the ceiling.', portrait: 'barry' },
        { speaker: 'BARRY', text: 'Fast. No eyes. Tongue like a whip.', portrait: 'barry' },
        { speaker: 'SYSTEM', text: 'Do not let it get close.', style: 'red' },
    ],

    // =========================================================
    // ACT 1 — FIRST MEETING WITH LEON
    // =========================================================
    act1_leon_first_meeting: [
        {"speaker": "BARRY", "text": "Leon Kennedy?"},
        {"speaker": "LEON", "text": "Barry Burton. They sent you?"},
        {"speaker": "BARRY", "text": "You missed your check-in. I owed someone a favor."},
        {"speaker": "SYSTEM", "text": "[Leon notices the P226 among Barry's equipment.]", "style": "action", "condition": "handgun_owned"},
        {"speaker": "LEON", "text": "You found my P226. Keep it. I have a spare from the security locker.", "condition": "handgun_owned"},
        {"speaker": "LEON", "text": "I left my P226 in Cabin 102. If you need a firearm, check there. I found a spare in the security locker.", "condition": "handgun_missing"},
        {"speaker": "BARRY", "text": "Found your P226. It's in a safe-room box.", "condition": "handgun_stored"},
        {"speaker": "LEON", "text": "Keep it handy. I found a spare in the security locker.", "condition": "handgun_stored"},
        {"speaker": "BARRY", "text": "Found a P226 in a cabin. Left it behind.", "condition": "handgun_lost"},
        {"speaker": "LEON", "text": "That was mine. I've got a spare. We'll manage.", "condition": "handgun_lost"},
        {"speaker": "LEON", "text": "I lost my radio on deck two. The lower decks are overrun."},
        {"speaker": "BARRY", "text": "Your note mentioned something bigger than a zombie.", "condition": "read_note_leon"},
        {"speaker": "BARRY", "text": "What happened to the crew?", "condition": "unread_note_leon"},
        {"speaker": "LEON", "text": "An outbreak. And something else escaped from a sealed container. I couldn't stop it."},
        {"speaker": "BARRY", "text": "And Lucia?", "condition": "lucia_absent"},
        {"speaker": "LEON", "text": "Last time I saw her, she was heading for the engine room. She said there was a service boat route.", "condition": "lucia_absent"},
        {"speaker": "BARRY", "text": "Lucia is with me. The service boat is gone. We need another way out.", "condition": "lucia_present"},
        {"speaker": "LEON", "text": "Then we look together.", "condition": "lucia_present"},
        {"speaker": "BARRY", "text": "Chris Redfield told me you escaped Raccoon City with his sister, Claire."},
        {"speaker": "LEON", "text": "Claire kept me alive. I'd like to thank her in person."},
        {"speaker": "BARRY", "text": "Stay close. We find a way out together."},
        {"speaker": "LEON", "text": "Together."},
    ],

    // =========================================================
    // ACT 1 — LEON AS COMPANION (after first meeting)
    // =========================================================
    leon_companion: [
        { speaker: 'LEON', text: 'Stay close. We all leave this ship together.', portrait: 'leon' },
    ],

    // =========================================================
    // ACT 1 — FINDING LEON'S NOTE (before meeting)
    // =========================================================
    act1_leon_note_found: [
        {"speaker": "BARRY", "text": "Leon's handwriting. He made it this far."},
        {"speaker": "BARRY", "text": "\"Don't trust anyone who looks like me.\" What did you see, Leon?"},
    ],

    // =========================================================
    // ACT 2 — LUCIA FIRST MEETING
    // =========================================================
    act2_lucia_found: [
        {"speaker": "LUCIA", "text": "Stay back!"},
        {"speaker": "LEON", "text": "Easy. I'm Leon Kennedy. This is Barry. We came to get you out.", "condition": "leon_present"},
        {"speaker": "BARRY", "text": "Easy. Barry Burton. I was sent to find you, Lucia.", "condition": "leon_absent"},
        {"speaker": "LUCIA", "text": "You know my name?"},
        {"speaker": "BARRY", "text": "It was in the briefing. That's all. Are you hurt?"},
        {"speaker": "LUCIA", "text": "They bit me. Nothing happened. The doctors kept trying to find out why."},
        {"speaker": "BARRY", "text": "Your letter called it the Kodiak factor. Is that why they kept you?", "condition": "read_lucia_letter"},
        {"speaker": "LUCIA", "text": "That's what they called it. They took my blood for years.", "condition": "read_lucia_letter"},
        {"speaker": "BARRY", "text": "You don't have to tell us everything now. Can you walk?", "condition": "unread_lucia_letter"},
        {"speaker": "LUCIA", "text": "Matthews gave me an emergency serum before I escaped. Said it might help someone bitten. He only had one dose."},
        {"speaker": "BARRY", "text": "Keep it safe."},
        {"speaker": "LUCIA", "text": "I can walk. But the service boat is gone. They cut it loose."},
        {"speaker": "BARRY", "text": "Then we find another way."},
        {"speaker": "LUCIA", "text": "I'm not going back in a cage."},
        {"speaker": "BARRY", "text": "You're coming with me. No cages."},
    ],

    // =========================================================
    // ACT 2 — ENTERING THE ENGINE ROOM
    // =========================================================
    act2_engine_room: [
        {"speaker": "SYSTEM", "text": "[A heavy scrape echoes beyond the engine room door.]", "style": "action"},
        {"speaker": "BARRY", "text": "That's no engine."},
        {"speaker": "LEON", "text": "Keep away from the ceiling. I'll watch our backs.", "condition": "leon_present"},
        {"speaker": "LUCIA", "text": "Something followed me down here. It waits until you stop looking.", "condition": "lucia_present"},
        {"speaker": "BARRY", "text": "Keep moving."},
    ],

    // =========================================================
    // ACT 3 — DISCOVERING THE LAB
    // =========================================================
    act3_lab_discovery: [
        {"speaker": "SYSTEM", "text": "[Umbrella equipment fills the service corridor. A sign points toward the laboratory.]", "style": "action"},
        {"speaker": "BARRY", "text": "A laboratory. Hidden below the passenger decks."},
        {"speaker": "LEON", "text": "The cargo was a cover. They were working down here.", "condition": "leon_present"},
        {"speaker": "LUCIA", "text": "I know that door. Please don't leave me here.", "condition": "lucia_present"},
        {"speaker": "BARRY", "text": "The memo calls it GENESIS. It says the creature can copy people.", "condition": "read_umbrella_memo"},
        {"speaker": "BARRY", "text": "There must be records inside. We need to know what escaped.", "condition": "unread_umbrella_memo"},
        {"speaker": "BARRY", "text": "Stay close. We check the lab, then find a way off this ship."},
    ],

    // =========================================================
    // ACT 3 — CREATURE FIRST SIGHTING
    // =========================================================
    act3_creature_revealed: [
        {"speaker": "SYSTEM", "text": "[A wet scraping sound comes from behind the containment chamber.]", "style": "action"},
        {"speaker": "LUCIA", "text": "It's here."},
        {"speaker": "BARRY", "text": "Leon. Behind you!"},
        {"speaker": "SYSTEM", "text": "[A limb catches Leon's arm. He fires as Barry pulls him free. The emergency lights fail.]", "style": "red"},
        {"speaker": "LEON", "text": "It got something into my arm. Barry—"},
        {"speaker": "SYSTEM", "text": "[Metal tears. In the darkness, something retreats toward the cargo hold.]", "style": "action"},
        {"speaker": "LUCIA", "text": "Leon? Barry? I can't see you!"},
        {"speaker": "BARRY", "text": "Follow my voice. Into the hold. Together."},
    ],

    // =========================================================
    // ACT 4 — THE TWO LEONS SCENE (BARRY POV)
    // =========================================================
    act4_two_leons_intro: [
        {"speaker": "SYSTEM", "text": "[Two identical figures step out from opposite sides of the hold.]", "style": "action"},
        {"speaker": "BARRY", "text": "Leon?"},
        {"speaker": "LEON_A", "text": "Barry. Keep Lucia behind you. That thing followed us."},
        {"speaker": "LEON_B", "text": "Don't go near him. Look at me, Barry."},
        {"speaker": "SYSTEM", "text": "[Barry stops Lucia from stepping forward.]", "style": "action"},
        {"speaker": "BARRY", "text": "Same face. Same voice."},
        {"speaker": "LEON_A", "text": "You saw it grab me. It must have copied me then."},
        {"speaker": "LEON_B", "text": "I don't know what it remembers. Ask us something."},
        {"speaker": "BARRY", "text": "Something from before this ship. Both of you answer."},
        {"speaker": "SYSTEM", "text": "", "style": "action", "variant": "ready_weapon"},
        {"speaker": "BARRY", "text": "What was the name of the woman you escaped Raccoon City with?"},
    ],

    act4_two_leons_question: [
        {"speaker": "BARRY", "text": "What was the name of the woman you escaped Raccoon City with?"},
    ],

    act4_real_leon_identified: [
        {"speaker": "BARRY", "text": "Claire Redfield. That's the name Chris gave me."},
        {"speaker": "LEON", "text": "Her brother was S.T.A.R.S., like you. Barry, get Lucia back."},
        {"speaker": "SYSTEM", "text": "[The other Leon reaches for Lucia. Barry puts himself between them.]", "style": "action"},
        {"speaker": "SYSTEM", "text": "[The false Leon freezes. Something moves beneath its skin.]", "style": "red"},
        {"speaker": "BARRY", "text": "You picked the wrong face."},
        {"speaker": "BARRY", "text": "Stay back. Both of you."},
    ],

    act4_lucia_saves_leon: [
        {"speaker": "SYSTEM", "text": "[Leon sinks against a crate, clutching the wound in his arm.]", "style": "action"},
        {"speaker": "LUCIA", "text": "Leon. Hold still."},
        {"speaker": "LEON", "text": "It's spreading. I can feel it."},
        {"speaker": "LUCIA", "text": "Matthews made an emergency serum from my blood. He gave me one dose before I escaped."},
        {"speaker": "SYSTEM", "text": "[Lucia takes a sealed injector from her pocket.]", "style": "action"},
        {"speaker": "BARRY", "text": "Will it work?"},
        {"speaker": "LUCIA", "text": "He thought it would. It's all I've got."},
        {"speaker": "LEON", "text": "Do it."},
        {"speaker": "SYSTEM", "text": "[She presses the injector against his arm. His breathing slowly steadies.]", "style": "action"},
        {"speaker": "LEON", "text": "I can stand. Help me up."},
        {"speaker": "BARRY", "text": "Good. We're leaving. Now."},
    ],

    // =========================================================
    // ENDING
    // =========================================================
    ending_escape: [
        { speaker: 'SYSTEM', text: 'The Starlight began to list at 04:47 hours.', style: 'system' },
        { speaker: 'SYSTEM', text: 'The Creature\'s destruction had ruptured critical systems in the cargo hold.', style: 'system' },
        { speaker: 'SYSTEM', text: 'Leon, Barry, and Lucia reached the aft deck at 04:56. Six minutes before the ship went under.', style: 'system' },
        { speaker: 'LEON', text: 'USSTRATCOM, this is Kennedy. We have Lucia. Three survivors for extraction. Coordinates to follow.', portrait: 'leon' },
        { speaker: 'USSTRATCOM', text: 'Copy that, Kennedy. Helicopter en route. ETA four minutes.', style: 'radio' },
        { speaker: 'BARRY', text: 'Four minutes. Stay together. Watch the rail.', portrait: 'barry' },
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
    barry_monologue: [
        {"speaker": "BARRY", "text": "Raccoon City was supposed to be the last time."},
        {"speaker": "BARRY", "text": "The smell of it. You never forget it."},
        {"speaker": "BARRY", "text": "Leon — where are you. Stay alive."},
        {"speaker": "BARRY", "text": "Find Leon. Find the girl. Get out. Simple. Nothing is ever simple."},
        {"speaker": "BARRY", "text": "Jill would have something smart to say right now."},
        {"speaker": "BARRY", "text": "I told my family I was going fishing."},
    ],

    leon_ambient: [
        {"speaker": "LEON", "text": "Stay close. The corridors narrow up ahead."},
        {"speaker": "LEON", "text": "Save your ammunition. We don't know what's ahead."},
        {"speaker": "LEON", "text": "This smell... same as Raccoon City. God, I never wanted to smell this again."},
        {"speaker": "LEON", "text": "Keep your eyes up. They don't always come at ground level."},
        {"speaker": "LEON", "text": "Watch the ceiling. They can come from anywhere."},
        {"speaker": "LEON", "text": "You went quiet, Barry. Did you see something?"},
    ],

    lucia_ambient: [
        {"speaker": "LUCIA", "text": "There were 12 of us in the lab. I'm the only one left."},
        {"speaker": "LUCIA", "text": "The doctor who helped me... his name was Dr. Matthews. Please don't let him be forgotten."},
        {"speaker": "LUCIA", "text": "That scraping sound... I heard it outside my cell."},
        {"speaker": "LUCIA", "text": "My mother's name is Elena. She's in Lyon. Please remember that."},
        {"speaker": "LUCIA", "text": "I'm not afraid of the zombies. I just feel sorry for them."},
    ],

    // =========================================================
    // SAVE ROOM QUOTES
    // =========================================================
    save_room_quotes: [
        '"The difference between a soldier and a survivor is that a survivor knows when to rest." — Unknown',
        '"Every moment of quiet is borrowed time." — L.K.',
        '"Lucia reminds me of my daughters. I promised them I would come home." — B.B.',
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
        mirror_cabin: 'Your reflection. Barry looks back at you. You study the face — older than you remember. Tired. Still here.',
        cabin_103_belongings: 'A woman\'s handbag. Boarding pass, lipstick, a photo of two kids on a beach. Her name on the pass: ELENA VOSS. She never made it off the ship.',
        cabin_104_barricaded: 'Cabin 104. The door is barricaded from the inside — something heavy piled against it. You can hear labored, rhythmic breathing through the gap. Not human. Not anymore.',
    },
};
