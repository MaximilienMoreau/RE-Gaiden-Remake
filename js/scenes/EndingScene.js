/**
 * EndingScene - Game completion cinematic and epilogue
 */
class EndingScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.ENDING);
        this._lineIndex = 0;
        this._lines = [];
        this._phase = 'cinematic'; // cinematic -> epilogue -> credits
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        AudioSynth.playBgm('ending');

        // Cinematic lines (escape sequence)
        this._lines = [
            ...DIALOGUES.ending_escape,
            ...DIALOGUES.ending_epilogue,
        ];

        this._buildCinematicUI(W, H);
        this._buildShipSinking(W, H);

        this.cameras.main.fadeIn(2000, 0, 0, 0);
        this.time.delayedCall(1500, () => this._showLine());

        this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this._canAdvance = false;
    }

    _buildCinematicUI(W, H) {
        const barH = 60;
        this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000).setDepth(10);
        this.add.rectangle(W / 2, H - barH / 2, W, barH, 0x000000).setDepth(10);

        const boxH = 130;
        const boxY = H - boxH - 10;
        this._box = this.add.graphics().setDepth(11);
        this._box.fillStyle(0x020406, 0.97);
        this._box.fillRect(20, boxY, W - 40, boxH);
        this._box.lineStyle(1, 0x223344, 0.6);
        this._box.strokeRect(20, boxY, W - 40, boxH);

        this._speakerText = this.add.text(40, boxY + 12, '', {
            fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#c8a040', letterSpacing: 3,
        }).setDepth(12);

        this._mainText = this.add.text(40, boxY + 34, '', {
            fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#d0c8c0',
            wordWrap: { width: W - 80 }, lineSpacing: 5,
        }).setDepth(12);

        this._promptText = this.add.text(W - 35, boxY + boxH - 18, '▶', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#555',
        }).setOrigin(1, 1).setDepth(12).setAlpha(0);
        this.tweens.add({
            targets: this._promptText,
            alpha: { from: 0, to: 0.8 },
            duration: 700,
            yoyo: true,
            repeat: -1,
        });
    }

    _buildShipSinking(W, H) {
        // Ship silhouette that slowly tilts and sinks
        const shipY = H * 0.55;
        this._shipContainer = this.add.container(W / 2, shipY).setDepth(5);

        const shipGfx = this.add.graphics();
        // Hull
        shipGfx.fillStyle(0x0a0a15, 1);
        shipGfx.beginPath();
        shipGfx.moveTo(-200, 0); shipGfx.lineTo(-200, -30);
        shipGfx.lineTo(-100, -40); shipGfx.lineTo(150, -38);
        shipGfx.lineTo(220, -10); shipGfx.lineTo(220, 0);
        shipGfx.closePath(); shipGfx.fillPath();
        // Superstructure
        shipGfx.fillStyle(0x0d0d1a, 1);
        shipGfx.fillRect(-60, -90, 120, 50);
        shipGfx.fillRect(-30, -120, 60, 30);
        this._shipContainer.add(shipGfx);

        // Slowly tilt and sink the ship
        this.tweens.add({
            targets: this._shipContainer,
            angle: 18,
            y: shipY + 200,
            duration: 25000,
            ease: 'Power1',
        });

        // Water
        const water = this.add.graphics().setDepth(4);
        water.fillStyle(0x040810, 1);
        water.fillRect(0, H * 0.58, W, H * 0.42);
        // Waves
        water.lineStyle(1, 0x0a1a30, 0.5);
        for (let i = 0; i < 8; i++) {
            const wy = H * 0.6 + i * 14;
            water.beginPath();
            water.moveTo(0, wy);
            water.lineTo(W, wy + 4);
            water.strokePath();
        }

        // Smoke particles (simplified)
        this._smokeTimer = this.time.addEvent({
            delay: 400,
            loop: true,
            callback: () => {
                if (!this._shipContainer) return;
                const sx = this._shipContainer.x - 20 + Math.random() * 40;
                const sy = this._shipContainer.y - 100;
                const smoke = this.add.graphics().setDepth(6);
                smoke.fillStyle(0x333330, 0.4);
                smoke.fillCircle(0, 0, 8 + Math.random() * 12);
                smoke.setPosition(sx, sy);
                this.tweens.add({
                    targets: smoke,
                    y: sy - 80,
                    x: sx + (Math.random() - 0.5) * 40,
                    alpha: 0,
                    scaleX: 2, scaleY: 2,
                    duration: 2500,
                    onComplete: () => smoke.destroy(),
                });
            },
        });
    }

    _showLine() {
        if (this._lineIndex >= this._lines.length) {
            this._showCredits();
            return;
        }

        const line = this._lines[this._lineIndex];
        this._canAdvance = false;

        // Handle title/credits style lines
        if (line.style === 'title') {
            this._mainText.setText('');
            this._speakerText.setText('');
            this._showTitleCard(line.text);
            this.time.delayedCall(2500, () => {
                this._lineIndex++;
                this._showLine();
            });
            return;
        }

        const speakerColors = {
            LEON: '#c8a040', BARRY: '#c07030', LUCIA: '#88aac0',
            SYSTEM: '#446688', USSTRATCOM: '#4488aa',
        };

        const displayNames = {
            LEON: '— LEON —', BARRY: '— BARRY —', LUCIA: '— LUCIA —',
            SYSTEM: '', USSTRATCOM: '— USSTRATCOM RADIO —',
        };

        this._speakerText.setText(displayNames[line.speaker] || `— ${line.speaker} —`);
        this._speakerText.setColor(speakerColors[line.speaker] || '#888880');

        const styleColors = {
            system: '#888880', action: '#6688aa', dim: '#555550', red: '#cc3333',
        };
        this._mainText.setColor(line.style ? styleColors[line.style] : '#d0c8c0');

        const fullText = line.text;
        let charIdx = 0;
        if (this._typeInterval) clearInterval(this._typeInterval);
        this._typeInterval = setInterval(() => {
            if (charIdx <= fullText.length) {
                this._mainText.setText(fullText.substring(0, charIdx));
                charIdx++;
            } else {
                clearInterval(this._typeInterval);
                this._typeInterval = null;
                this._canAdvance = true;
            }
        }, 22);
    }

    _showTitleCard(text) {
        const card = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 20, text, {
            fontSize: '28px', fontFamily: 'Oswald, sans-serif', fontStyle: 'bold',
            color: '#ffffff', stroke: '#000', strokeThickness: 6, letterSpacing: 8,
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.tweens.add({
            targets: card,
            alpha: { from: 0, to: 1 },
            duration: 800,
            hold: 1500,
            yoyo: true,
            onComplete: () => card.destroy(),
        });
    }

    _showCredits() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        // Fade out ship/dialogue
        this.tweens.add({
            targets: [this._box, this._speakerText, this._mainText, this._promptText, this._shipContainer],
            alpha: 0,
            duration: 2000,
        });

        const credits = [
            { text: 'RESIDENT EVIL GAIDEN', style: 'title' },
            { text: 'REMAKE', style: 'subtitle' },
            { text: '', style: 'space' },
            { text: 'An unofficial fan remake', style: 'body' },
            { text: 'Based on Resident Evil Gaiden (2001)', style: 'body' },
            { text: 'Original game by Capcom / M4 Ltd.', style: 'body' },
            { text: '', style: 'space' },
            { text: 'CHARACTERS', style: 'section' },
            { text: 'Leon S. Kennedy', style: 'body' },
            { text: 'Barry Burton', style: 'body' },
            { text: 'Lucia', style: 'body' },
            { text: '', style: 'space' },
            { text: 'ACKNOWLEDGMENT', style: 'section' },
            { text: 'Raccoon City. September 1998.', style: 'body' },
            { text: 'In memory of all who were lost.', style: 'italic' },
            { text: '', style: 'space' },
            { text: 'RESIDENT EVIL is a trademark of Capcom Co., Ltd.', style: 'small' },
            { text: 'This is an unofficial fan project.', style: 'small' },
        ];

        const creditContainer = this.add.container(W / 2, H + 50).setDepth(30);
        let yOffset = 0;

        credits.forEach(credit => {
            let txt;
            switch (credit.style) {
                case 'title':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '32px', fontFamily: 'Oswald', fontStyle: 'bold',
                        color: '#cc0000', letterSpacing: 8,
                    }).setOrigin(0.5); yOffset += 50; break;
                case 'subtitle':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '18px', fontFamily: 'Share Tech Mono', color: '#888',
                        letterSpacing: 10,
                    }).setOrigin(0.5); yOffset += 40; break;
                case 'section':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#c8a040',
                        letterSpacing: 5,
                    }).setOrigin(0.5); yOffset += 30; break;
                case 'body':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#888880',
                    }).setOrigin(0.5); yOffset += 22; break;
                case 'italic':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#666660',
                        fontStyle: 'italic',
                    }).setOrigin(0.5); yOffset += 22; break;
                case 'small':
                    txt = this.add.text(0, yOffset, credit.text, {
                        fontSize: '8px', fontFamily: 'Share Tech Mono', color: '#443333',
                    }).setOrigin(0.5); yOffset += 18; break;
                case 'space':
                    yOffset += 20; return;
            }
            if (txt) creditContainer.add(txt);
        });

        // Scroll credits
        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: creditContainer,
                y: -(yOffset + 100),
                duration: (yOffset + H) * 18,
                ease: 'Linear',
                onComplete: () => {
                    // Return to title
                    this.time.delayedCall(2000, () => {
                        this.cameras.main.fadeOut(1500, 0, 0, 0, (cam, p) => {
                            if (p === 1) {
                                AudioSynth.playBgm('title');
                                this.scene.start(CONFIG.SCENES.TITLE);
                            }
                        });
                    });
                },
            });
        });

        // Press any key to skip credits
        this.add.text(W / 2, H - 20, 'PRESS ANY KEY TO SKIP', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#222',
        }).setOrigin(0.5).setDepth(31);

        this.input.keyboard.once('keydown', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0, (cam, p) => {
                if (p === 1) {
                    AudioSynth.playBgm('title');
                    this.scene.start(CONFIG.SCENES.TITLE);
                }
            });
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this._enterKey)) {
            if (!this._canAdvance) {
                if (this._typeInterval) {
                    clearInterval(this._typeInterval);
                    this._typeInterval = null;
                }
                this._mainText.setText(this._lines[this._lineIndex]?.text || '');
                this._canAdvance = true;
                return;
            }
            this._lineIndex++;
            this._showLine();
        }
    }

    shutdown() {
        if (this._typeInterval) {
            clearInterval(this._typeInterval);
            this._typeInterval = null;
        }
        if (this._smokeTimer) {
            this._smokeTimer.remove();
            this._smokeTimer = null;
        }
    }
}
