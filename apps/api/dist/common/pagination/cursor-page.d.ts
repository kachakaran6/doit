export interface CursorPayload {
    order: string | number;
    id: string;
}
export interface CursorPageMeta {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
}
export interface CursorPageResult<T> {
    data: T[];
    meta: CursorPageMeta;
}
export declare class CursorPage {
    static encode(payload: CursorPayload): string;
    static decode(cursor: string): CursorPayload | null;
    static create<T extends {
        id: string;
        order?: unknown;
    }>(items: T[], limit: number, total?: number): CursorPageResult<T>;
}
