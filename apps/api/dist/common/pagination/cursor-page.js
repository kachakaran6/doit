"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorPage = void 0;
class CursorPage {
    static encode(payload) {
        const raw = JSON.stringify({
            order: String(payload.order),
            id: payload.id,
        });
        return Buffer.from(raw, 'utf-8').toString('base64url');
    }
    static decode(cursor) {
        try {
            const raw = Buffer.from(cursor, 'base64url').toString('utf-8');
            const parsed = JSON.parse(raw);
            if (typeof parsed.id === 'string' && (typeof parsed.order === 'string' || typeof parsed.order === 'number')) {
                return {
                    order: parsed.order,
                    id: parsed.id,
                };
            }
            return null;
        }
        catch {
            return null;
        }
    }
    static create(items, limit, total) {
        const hasMore = items.length > limit;
        const data = hasMore ? items.slice(0, limit) : items;
        const lastItem = data[data.length - 1];
        let nextCursor = null;
        if (hasMore && lastItem) {
            nextCursor = CursorPage.encode({
                order: String(lastItem.order ?? 0),
                id: lastItem.id,
            });
        }
        return {
            data,
            meta: {
                nextCursor,
                hasMore,
                total,
            },
        };
    }
}
exports.CursorPage = CursorPage;
//# sourceMappingURL=cursor-page.js.map