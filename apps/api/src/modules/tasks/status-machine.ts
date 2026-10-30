import { TaskStatus } from '@prisma/client';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

const LEGAL_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.DONE],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.BLOCKED, TaskStatus.DONE],
  [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS], // Cannot jump directly from BLOCKED to DONE
  [TaskStatus.DONE]: [TaskStatus.TODO],
};

export function canTransition(currentStatus: TaskStatus, targetStatus: TaskStatus): boolean {
  if (currentStatus === targetStatus) {
    return true;
  }
  return (LEGAL_TRANSITIONS[currentStatus] || []).includes(targetStatus);
}

export function validateStatusTransition(currentStatus: TaskStatus, targetStatus: TaskStatus): void {
  if (currentStatus === targetStatus) {
    return;
  }

  const allowed = LEGAL_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new AppError(
      ErrorCode.UNPROCESSABLE,
      `Illegal task status transition from '${currentStatus}' to '${targetStatus}'.`,
      422,
      [{ field: 'status', issue: `Transition not allowed from ${currentStatus} to ${targetStatus}` }],
    );
  }
}
