/**
 * GameOverScene - You Died screen
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.GAME_OVER);
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Red blood seep effect
        const blood = this.add.graphics();
        blood.fillStyle(0x550000, 1);
        blood.fillRect(0, H - 30, W, 30);
        this.tweens.add({
            targets: blood,
            scaleY: { from: 1, to: 12 },
            y: { from: 0, to: -H * 0.8 },
            duration: 2500,
            ease: 'Power3',
        });

        // Text
        const mainText = this.add.text(W / 2, H / 2 - 40, 'YOU ARE DEAD', {
            fontSize: '36px', fontFamily: 'Oswald, sans-serif', fontStyle: 'bold',
            color: '#cc0000', stroke: '#000', strokeThickness: 8,
            letterSpacing: 8,
        }).setOrigin(0.5).setAlpha(0);

        this.add.text(W / 2, H / 2 + 20, 'OPERATOR DOWN', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#660000', letterSpacing: 6,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: mainText,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2',
        });

        // Quote
        const quotes = [
            '"Every survivor carries the dead with them." — B.B.',
            '"I\'ve come back from worse. Get up." — B.B.',
            '"Raccoon City took everything. I refuse to let this take the rest." — B.B.',
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        this.add.text(W / 2, H / 2 + 60, quote, {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#442222', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Options
        const yy = H * 0.72;
        const options = [
            { text: 'CONTINUE (Last Save)', action: 'continue' },
            { text: 'RETURN TO TITLE', action: 'title' },
        ];

        let selected = 0;
        const optTexts = options.map((opt, i) => {
            return this.add.text(W / 2, yy + i * 36, opt.text, {
                fontSize: '12px', fontFamily: 'Share Tech Mono',
                color: i === 0 ? '#ffffff' : '#666',
                letterSpacing: 3,
            }).setOrigin(0.5).setAlpha(0);
        });

        // Fade in options after delay
        this.time.delayedCall(1800, () => {
            this.tweens.add({ targets: optTexts, alpha: 1, duration: 800 });
        });

        // Input
        const keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        let canInput = false;
        this.time.delayedCall(2200, () => { canInput = true; });

        const updateSel = (idx) => {
            selected = idx;
            optTexts.forEach((t, i) => t.setColor(i === idx ? '#ffffff' : '#666'));
        };

        this.input.keyboard.on('keydown', (e) => {
            if (!canInput) return;
            if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
                AudioSynth.sfx('menu_select');
                updateSel((selected - 1 + options.length) % options.length);
            } else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
                AudioSynth.sfx('menu_select');
                updateSel((selected + 1) % options.length);
            } else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER ||
                       e.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
                AudioSynth.sfx('menu_confirm');
                this._executeOption(options[selected].action);
            }
        });
    }

    _executeOption(action) {
        this.cameras.main.fadeOut(600, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                if (action === 'continue') {
                    // Try to load most recent save
                    let loaded = false;
                    for (let i = 0; i < CONFIG.SAVE_SLOT_COUNT; i++) {
                        const info = SaveSystem.getSaveInfo(i);
                        if (info.exists) {
                            SaveSystem.load(i);
                            loaded = true;
                            break;
                        }
                    }
                    if (loaded) {
                        AudioSynth.playBgm('tension');
                        this.scene.start(CONFIG.SCENES.GAME, {
                            fromSave: true,
                            roomId: SaveSystem.getState().player.currentRoom,
                        });
                    } else {
                        this.scene.start(CONFIG.SCENES.TITLE);
                    }
                } else {
                    AudioSynth.playBgm('title');
                    this.scene.start(CONFIG.SCENES.TITLE);
                }
            }
        });
    }
}
