import { extractInviteToken, shouldHandleAsInvite } from './invite-link';

describe('invite links', () => {
  it('ignores launcher and empty urls', () => {
    expect(extractInviteToken(null)).toBeNull();
    expect(extractInviteToken('')).toBeNull();
    expect(extractInviteToken('doit://')).toBeNull();
    expect(extractInviteToken('https://samyukt.com/')).toBeNull();
    expect(extractInviteToken('https://samyukt.com/invite')).toBeNull();
    expect(extractInviteToken('doit://invite/undefined')).toBeNull();
    expect(shouldHandleAsInvite('https://app.samyukt.com/home')).toBe(false);
  });

  it('accepts a real invite token', () => {
    expect(extractInviteToken('https://samyukt.com/invite/abc12345token')).toBe('abc12345token');
    expect(extractInviteToken('doit://invite/abc12345token')).toBe('abc12345token');
  });
});
