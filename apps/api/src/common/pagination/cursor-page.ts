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

export class CursorPage {
  public static encode(payload: CursorPayload): string {
    const raw = JSON.stringify({
      order: String(payload.order),
      id: payload.id,
    });
    return Buffer.from(raw, 'utf-8').toString('base64url');
  }

  public static decode(cursor: string): CursorPayload | null {
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
    } catch {
      return null;
    }
  }

  public static create<T extends { id: string; order?: unknown }>(
    items: T[],
    limit: number,
    total?: number,
  ): CursorPageResult<T> {
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const lastItem = data[data.length - 1];

    let nextCursor: string | null = null;
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
