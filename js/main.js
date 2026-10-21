/**
 * RE Gaiden Remake - Main Entry Point
 */
window.addEventListener('load', async () => {
    if (document.fonts) {
        await Promise.race([
            Promise.allSettled([document.fonts.load('500 14px Inter'), document.fonts.load('600 80px Oswald'), document.fonts.load('12px "Share Tech Mono"')]),
            new Promise(resolve => setTimeout(resolve, 2000)),
        ]);
    }
    const gameConfig = {
        type: Phaser.AUTO,
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
        backgroundColor: '#000000',
        parent: 'phaser-game',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        pixelArt: false,
        antialias: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: CONFIG.DEBUG,
            },
        },
        scene: [
            BootScene,
            TitleScene,
            PrologueScene,
            GameScene,
            CombatScene,
            HUDScene,
            DialogueScene,
            InventoryScene,
            GameOverScene,
            EndingScene,
        ],
    };

    const game = new Phaser.Game(gameConfig);
    window.GAME = game;
});
