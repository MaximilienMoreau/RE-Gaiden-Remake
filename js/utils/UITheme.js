/** Shared visual language for menus and in-game overlays. */
const UITheme = {
    font: 'Inter, Arial, sans-serif',
    displayFont: 'Oswald, Impact, sans-serif',
    mono: 'Share Tech Mono, monospace',
    colors: { background: 0x080c12, panel: 0x101721, border: 0x2b3542, accent: 0xd65a54 },

    panel(scene, x, y, width, height, { alpha = 0.96, accent = false } = {}) {
        const g = scene.add.graphics();
        g.fillStyle(0x000000, 0.22);
        g.fillRoundedRect(x, y + 8, width, height, 12);
        g.fillStyle(this.colors.panel, alpha);
        g.fillRoundedRect(x, y, width, height, 12);
        g.lineStyle(1, this.colors.border, 0.9);
        g.strokeRoundedRect(x, y, width, height, 12);
        if (accent) {
            g.fillStyle(this.colors.accent);
            g.fillRoundedRect(x + 18, y + 20, 3, 24, 1);
        }
        return g;
    },
};
