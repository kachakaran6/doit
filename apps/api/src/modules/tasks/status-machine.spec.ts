import { TaskStatus } from '@prisma/client';
import { validateStatusTransition, canTransition } from './status-machine';
import { AppError } from '../../common/errors/app.error';

describe('Task Status Machine', () => {
  it('should allow valid transitions', () => {
    expect(canTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TaskStatus.TODO, TaskStatus.BLOCKED)).toBe(true);
    expect(canTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE)).toBe(true);
    expect(canTransition(TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED)).toBe(true);
    expect(canTransition(TaskStatus.BLOCKED, TaskStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TaskStatus.DONE, TaskStatus.TODO)).toBe(true);
  });

  it('should reject invalid transition from BLOCKED directly to DONE with 422', () => {
    expect(canTransition(TaskStatus.BLOCKED, TaskStatus.DONE)).toBe(false);
    expect(() => validateStatusTransition(TaskStatus.BLOCKED, TaskStatus.DONE)).toThrow(AppError);
    try {
      validateStatusTransition(TaskStatus.BLOCKED, TaskStatus.DONE);
    } catch (err: unknown) {
      const appErr = err as AppError;
      expect(appErr.httpStatus).toBe(422);
      expect(appErr.code).toBe('UNPROCESSABLE');
    }
  });

  it('should reject invalid transition from DONE directly to IN_PROGRESS', () => {
    expect(canTransition(TaskStatus.DONE, TaskStatus.IN_PROGRESS)).toBe(false);
    expect(() => validateStatusTransition(TaskStatus.DONE, TaskStatus.IN_PROGRESS)).toThrow(AppError);
  });
});
