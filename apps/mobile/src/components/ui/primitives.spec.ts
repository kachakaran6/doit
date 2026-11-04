import { toSentenceCase } from './Chip';
import { BRAND_GRADIENT_START, BRAND_GRADIENT_END } from './ProgressRing';

describe('Milestone M2: Borderless UI Primitives (§Phase L2)', () => {
  describe('Chip sentence case enforcement (§Defect B3)', () => {
    it('converts screaming uppercase labels to sentence case', () => {
      expect(toSentenceCase('ACTIVE_PROJECT')).toBe('Active project');
      expect(toSentenceCase('TODO')).toBe('Todo');
      expect(toSentenceCase('IN_PROGRESS')).toBe('In progress');
      expect(toSentenceCase('HIGH')).toBe('High');
      expect(toSentenceCase('CRITICAL_BUG')).toBe('Critical bug');
    });

    it('handles empty and single-word strings safely', () => {
      expect(toSentenceCase('')).toBe('');
      expect(toSentenceCase('all')).toBe('All');
      expect(toSentenceCase('TASKS')).toBe('Tasks');
    });
  });

  describe('ProgressRing brand gradient constants', () => {
    it('provides verified brand gradient colors', () => {
      expect(BRAND_GRADIENT_START).toBe('#6E97FF');
      expect(BRAND_GRADIENT_END).toBe('#2E48D9');
    });
  });
});
