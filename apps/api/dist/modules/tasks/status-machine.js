"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.validateStatusTransition = validateStatusTransition;
const client_1 = require("@prisma/client");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
const LEGAL_TRANSITIONS = {
    [client_1.TaskStatus.TODO]: [client_1.TaskStatus.IN_PROGRESS, client_1.TaskStatus.BLOCKED, client_1.TaskStatus.DONE],
    [client_1.TaskStatus.IN_PROGRESS]: [client_1.TaskStatus.TODO, client_1.TaskStatus.BLOCKED, client_1.TaskStatus.DONE],
    [client_1.TaskStatus.BLOCKED]: [client_1.TaskStatus.TODO, client_1.TaskStatus.IN_PROGRESS],
    [client_1.TaskStatus.DONE]: [client_1.TaskStatus.TODO],
};
function canTransition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) {
        return true;
    }
    return (LEGAL_TRANSITIONS[currentStatus] || []).includes(targetStatus);
}
function validateStatusTransition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) {
        return;
    }
    const allowed = LEGAL_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
        throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, `Illegal task status transition from '${currentStatus}' to '${targetStatus}'.`, 422, [{ field: 'status', issue: `Transition not allowed from ${currentStatus} to ${targetStatus}` }]);
    }
}
//# sourceMappingURL=status-machine.js.map