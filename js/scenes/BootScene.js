/**
 * BootScene - Generates all procedural assets, shows loading screen
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super(CONFIG.SCENES.BOOT);
    }

    preload() {
        // Nothing to load from files - all assets are generated
    }

    create() {
        // Init audio system
        AudioSynth.init();

        // Init save system
        if (!SaveSystem.getState()) {
            // Don't auto-create a game state here; title will handle it
        }

        // Generate all procedural textures
        this._loadingStep = 0;
        this._loadingSteps = [
            () => { AssetGenerator.generate(this); },
        ];

        this._runNextStep();
    }

    _runNextStep() {
        if (this._loadingStep < this._loadingSteps.length) {
            this._updateLoadingBar(this._loadingStep / this._loadingSteps.length);
            // Use timeout to allow rendering to update
            this.time.delayedCall(50, () => {
                try {
                    this._loadingSteps[this._loadingStep]();
                } catch (e) {
                    console.error('Asset generation error:', e);
                }
                this._loadingStep++;
                this._runNextStep();
            });
        } else {
            this._updateLoadingBar(1.0);
            this._updateLoadingText('READY');
            this.time.delayedCall(400, () => {
                this._hideLoadingScreen();
                this.scene.start(CONFIG.SCENES.TITLE);
            });
        }
    }

    _updateLoadingBar(progress) {
        const bar = document.getElementById('loading-bar');
        if (bar) bar.style.width = Math.floor(progress * 100) + '%';
    }

    _updateLoadingText(text) {
        const el = document.getElementById('loading-text');
        if (el) el.textContent = text;
    }

    _hideLoadingScreen() {
        const screen = document.getElementById('loading-screen');
        if (screen) {
            screen.classList.add('hidden');
            setTimeout(() => {
                screen.style.display = 'none';
            }, 1100);
        }
    }
}
