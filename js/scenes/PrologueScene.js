/**
 * PrologueScene - Opening cinematic / story intro
 */
class PrologueScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.PROLOGUE);
        this._lineIndex = 0;
        this._canAdvance = false;
        this._typeInterval = null;
        this._lines = [];
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        this._lines = DIALOGUES.prologue;
        this._lineIndex = 0;

        // Full-black background
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Rain effect
        this._createRain(W, H);

        // Film grain / vignette
        this._noiseOverlay = this.add.graphics();
        this._noiseOverlay.fillStyle(0x000000, 0.04);
        this._noiseOverlay.fillRect(0, 0, W, H);
        this._noiseOverlay.setDepth(20);

        // Cinematic bars
        const barH = 60;
        this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000).setDepth(10);
        this.add.rectangle(W / 2, H - barH / 2, W, barH, 0x000000).setDepth(10);

        // Text area
        this._textBg = this.add.graphics().setDepth(11);
        this._textBg.fillStyle(0x000000, 0.7);
        this._textBg.fillRect(60, H / 2 - 80, W - 120, 160);

        // Speaker name
        this._speakerText = this.add.text(80, H / 2 - 70, '', {
            fontSize: '10px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#cc4444',
            letterSpacing: 4,
        }).setDepth(12);

        // Main text
        this._mainText = this.add.text(80, H / 2 - 50, '', {
            fontSize: '12px',
            fontFamily: 'Share Tech Mono, monospace',
            color: CONFIG.COLORS.TEXT_PRIMARY,
            wordWrap: { width: W - 160 },
            lineSpacing: 6,
        }).setDepth(12);

        // Advance prompt
        this._advanceText = this.add.text(W - 80, H / 2 + 60, '▶ SPACE / ENTER', {
            fontSize: '9px',
            fontFamily: 'Share Tech Mono',
            color: '#555',
            letterSpacing: 2,
        }).setOrigin(1, 0).setDepth(12);

        this.tweens.add({
            targets: this._advanceText,
            alpha: { from: 1, to: 0.2 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Input
        this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);

        // Start
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.time.delayedCall(600, () => this._showLine());

        // Allow skip
        this._escKey.on('down', () => this._skipPrologue());
    }

    _createRain(W, H) {
        this._rainDrops = [];
        for (let i = 0; i < 60; i++) {
            const drop = this.add.graphics();
            drop.lineStyle(1, 0x2a3a5a, 0.3 + Math.random() * 0.3);
            drop.beginPath();
            drop.moveTo(0, 0);
            drop.lineTo(-2, 12 + Math.random() * 20);
            drop.strokePath();
            drop.x = Math.random() * W;
            drop.y = Math.random() * H;
            drop.setDepth(1);
            this._rainDrops.push({ gfx: drop, speed: 200 + Math.random() * 300 });
        }
    }

    _showLine() {
        if (this._lineIndex >= this._lines.length) {
            this._finishPrologue();
            return;
        }

        const line = this._lines[this._lineIndex];
        this._canAdvance = false;

        // Style based on type
        const styles = {
            system:    { color: '#888880', size: '12px' },
            highlight: { color: '#ffcc44', size: '13px' },
            red:       { color: '#cc2222', size: '12px' },
            dim:       { color: '#444440', size: '11px' },
            action:    { color: '#6688aa', size: '11px', italic: true },
            default:   { color: '#d0c8c0', size: '12px' },
        };

        const style = styles[line.style || 'default'] || styles.default;

        // Speaker
        const speakerColors = {
            LEON: '#c8a040',
            BARRY: '#c07030',
            LUCIA: '#88aac0',
            USSTRATCOM: '#4488aa',
            SYSTEM: '#446688',
        };

        this._speakerText.setText(
            line.speaker && line.speaker !== 'SYSTEM' ? `— ${line.speaker} —` : ''
        );
        this._speakerText.setColor(speakerColors[line.speaker] || '#888');

        // Typewriter effect
        this._mainText.setText('');
        this._mainText.setStyle({
            fontSize: style.size,
            color: style.color,
            fontStyle: style.italic ? 'italic' : 'normal',
        });

        const fullText = line.text;
        let charIdx = 0;
        const charDelay = line.style === 'highlight' ? 40 : 25;

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
        }, charDelay);
    }

    _advance() {
        if (!this._canAdvance) {
            // Skip typewriter
            if (this._typeInterval) {
                clearInterval(this._typeInterval);
                this._typeInterval = null;
            }
            if (this._lineIndex < this._lines.length) {
                this._mainText.setText(this._lines[this._lineIndex].text);
            }
            this._canAdvance = true;
            return;
        }

        this._lineIndex++;
        this._showLine();
    }

    _skipPrologue() {
        if (this._typeInterval) clearInterval(this._typeInterval);
        this._finishPrologue();
    }

    shutdown() {
        if (this._typeInterval) {
            clearInterval(this._typeInterval);
            this._typeInterval = null;
        }
    }

    _finishPrologue() {
        this.cameras.main.fadeOut(1200, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                AudioSynth.playBgm('tension');
                this.scene.start(CONFIG.SCENES.GAME, {
                    roomId: 'aft_deck',
                    fromPrologue: true,
                });
            }
        });
    }

    update(time, delta) {
        // Rain animation
        if (this._rainDrops) {
            const H = CONFIG.HEIGHT;
            for (const drop of this._rainDrops) {
                drop.gfx.y += drop.speed * (delta / 1000);
                if (drop.gfx.y > H + 30) {
                    drop.gfx.y = -30;
                    drop.gfx.x = Math.random() * CONFIG.WIDTH;
                }
            }
        }

        // Check input
        if (Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this._enterKey)) {
            this._advance();
        }
    }
}
