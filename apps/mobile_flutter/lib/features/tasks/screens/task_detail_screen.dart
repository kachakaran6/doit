import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../core/widgets/priority_dot.dart';
import '../../../core/widgets/app_avatar.dart';
import '../models/task.dart';
import '../providers/tasks_provider.dart';
import '../widgets/task_status_picker_sheet.dart';
import '../widgets/task_priority_picker_sheet.dart';
import '../widgets/solution_prompt_section.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final String taskId;

  const TaskDetailScreen({super.key, required this.taskId});

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final tasksState = ref.watch(tasksProvider);
    final task = tasksState.tasks.firstWhere(
      (t) => t.id == widget.taskId,
      orElse: () => TaskViewModel(
        id: widget.taskId,
        humanId: 'TASK',
        title: 'Task Not Found',
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        projectId: '',
      ),
    );

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          task.humanId,
          variant: TextVariant.titleSmall,
          fontWeight: FontWeight.w700,
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 20),
            color: tokens.danger,
            onPressed: () {
              ref.read(tasksProvider.notifier).deleteTask(task.id);
              context.pop();
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Title & Status Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: AppText(
                  task.title,
                  variant: TextVariant.titleLarge,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              StatusBadge(status: TaskViewModel.statusToString(task.status)),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Metadata Card: Project, Status, Priority, Due Date, Assignee
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
            child: Column(
              children: [
                // Status Row
                InkWell(
                  onTap: () {
                    AppSheet.show(
                      context: context,
                      builder: (_) => TaskStatusPickerSheet(
                        currentStatus: task.status,
                        onStatusSelected: (newStatus) {
                          ref.read(tasksProvider.notifier).updateTaskStatus(task.id, newStatus);
                        },
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppText(
                          'Status',
                          variant: TextVariant.bodyMedium,
                          colorType: TextColorType.secondary,
                        ),
                        Row(
                          children: [
                            StatusBadge(status: TaskViewModel.statusToString(task.status)),
                            const SizedBox(width: AppSpacing.xs),
                            Icon(LucideIcons.chevronRight, size: 16, color: tokens.textTertiary),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                Divider(color: tokens.hairline, height: 1),

                // Priority Row
                InkWell(
                  onTap: () {
                    AppSheet.show(
                      context: context,
                      builder: (_) => TaskPriorityPickerSheet(
                        currentPriority: task.priority,
                        onPrioritySelected: (newP) {
                          // update priority
                        },
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppText(
                          'Priority',
                          variant: TextVariant.bodyMedium,
                          colorType: TextColorType.secondary,
                        ),
                        Row(
                          children: [
                            PriorityDot(priority: TaskViewModel.priorityToString(task.priority)),
                            const SizedBox(width: AppSpacing.xs),
                            AppText(
                              TaskViewModel.priorityToString(task.priority),
                              variant: TextVariant.bodySmall,
                              fontWeight: FontWeight.w600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Icon(LucideIcons.chevronRight, size: 16, color: tokens.textTertiary),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                Divider(color: tokens.hairline, height: 1),

                // Due Date Row
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppText(
                        'Due Date',
                        variant: TextVariant.bodyMedium,
                        colorType: TextColorType.secondary,
                      ),
                      Row(
                        children: [
                          Icon(LucideIcons.calendar, size: 14, color: tokens.textTertiary),
                          const SizedBox(width: AppSpacing.xs),
                          AppText(
                            task.dueDate ?? 'No due date',
                            variant: TextVariant.bodySmall,
                            colorType: task.dueDate != null ? TextColorType.primary : TextColorType.tertiary,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (task.assignee != null) ...[
                  Divider(color: tokens.hairline, height: 1),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppText(
                          'Assignee',
                          variant: TextVariant.bodyMedium,
                          colorType: TextColorType.secondary,
                        ),
                        Row(
                          children: [
                            AppAvatar(
                              name: task.assignee!.name,
                              avatarUrl: task.assignee!.avatarUrl,
                              size: 24,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            AppText(
                              task.assignee!.name,
                              variant: TextVariant.bodySmall,
                              fontWeight: FontWeight.w600,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Description Section
          AppText(
            'Description',
            variant: TextVariant.bodySmall,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w600,
          ),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            child: AppText(
              task.description != null && task.description!.isNotEmpty
                  ? task.description!
                  : 'No description provided.',
              variant: TextVariant.bodyMedium,
              colorType: task.description != null && task.description!.isNotEmpty
                  ? TextColorType.primary
                  : TextColorType.tertiary,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Solution Prompt Section
          SolutionPromptSection(
            entityId: task.humanId,
            entityTitle: task.title,
            entityDescription: task.description,
            type: 'task',
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }
}
