/**
 * AudioSynth - Procedural audio using Web Audio API
 * Generates all sound effects and ambient music without external files.
 */
const AudioSynth = {
    ctx: null,
    masterGain: null,
    bgmGain: null,
    sfxGain: null,
    currentBgm: null,
    bgmInterval: null,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.6;
            this.masterGain.connect(this.ctx.destination);

            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = 0.4;
            this.bgmGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.8;
            this.sfxGain.connect(this.masterGain);
        } catch (e) {
            console.warn('Web Audio API not available.');
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // =========================================================
    // BACKGROUND MUSIC (generative/procedural)
    // =========================================================
    playBgm(type) {
        this.stopBgm();
        if (!this.ctx) return;
        this.resume();

        switch (type) {
            case 'title':      this._bgmTitle(); break;
            case 'safe_room':  this._bgmSafeRoom(); break;
            case 'exploration': this._bgmExploration(); break;
            case 'tension':    this._bgmTension(); break;
            case 'combat':     this._bgmCombat(); break;
            case 'boss':       this._bgmBoss(); break;
            case 'ending':     this._bgmEnding(); break;
        }
    },

    stopBgm() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        if (this.currentBgm) {
            try {
                this.currentBgm.forEach(n => n.stop && n.stop());
            } catch (e) {}
            this.currentBgm = null;
        }
    },

    _playNote(freq, dur, type = 'sine', gainVal = 0.2, output = null) {
        if (!this.ctx) return null;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(gainVal, this.ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(g);
        g.connect(output || this.bgmGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + dur + 0.05);
        return osc;
    },

    _bgmTitle() {
        // Slow, ominous ambient drone
        const notes = [
            [55, 4.0], [73.4, 4.0], [82.4, 4.0], [65.4, 4.0],
        ];
        let idx = 0;
        const play = () => {
            const [freq, dur] = notes[idx % notes.length];
            this._playNote(freq, dur, 'sawtooth', 0.08);
            this._playNote(freq * 2.01, dur, 'sine', 0.04);
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 4000);
    },

    _bgmSafeRoom() {
        // Calm, eerie melody - pentatonic minor
        const melody = [220, 261.6, 293.7, 349.2, 392.0, 349.2, 293.7, 261.6];
        let idx = 0;
        const play = () => {
            this._playNote(melody[idx % melody.length], 1.2, 'sine', 0.06);
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 1200);
    },

    _bgmExploration() {
        // Low tension ambient - irregular pulse
        const drones = [55, 58.3, 61.7, 65.4];
        let idx = 0;
        const play = () => {
            const freq = drones[idx % drones.length];
            this._playNote(freq, 2.5, 'sawtooth', 0.05);
            this._playNote(freq * 3, 2.5, 'sine', 0.02);
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 2500);
    },

    _bgmTension() {
        // Rising tension - faster pace, dissonant
        const notes = [130.8, 138.6, 123.5, 146.8, 116.5, 155.6];
        let idx = 0;
        const play = () => {
            this._playNote(notes[idx % notes.length], 0.8, 'sawtooth', 0.07);
            this._playNote(notes[(idx + 3) % notes.length] * 2, 0.4, 'square', 0.03);
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 700);
    },

    _bgmCombat() {
        // Fast, staccato, industrial
        const beats = [110, 138.6, 110, 123.5, 110, 155.6, 138.6, 110];
        let idx = 0;
        const play = () => {
            this._playNote(beats[idx % beats.length], 0.3, 'sawtooth', 0.12);
            if (idx % 2 === 0) {
                this._noise(0.05, 0.1); // kick/snare emulation
            }
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 250);
    },

    _bgmBoss() {
        // Intense, layered
        const bass = [55, 58.3, 55, 61.7];
        const melody = [220, 233.1, 207.7, 246.9, 220, 196.0];
        let idx = 0;
        const play = () => {
            this._playNote(bass[idx % bass.length], 0.5, 'sawtooth', 0.1);
            this._playNote(melody[idx % melody.length], 0.25, 'square', 0.05);
            if (idx % 4 === 0) this._noise(0.08, 0.15);
            idx++;
        };
        play();
        this.bgmInterval = setInterval(play, 400);
    },

    _bgmEnding() {
        const chord = [261.6, 329.6, 392.0, 523.3];
        let phase = 0;
        const play = () => {
            chord.forEach((freq, i) => {
                this._playNote(freq, 3.0, 'sine', 0.04 + i * 0.01);
            });
            phase++;
        };
        play();
        this.bgmInterval = setInterval(play, 3000);
    },

    // =========================================================
    // SOUND EFFECTS
    // =========================================================
    _noise(vol, dur) {
        if (!this.ctx) return;
        const bufSize = this.ctx.sampleRate * dur;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start();
    },

    sfx(name) {
        if (!this.ctx) return;
        this.resume();
        switch (name) {
            case 'gunshot_pistol': this._sfxGunshot(0.3, 0.06, 800, 200); break;
            case 'gunshot_shotgun': this._sfxGunshot(0.6, 0.12, 400, 80); break;
            case 'dry_fire': this._sfxDryFire(); break;
            case 'reload': this._sfxReload(); break;
            case 'zombie_groan': this._sfxZombieGroan(); break;
            case 'zombie_hurt': this._sfxZombieHurt(); break;
            case 'zombie_die': this._sfxZombieDie(); break;
            case 'door_open': this._sfxDoor(true); break;
            case 'door_locked': this._sfxDoor(false); break;
            case 'item_pickup': this._sfxItemPickup(); break;
            case 'herb_use': this._sfxHerbUse(); break;
            case 'player_hurt': this._sfxPlayerHurt(); break;
            case 'player_die': this._sfxPlayerDie(); break;
            case 'footstep': this._sfxFootstep(); break;
            case 'save': this._sfxSave(); break;
            case 'combat_hit': this._sfxCombatHit(); break;
            case 'combat_miss': this._sfxCombatMiss(); break;
            case 'combat_crit': this._sfxCombatCrit(); break;
            case 'boss_hurt': this._sfxBossHurt(); break;
            case 'boss_roar': this._sfxBossRoar(); break;
            case 'menu_select': this._sfxMenuSelect(); break;
            case 'menu_confirm': this._sfxMenuConfirm(); break;
            case 'danger_jingle': this._sfxDangerJingle(); break;
        }
    },

    _sfxGunshot(noiseVol, noiseDur, startFreq, endFreq) {
        this._noise(noiseVol, noiseDur);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + noiseDur);
        g.gain.setValueAtTime(0.3, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + noiseDur);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + noiseDur + 0.05);
    },

    _sfxDryFire() {
        this._playNote(800, 0.05, 'square', 0.1, this.sfxGain);
    },

    _sfxReload() {
        setTimeout(() => this._noise(0.1, 0.03), 0);
        setTimeout(() => this._noise(0.15, 0.05), 200);
        setTimeout(() => this._noise(0.2, 0.04), 400);
    },

    _sfxZombieGroan() {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80 + Math.random() * 40, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.6);
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.85);
    },

    _sfxZombieHurt() {
        this._noise(0.2, 0.1);
        this._playNote(150, 0.15, 'sawtooth', 0.08, this.sfxGain);
    },

    _sfxZombieDie() {
        this._noise(0.3, 0.3);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.55);
    },

    _sfxDoor(open) {
        if (open) {
            this._noise(0.2, 0.15);
            this._playNote(200, 0.3, 'sawtooth', 0.06, this.sfxGain);
        } else {
            this._noise(0.15, 0.1);
            this._playNote(300, 0.1, 'square', 0.1, this.sfxGain);
        }
    },

    _sfxItemPickup() {
        [523.3, 659.3, 784.0].forEach((freq, i) => {
            setTimeout(() => this._playNote(freq, 0.15, 'sine', 0.08, this.sfxGain), i * 80);
        });
    },

    _sfxHerbUse() {
        [392, 523.3, 659.3, 783.99].forEach((freq, i) => {
            setTimeout(() => this._playNote(freq, 0.3, 'sine', 0.05, this.sfxGain), i * 100);
        });
    },

    _sfxPlayerHurt() {
        this._noise(0.3, 0.2);
        this._playNote(300, 0.1, 'sawtooth', 0.1, this.sfxGain);
    },

    _sfxPlayerDie() {
        this._noise(0.4, 0.5);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.55);
    },

    _sfxFootstep() {
        this._noise(0.08, 0.06);
    },

    _sfxSave() {
        const notes = [523.3, 587.3, 659.3, 698.5, 784.0, 880.0];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playNote(freq, 0.5, 'sine', 0.07, this.sfxGain), i * 100);
        });
    },

    _sfxCombatHit() {
        this._noise(0.25, 0.08);
        this._playNote(200, 0.1, 'sawtooth', 0.08, this.sfxGain);
    },

    _sfxCombatMiss() {
        this._noise(0.1, 0.05);
        this._playNote(600, 0.05, 'square', 0.05, this.sfxGain);
    },

    _sfxCombatCrit() {
        this._noise(0.4, 0.12);
        this._playNote(150, 0.2, 'sawtooth', 0.15, this.sfxGain);
        setTimeout(() => this._playNote(100, 0.3, 'sawtooth', 0.1, this.sfxGain), 80);
    },

    _sfxBossHurt() {
        this._noise(0.5, 0.3);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.5);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.55);
    },

    _sfxBossRoar() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this._noise(0.5, 0.4);
                this._playNote(40 + i * 10, 0.5, 'sawtooth', 0.2, this.sfxGain);
            }, i * 200);
        }
    },

    _sfxMenuSelect() {
        this._playNote(440, 0.08, 'square', 0.05, this.sfxGain);
    },

    _sfxMenuConfirm() {
        this._playNote(523.3, 0.1, 'square', 0.06, this.sfxGain);
        setTimeout(() => this._playNote(659.3, 0.1, 'square', 0.06, this.sfxGain), 80);
    },

    _sfxDangerJingle() {
        const notes = [880, 831, 784, 740];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playNote(freq, 0.2, 'square', 0.06, this.sfxGain), i * 150);
        });
    },
};
