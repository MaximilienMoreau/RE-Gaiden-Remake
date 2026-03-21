/**
 * RE Gaiden Remake - Main Entry Point
 */
window.addEventListener('load', () => {
    const gameConfig = {
        type: Phaser.AUTO,
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
        backgroundColor: '#000000',
        parent: 'phaser-game',
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
