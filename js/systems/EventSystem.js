/**
 * EventSystem - Simple pub/sub event bus for cross-system communication
 */
const EventSystem = {
    _handlers: {},

    on(event, handler, context = null) {
        if (!this._handlers[event]) this._handlers[event] = [];
        this._handlers[event].push({ handler, context });
    },

    off(event, handler) {
        if (!this._handlers[event]) return;
        this._handlers[event] = this._handlers[event].filter(h => h.handler !== handler);
    },

    emit(event, data = {}) {
        if (!this._handlers[event]) return;
        for (const { handler, context } of this._handlers[event]) {
            handler.call(context, data);
        }
    },

    clear() {
        this._handlers = {};
    },
};
