import { assembleTemplatePrompt, hashSnapshot, isAllowedModel, sanitizeMarkdown } from './prompt-builder';

describe('prompt builder', () => {
  it('strips html from markdown', () => {
    expect(sanitizeMarkdown('Hello <script>alert(1)</script><b>bold</b>')).toBe('Hello bold');
  });

  it('does not invent paths when context is empty', () => {
    const text = assembleTemplatePrompt({
      taskTitle: 'Fix navbar',
      visionAnalyzed: false,
    });
    expect(text).toContain('# Task: Fix navbar');
    expect(text).toContain('## Role');
    expect(text).toContain('## Project context');
    expect(text).toContain('No project context');
    expect(text).toContain('Images were not analyzed');
    expect(text).toContain('No external model was called');
    expect(text).not.toMatch(/apps\/mobile\/src\/fake/);
  });

  it('hashes stably and allows known models only', () => {
    const facts = { taskTitle: 'A', visionAnalyzed: false };
    expect(hashSnapshot(facts)).toBe(hashSnapshot(facts));
    expect(isAllowedModel('gpt-4o-mini')).toBe(true);
    expect(isAllowedModel('gpt-3.5-turbo')).toBe(false);
  });
});
