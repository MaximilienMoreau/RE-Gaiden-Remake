/**
 * DialogueScene - Dialogue/cutscene overlay
 * Can display multi-line dialogue scripts or single examination texts
 */
class DialogueScene extends Phaser.Scene {
    constructor() {
        super({ key: CONFIG.SCENES.DIALOGUE, active: false });
        this._lines = [];
        this._lineIndex = 0;
        this._canAdvance = false;
        this._typeInterval = null;
    }

    init(data) {
        this._dialogueId = data.dialogueId;
        this._singleText = data.singleText;
        this._npcId = data.npcId;
        this._callerScene = data.callerScene || CONFIG.SCENES.GAME;
        this._onComplete = data.onComplete;
    }

    create() {
        const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

        // Prepare lines
        if (this._singleText) {
            this._lines = [{ speaker: 'EXAMINE', text: this._singleText, style: 'examine' }];
        } else if (this._dialogueId && DIALOGUES[this._dialogueId]) {
            this._lines = DIALOGUES[this._dialogueId];
        } else {
            this._closeDialogue();
            return;
        }
        this._lineIndex = 0;

        // Semi-transparent overlay
        this._overlay = this.add.graphics();
        this._overlay.fillStyle(0x000000, 0.6);
        this._overlay.fillRect(0, 0, W, H);

        // Cinematic bars
        this._topBar = this.add.rectangle(W / 2, 35, W, 70, 0x000000).setDepth(10);
        this._bottomBar = this.add.rectangle(W / 2, H - 35, W, 70, 0x000000).setDepth(10);

        // Dialogue box
        const boxH = 140;
        const boxY = H - boxH - 10;
        this._box = this.add.graphics().setDepth(11);
        this._box.fillStyle(0x030508, 0.97);
        this._box.fillRect(20, boxY, W - 40, boxH);
        this._box.lineStyle(1, 0x223344, 0.8);
        this._box.strokeRect(20, boxY, W - 40, boxH);
        this._box.lineStyle(1, 0x334455, 0.4);
        this._box.strokeRect(22, boxY + 2, W - 44, boxH - 4);

        // Portrait area (left side)
        this._portraitBg = this.add.graphics().setDepth(12);
        this._portraitBg.fillStyle(0x0a0f18, 1);
        this._portraitBg.fillRect(30, boxY + 8, 70, 70);
        this._portraitBg.lineStyle(1, 0x334455, 0.6);
        this._portraitBg.strokeRect(30, boxY + 8, 70, 70);

        this._portraitSprite = this.add.image(65, boxY + 43, 'leon')
            .setDisplaySize(50, 60).setDepth(13).setVisible(false);

        // Speaker name plate
        this._speakerBg = this.add.graphics().setDepth(12);
        this._speakerText = this.add.text(116, boxY + 12, '', {
            fontSize: '11px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#c8a040',
            letterSpacing: 4,
        }).setDepth(13);

        // Main text
        this._mainText = this.add.text(116, boxY + 34, '', {
            fontSize: '11px',
            fontFamily: 'Share Tech Mono, monospace',
            color: '#d8d0c8',
            wordWrap: { width: W - 160 },
            lineSpacing: 5,
        }).setDepth(13);

        // Line counter
        this._counterText = this.add.text(W - 30, boxY + boxH - 18, '', {
            fontSize: '9px', fontFamily: 'Share Tech Mono', color: '#444',
        }).setOrigin(1, 0).setDepth(13);

        // Advance prompt
        this._promptText = this.add.text(W - 30, boxY + boxH - 20, '▶', {
            fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#888870',
        }).setOrigin(1, 1).setDepth(13).setAlpha(0);
        this.tweens.add({
            targets: this._promptText,
            alpha: { from: 0.2, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        // Input
        this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);

        this._spaceKey.on('down', () => this._advance());
        this._enterKey.on('down', () => this._advance());
        this._escKey.on('down', () => this._skipAll());

        // Start
        this.cameras.main.fadeIn(200, 0, 0, 0);
        this.time.delayedCall(100, () => this._showLine());
    }

    _showLine() {
        if (this._lineIndex >= this._lines.length) {
            this._closeDialogue();
            return;
        }

        const line = this._lines[this._lineIndex];
        this._canAdvance = false;

        // Speaker colors
        const speakerColors = {
            LEON: '#c8a040', LEON_A: '#c8a040', LEON_B: '#a09030',
            BARRY: '#c07030', LUCIA: '#88aac0',
            SYSTEM: '#446688', USSTRATCOM: '#4488aa',
            EXAMINE: '#88aacc',
        };

        const speakerName = line.speaker || '';
        const textColor = speakerColors[speakerName] || '#c8a040';

        // Portrait
        const portraitKeys = {
            LEON: 'leon', LEON_A: 'leon', LEON_B: 'leon_hurt',
            BARRY: 'barry', LUCIA: 'lucia',
        };
        const portraitKey = line.portrait || portraitKeys[speakerName];

        if (portraitKey && this.textures.exists(portraitKey)) {
            this._portraitSprite.setTexture(portraitKey).setVisible(true);
        } else {
            this._portraitSprite.setVisible(false);
        }

        // Speaker text
        const displayNames = {
            LEON: '— LEON —', LEON_A: '— LEON (?) —', LEON_B: '— LEON (?) —',
            BARRY: '— BARRY —', LUCIA: '— LUCIA —',
            SYSTEM: '', USSTRATCOM: '— USSTRATCOM —', EXAMINE: '[ EXAMINE ]',
        };
        this._speakerText.setText(displayNames[speakerName] || `— ${speakerName} —`);
        this._speakerText.setColor(textColor);

        // Line style
        const styleColors = {
            system: '#888880', highlight: '#ffcc44', red: '#cc3333',
            dim: '#555550', action: '#6688aa', examine: '#88aacc',
        };
        const textStyle = line.style ? styleColors[line.style] : '#d8d0c8';

        this._mainText.setText('');
        this._mainText.setColor(textStyle);

        // Counter
        this._counterText.setText(`${this._lineIndex + 1}/${this._lines.length}`);

        // Typewriter effect
        const fullText = line.text;
        let charIdx = 0;
        const speed = line.style === 'highlight' ? 45 : line.style === 'system' ? 20 : 28;

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
        }, speed);
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

    _skipAll() {
        if (this._typeInterval) clearInterval(this._typeInterval);
        this._closeDialogue();
    }

    _closeDialogue() {
        this.cameras.main.fadeOut(200, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this.scene.stop();
                if (this._onComplete) this._onComplete();
                EventSystem.emit('dialogue_closed', { dialogueId: this._dialogueId });
            }
        });
    }

    shutdown() {
        if (this._typeInterval) {
            clearInterval(this._typeInterval);
            this._typeInterval = null;
        }
    }
}
