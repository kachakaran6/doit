import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/priority_dot.dart';
import '../models/task.dart';

class TaskRow extends StatelessWidget {
  final TaskViewModel task;
  final VoidCallback onTap;
  final VoidCallback onToggleStatus;

  const TaskRow({
    super.key,
    required this.task,
    required this.onTap,
    required this.onToggleStatus,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final isDone = task.status == TaskStatus.done;

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Checkbox Toggle
          GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              onToggleStatus();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isDone ? tokens.success : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: isDone ? tokens.success : tokens.textMuted.withAlpha(120),
                  width: 1.5,
                ),
              ),
              child: isDone
                  ? const Icon(LucideIcons.check, size: 14, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: AppSpacing.md),

          // Priority indicator
          PriorityDot(priority: TaskViewModel.priorityToString(task.priority)),
          const SizedBox(width: AppSpacing.sm),

          // Title & Human ID
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    AppText(
                      task.humanId,
                      variant: TextVariant.tiny,
                      colorType: TextColorType.tertiary,
                      fontWeight: FontWeight.w700,
                    ),
                    if (task.dueDate != null) ...[
                      const SizedBox(width: AppSpacing.xs),
                      Icon(LucideIcons.calendar, size: 11, color: tokens.textTertiary),
                      const SizedBox(width: 2),
                      AppText(
                        task.dueDate!,
                        variant: TextVariant.tiny,
                        colorType: TextColorType.tertiary,
                      ),
                    ],
                    if (task.isPending) ...[
                      const SizedBox(width: AppSpacing.xs),
                      Icon(LucideIcons.cloudOff, size: 11, color: tokens.warning),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                AppText(
                  task.title,
                  variant: TextVariant.bodyMedium,
                  fontWeight: FontWeight.w600,
                  strikethrough: isDone,
                  colorType: isDone ? TextColorType.tertiary : TextColorType.primary,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          // Assignee Avatar
          if (task.assignee != null)
            Padding(
              padding: const EdgeInsets.only(left: AppSpacing.sm),
              child: AppAvatar(
                name: task.assignee!.name,
                avatarUrl: task.assignee!.avatarUrl,
                size: 26,
              ),
            ),
        ],
      ),
    );
  }
}
