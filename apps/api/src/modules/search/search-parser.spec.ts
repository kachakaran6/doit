import { parseSearchQuery } from './search-parser';

describe('Search Query Parser', () => {
  it('1. should parse #label operator', () => {
    const res = parseSearchQuery('#crash');
    expect(res.labels).toEqual(['crash']);
    expect(res.freeText).toBe('');
  });

  it('2. should parse @assignee operator', () => {
    const res = parseSearchQuery('@john');
    expect(res.assignees).toEqual(['john']);
    expect(res.freeText).toBe('');
  });

  it('3. should parse is:bug operator', () => {
    const res = parseSearchQuery('is:bug');
    expect(res.type).toBe('BUG');
  });

  it('4. should parse is:done operator', () => {
    const res = parseSearchQuery('is:done');
    expect(res.status).toBe('DONE');
  });

  it('5. should parse due:today operator', () => {
    const res = parseSearchQuery('due:today');
    expect(res.due).toBe('today');
  });

  it('6. should parse project:<key> operator', () => {
    const res = parseSearchQuery('project:smp');
    expect(res.projectKey).toBe('SMP');
  });

  it('7. should combine search free text with multiple operators: "login is:bug #crash"', () => {
    const res = parseSearchQuery('login is:bug #crash');
    expect(res.freeText).toBe('login');
    expect(res.type).toBe('BUG');
    expect(res.labels).toEqual(['crash']);
  });

  it('8. should parse combined operators: "checkout @me is:task due:overdue project:MOB"', () => {
    const res = parseSearchQuery('checkout @me is:task due:overdue project:MOB');
    expect(res.freeText).toBe('checkout');
    expect(res.assignees).toEqual(['me']);
    expect(res.type).toBe('TASK');
    expect(res.due).toBe('overdue');
    expect(res.projectKey).toBe('MOB');
  });

  it('9. should handle malformed solo hash "#" or solo at "@" as free text', () => {
    const res = parseSearchQuery('# @');
    expect(res.labels).toEqual([]);
    expect(res.assignees).toEqual([]);
    expect(res.freeText).toBe('# @');
  });

  it('10. should handle malformed "is:" or "due:" without value as free text', () => {
    const res = parseSearchQuery('is: due:');
    expect(res.type).toBeUndefined();
    expect(res.status).toBeUndefined();
    expect(res.due).toBeUndefined();
    expect(res.freeText).toBe('is: due:');
  });

  it('11. should treat unknown operators as free text', () => {
    const res = parseSearchQuery('foo:bar something:else');
    expect(res.freeText).toBe('foo:bar something:else');
  });

  it('12. should handle empty string or spaces gracefully', () => {
    const res = parseSearchQuery('   ');
    expect(res.freeText).toBe('');
    expect(res.labels).toEqual([]);
  });

  it('13. should handle mixed case and multiple labels "#crash #ui #p0"', () => {
    const res = parseSearchQuery('#crash #UI #P0');
    expect(res.labels).toEqual(['crash', 'UI', 'P0']);
  });
});
