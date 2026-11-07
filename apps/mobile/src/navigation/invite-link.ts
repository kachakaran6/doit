/**
 * Invitation routes are recognized only when a non-empty token is present.
 * Empty, missing, or placeholder tokens must not open the invitation screen.
 */
const PLACEHOLDERS = new Set(['undefined', 'null', 'invite', '']);
const consumedTokens = new Set<string>();

export function markInviteTokenConsumed(token: string | null | undefined): void {
  if (!token) return;
  consumedTokens.add(token.trim().toLowerCase());
}

export function isInviteTokenConsumed(token: string | null | undefined): boolean {
  if (!token) return true;
  return consumedTokens.has(token.trim().toLowerCase());
}

export function extractInviteToken(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let path = trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      path = parsed.pathname;
    } else {
      const host = parsed.hostname || '';
      path = `/${host}${parsed.pathname}`;
    }
  } catch {
    path = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  }

  const match = path.match(/(?:^|\/)invite\/([^/?#]+)/i);
  const rawToken = match?.[1];
  if (!rawToken) return null;
  let token = '';
  try {
    token = decodeURIComponent(rawToken).trim();
  } catch {
    return null;
  }
  if (PLACEHOLDERS.has(token.toLowerCase())) return null;
  if (token.length < 8) return null;
  if (consumedTokens.has(token.toLowerCase())) return null;
  return token;
}

export function shouldHandleAsInvite(url: string | null | undefined): boolean {
  return extractInviteToken(url) !== null;
}
