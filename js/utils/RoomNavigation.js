/** Shared room geometry for companion routes and unobstructed attacks. */
const RoomNavigation = {
    isWalkable(room, tx, ty) {
        if (!room || tx < 0 || ty < 0 || tx >= room.tileWidth || ty >= room.tileHeight) return false;
        if (Object.values(room.connections || {}).some(c => c.tx === tx && c.ty === ty)) return true;
        return ![1, 3, 6, 7].includes(room.tiles[ty][tx]);
    },

    hasLineOfSight(room, ax, ay, bx, by, padding = 0) {
        if (!room) return false;
        const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 4));
        for (let step = 0; step <= steps; step++) {
            const x = ax + (bx - ax) * step / steps, y = ay + (by - ay) * step / steps;
            for (const dx of padding ? [-padding, padding] : [0]) {
                for (const dy of padding ? [-padding, padding] : [0]) {
                    if (!this.isWalkable(room, Math.floor((x + dx) / CONFIG.TILE_SIZE), Math.floor((y + dy) / CONFIG.TILE_SIZE))) return false;
                }
            }
        }
        return true;
    },

    findPath(room, fromX, fromY, toX, toY) {
        const S = CONFIG.TILE_SIZE;
        const start = [Math.floor(fromX / S), Math.floor(fromY / S)];
        const target = [Math.floor(toX / S), Math.floor(toY / S)];
        if (!this.isWalkable(room, ...start) || !this.isWalkable(room, ...target)) return [];
        const queue = [start], parents = new Map([[start.join(','), null]]);
        for (let i = 0; i < queue.length; i++) {
            const [x, y] = queue[i];
            if (x === target[0] && y === target[1]) {
                const path = []; let key = `${x},${y}`;
                while (key !== null) {
                    const [tx, ty] = key.split(',').map(Number);
                    path.unshift({ x: tx * S + S / 2, y: ty * S + S / 2 });
                    key = parents.get(key);
                }
                return path;
            }
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const tx = x + dx, ty = y + dy, key = `${tx},${ty}`;
                if (!parents.has(key) && this.isWalkable(room, tx, ty)) {
                    parents.set(key, `${x},${y}`); queue.push([tx, ty]);
                }
            }
        }
        return [];
    },

    nearestFloor(room, x, y) {
        let nearest = null, distance = Infinity;
        for (let ty = 0; ty < room.tileHeight; ty++) for (let tx = 0; tx < room.tileWidth; tx++) {
            if (!this.isWalkable(room, tx, ty)) continue;
            const d = Math.hypot(tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - x,
                ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - y);
            if (d < distance) { distance = d; nearest = { tx, ty }; }
        }
        return nearest;
    },
};
