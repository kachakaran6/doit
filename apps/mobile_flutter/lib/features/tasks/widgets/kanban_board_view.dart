import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/priority_dot.dart';
import '../models/task.dart';
import '../providers/tasks_provider.dart';

class KanbanBoardView extends ConsumerWidget {
  final ValueChanged<TaskViewModel> onTaskTap;

  const KanbanBoardView({super.key, required this.onTaskTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksState = ref.watch(tasksProvider);
    final tasks = tasksState.filteredTasks;

    final columns = [
      _ColumnDef('To Do', TaskStatus.todo, tasks.where((t) => t.status == TaskStatus.todo).toList()),
      _ColumnDef('In Progress', TaskStatus.inProgress, tasks.where((t) => t.status == TaskStatus.inProgress).toList()),
      _ColumnDef('Blocked', TaskStatus.blocked, tasks.where((t) => t.status == TaskStatus.blocked).toList()),
      _ColumnDef('Done', TaskStatus.done, tasks.where((t) => t.status == TaskStatus.done).toList()),
    ];

    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      itemCount: columns.length,
      itemBuilder: (context, colIndex) {
        final col = columns[colIndex];
        return _buildColumn(context, ref, col);
      },
    );
  }

  Widget _buildColumn(BuildContext context, WidgetRef ref, _ColumnDef col) {
    final tokens = context.tokens;
    final screenWidth = MediaQuery.of(context).size.width;
    final columnWidth = screenWidth * 0.78;

    return Container(
      width: columnWidth,
      margin: const EdgeInsets.only(right: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: tokens.surface2.withAlpha(140),
        borderRadius: AppRadius.borderXl,
        border: Border.all(color: tokens.hairline, width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Column Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  AppText(
                    col.title,
                    variant: TextVariant.titleSmall,
                    fontWeight: FontWeight.w700,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: tokens.surface3,
                      borderRadius: AppRadius.borderFull,
                    ),
                    child: AppText(
                      '${col.tasks.length}',
                      variant: TextVariant.tiny,
                      fontWeight: FontWeight.w700,
                      colorType: TextColorType.secondary,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(LucideIcons.plus, size: 18),
                color: tokens.textMuted,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () {
                  ref.read(tasksProvider.notifier).createTask(
                        title: 'New ${col.title} item',
                      );
                },
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Cards list
          Expanded(
            child: col.tasks.isEmpty
                ? Center(
                    child: AppText(
                      'No tasks here',
                      variant: TextVariant.caption,
                      colorType: TextColorType.muted,
                    ),
                  )
                : ListView.builder(
                    itemCount: col.tasks.length,
                    itemBuilder: (context, taskIndex) {
                      final task = col.tasks[taskIndex];
                      return AppCard(
                        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        onTap: () => onTaskTap(task),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                AppText(
                                  task.humanId,
                                  variant: TextVariant.tiny,
                                  colorType: TextColorType.tertiary,
                                  fontWeight: FontWeight.w700,
                                ),
                                PriorityDot(
                                  priority: TaskViewModel.priorityToString(task.priority),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            AppText(
                              task.title,
                              variant: TextVariant.bodyMedium,
                              fontWeight: FontWeight.w600,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (task.dueDate != null) ...[
                              const SizedBox(height: AppSpacing.sm),
                              Row(
                                children: [
                                  Icon(LucideIcons.calendar, size: 12, color: tokens.textTertiary),
                                  const SizedBox(width: 4),
                                  AppText(
                                    task.dueDate!,
                                    variant: TextVariant.tiny,
                                    colorType: TextColorType.secondary,
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ColumnDef {
  final String title;
  final TaskStatus status;
  final List<TaskViewModel> tasks;

  _ColumnDef(this.title, this.status, this.tasks);
}
