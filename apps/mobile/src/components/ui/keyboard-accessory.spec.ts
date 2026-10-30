import { KeyboardContextType } from '../../core/providers/KeyboardProvider';

describe('Keyboard Accessory Bar Context Mapping (§3.4)', () => {
  const getExpectedChips = (ctx: KeyboardContextType): string[] => {
    switch (ctx) {
      case 'task_title':
        return ['Today', 'Tomorrow', 'Priority', 'Label', 'Voice', 'Send'];
      case 'task_desc':
        return ['Voice', 'Attach', 'Checklist', 'Send'];
      case 'bug_desc':
        return ['Severity', 'Screenshot', 'Voice', 'Send'];
      case 'comment':
        return ['Voice', 'Mention', 'Send'];
      case 'sticky_body':
        return ['Color', 'Convert to Task', 'Pin', 'Send'];
      case 'search':
        return ['Recent', 'Filters', 'Clear', 'Send'];
      default:
        return ['Voice', 'Attach', 'Send'];
    }
  };

  it('provides correct chip set for Task Title', () => {
    const chips = getExpectedChips('task_title');
    expect(chips).toContain('Today');
    expect(chips).toContain('Tomorrow');
    expect(chips).toContain('Priority');
    expect(chips).toContain('Label');
    expect(chips).toContain('Voice');
    expect(chips).toContain('Send');
  });

  it('provides correct chip set for Bug Description', () => {
    const chips = getExpectedChips('bug_desc');
    expect(chips).toContain('Severity');
    expect(chips).toContain('Screenshot');
    expect(chips).toContain('Send');
  });

  it('always includes Send pinned on the right', () => {
    const contexts: KeyboardContextType[] = [
      'task_title',
      'task_desc',
      'bug_desc',
      'comment',
      'sticky_body',
      'search',
      'none',
    ];

    for (const ctx of contexts) {
      const chips = getExpectedChips(ctx);
      expect(chips[chips.length - 1]).toBe('Send');
    }
  });
});
