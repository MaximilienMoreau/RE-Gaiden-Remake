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
        this._closing = false;
        this._canAdvance = false;
        this._dialogueId = data.dialogueId;
        this._singleText = data.singleText;
        this._npcId = data.npcId;
        this._callerScene = data.callerScene || CONFIG.SCENES.GAME;
        this._onComplete = data.onComplete;
        this._fileId = data.fileId;
        this._cinematicBackdrop = !!data.cinematicBackdrop;
    }

    create() {
        this.scene.bringToTop();
        this.events.once('shutdown', this.shutdown, this);
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
        this._lines = this._prepareLines(this._lines);
        this._lineIndex = 0;

        // Semi-transparent overlay
        this._overlay = this.add.graphics();
        this._overlay.fillStyle(0x000000, this._cinematicBackdrop ? 0.18 : 0.6);
        this._overlay.fillRect(0, 0, W, H);

        // Cinematic bars
        this._topBar = this.add.rectangle(W / 2, 35, W, 70, 0x000000).setDepth(10);
        this._bottomBar = this.add.rectangle(W / 2, H - 35, W, 70, 0x000000).setDepth(10);

        // Dialogue box
        const boxH = 172;
        const boxY = H - boxH - 24;
        this._box = UITheme.panel(this, 24, boxY, W - 48, boxH).setDepth(11);

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
            fontSize: '14px',
            fontFamily: UITheme.font,
            color: '#c8a040',
            letterSpacing: 4,
        }).setDepth(13);

        // Main text
        this._mainText = this.add.text(116, boxY + 34, '', {
            fontSize: '14px',
            fontFamily: UITheme.font,
            color: '#e2e7ed',
            wordWrap: { width: W - 160 },
            lineSpacing: 5,
        }).setDepth(13);

        // Paginate documents using the actual font and available text width.
        // Five lines fit above the dialogue prompts, including line spacing.
        this._paginateLines();

        // Line counter
        this._counterText = this.add.text(W - 30, boxY + boxH - 18, '', {
            fontSize: '9px', fontFamily: UITheme.font, color: '#8492a3',
        }).setOrigin(1, 0).setDepth(13);

        // Advance prompt
        this._promptText = this.add.text(W - 30, boxY + boxH - 20, '▶', {
            fontSize: '12px', fontFamily: UITheme.font, color: '#888870',
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
        this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this._spaceKey.on('down', () => this._advance());
        this._enterKey.on('down', () => this._advance());
        this._escKey.on('down', () => this._skipAll());

        // Start
        this.cameras.main.fadeIn(200, 0, 0, 0);
        this.time.delayedCall(100, () => this._showLine());
    }

    _prepareLines(lines) {
        const state = SaveSystem.getState();
        const handgunOwned = InventorySystem.hasItem('handgun');
        const handgunStored = InventorySystem.getItemBox().some(item => item.id === 'handgun');
        const handgunCollected = Object.values(MAPS).some(room => room.objects.some((obj, index) =>
            obj.itemId === 'handgun' && SaveSystem.isItemCollected(room.id, index)));
        const conditions = {
            leon_present: SaveSystem.getFlag(CONFIG.FLAGS.ACT1_LEON_FOUND),
            lucia_present: SaveSystem.getFlag(CONFIG.FLAGS.ACT2_LUCIA_LOCATED),
            handgun_owned: handgunOwned,
            handgun_stored: !handgunOwned && handgunStored,
            handgun_lost: !handgunOwned && !handgunStored && !!handgunCollected,
            handgun_missing: !handgunOwned && !handgunStored && !handgunCollected,
        };
        conditions.leon_absent = !conditions.leon_present;
        conditions.lucia_absent = !conditions.lucia_present;
        for (const id of ['note_leon', 'lucia_letter', 'umbrella_memo']) {
            conditions[`read_${id}`] = !!state?.flags?.[`file_read_${id}`];
            conditions[`unread_${id}`] = !conditions[`read_${id}`];
        }
        return lines.filter(line => !line.condition || conditions[line.condition] === true).map(line => {
            if (line.variant !== 'ready_weapon') return { ...line };
            const weapon = InventorySystem.getEquippedWeapon();
            let text = '[Barry keeps his hands ready and steps in front of Lucia.]';
            if (weapon?.def?.subtype === 'melee') text = '[Barry draws his combat knife and keeps Lucia behind him.]';
            else if (weapon?.def?.subtype === 'gun') {
                text = weapon.ammo > 0 ? `[Barry raises his ${weapon.def.name}.]` :
                    `[Barry grips his empty ${weapon.def.name}, keeping his knife within reach.]`;
            }
            return { ...line, text };
        });
    }

    _paginateLines() {
        this._lines = this._lines.flatMap(line => {
            const wrapped = this._mainText.getWrappedText(line.text);
            const pages = [];
            for (let i = 0; i < wrapped.length; i += 5) {
                pages.push({ ...line, text: wrapped.slice(i, i + 5).join('\n') });
            }
            return pages.length ? pages : [line];
        });
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
        const textStyle = line.style ? styleColors[line.style] : '#e2e7ed';

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
        if (this._closing) return;
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
        if (this._closing) return;
        this._closing = true;
        if (this._typeInterval) clearInterval(this._typeInterval);
        this._typeInterval = null;
        this.cameras.main.fadeOut(200, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                if (InventorySystem._getDef(this._fileId)?.type === 'file') {
                    SaveSystem.setFlag(`file_read_${this._fileId}`);
                }
                this.scene.stop();
                EventSystem.emit('dialogue_closed', { dialogueId: this._dialogueId });
                if (this._onComplete) this._onComplete();
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
