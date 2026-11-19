import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../../workspace/widgets/project_switcher_sheet.dart';
import '../providers/tasks_provider.dart';
import '../widgets/task_row.dart';
import '../widgets/kanban_board_view.dart';
import '../widgets/task_create_sheet.dart';

class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);
    final tasksState = ref.watch(tasksProvider);
    final tasks = tasksState.filteredTasks;

    final noDateTasks = tasks.where((t) => t.dueDate == null).toList();
    final todayTasks = tasks.where((t) => t.dueDate != null).toList();

    return Scaffold(
      backgroundColor: tokens.canvas,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Header Bar matching 02_Tasks_Board.png
            Padding(
              padding: const EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                top: AppSpacing.md,
                bottom: AppSpacing.xs,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          AppText(
                            'Tasks',
                            variant: TextVariant.display,
                            fontWeight: FontWeight.w800,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: tokens.surface3,
                              borderRadius: AppRadius.borderFull,
                            ),
                            child: AppText(
                              '${tasksState.tasks.length}',
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w700,
                              colorType: TextColorType.secondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      // Project Dropdown Trigger
                      GestureDetector(
                        onTap: () {
                          AppSheet.show(
                            context: context,
                            builder: (_) => const ProjectSwitcherSheet(),
                          );
                        },
                        child: Row(
                          children: [
                            AppText(
                              wsState.activeProject?.name ?? 'General',
                              variant: TextVariant.bodySmall,
                              colorType: TextColorType.secondary,
                              fontWeight: FontWeight.w600,
                            ),
                            const SizedBox(width: 4),
                            Icon(LucideIcons.chevronDown, size: 14, color: tokens.textSecondary),
                          ],
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      // View Mode Toggle (List vs Board)
                      Container(
                        decoration: BoxDecoration(
                          color: tokens.surface2,
                          borderRadius: AppRadius.borderMd,
                          border: Border.all(color: tokens.hairline),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: Row(
                          children: [
                            _buildViewModeButton(
                              context,
                              icon: LucideIcons.list,
                              isSelected: tasksState.viewMode == TaskViewMode.list,
                              onTap: () => ref.read(tasksProvider.notifier).setViewMode(TaskViewMode.list),
                            ),
                            _buildViewModeButton(
                              context,
                              icon: LucideIcons.columns2,
                              isSelected: tasksState.viewMode == TaskViewMode.board,
                              onTap: () => ref.read(tasksProvider.notifier).setViewMode(TaskViewMode.board),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      IconButton(
                        icon: Icon(LucideIcons.trash2, size: 20, color: tokens.textTertiary),
                        onPressed: () => context.push('/trash'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Filter Chips Bar (All, My day, Inbox, Upcoming)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
              child: Row(
                children: [
                  AppChip(
                    label: 'All',
                    isSelected: tasksState.activeFilter == TaskFilterTab.all,
                    onTap: () => ref.read(tasksProvider.notifier).setFilter(TaskFilterTab.all),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'My day',
                    isSelected: tasksState.activeFilter == TaskFilterTab.myDay,
                    onTap: () => ref.read(tasksProvider.notifier).setFilter(TaskFilterTab.myDay),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'Inbox',
                    isSelected: tasksState.activeFilter == TaskFilterTab.done,
                    onTap: () => ref.read(tasksProvider.notifier).setFilter(TaskFilterTab.done),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'Upcoming',
                    isSelected: tasksState.activeFilter == TaskFilterTab.upcoming,
                    onTap: () => ref.read(tasksProvider.notifier).setFilter(TaskFilterTab.upcoming),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Content Area (List or Board)
            Expanded(
              child: tasksState.isLoading && tasks.isEmpty
                  ? Center(child: CircularProgressIndicator(color: tokens.accent))
                  : tasksState.viewMode == TaskViewMode.board
                      ? KanbanBoardView(
                          onTaskTap: (t) => context.push('/task/${t.id}'),
                        )
                      : RefreshIndicator(
                          onRefresh: () => ref.read(tasksProvider.notifier).fetchTasks(),
                          color: tokens.accent,
                          child: tasks.isEmpty
                              ? EmptyState(
                                  icon: LucideIcons.checkSquare,
                                  title: 'No tasks found',
                                  message: 'All tasks in this view have been completed!',
                                  actionLabel: 'Create Task',
                                  onAction: () {
                                    AppSheet.show(
                                      context: context,
                                      builder: (_) => const TaskCreateSheet(),
                                    );
                                  },
                                )
                              : ListView(
                                  padding: const EdgeInsets.only(
                                    left: AppSpacing.lg,
                                    right: AppSpacing.lg,
                                    top: AppSpacing.xs,
                                    bottom: 120,
                                  ),
                                  children: [
                                    if (todayTasks.isNotEmpty) ...[
                                      _buildSectionHeader(context, 'DUE TODAY', todayTasks.length),
                                      ...todayTasks.map((task) => TaskRow(
                                            task: task,
                                            onTap: () => context.push('/task/${task.id}'),
                                            onToggleStatus: () {
                                              ref.read(tasksProvider.notifier).toggleTaskStatus(task.id);
                                            },
                                          )),
                                      const SizedBox(height: AppSpacing.md),
                                    ],
                                    if (noDateTasks.isNotEmpty) ...[
                                      _buildSectionHeader(context, 'NO DATE', noDateTasks.length),
                                      ...noDateTasks.map((task) => TaskRow(
                                            task: task,
                                            onTap: () => context.push('/task/${task.id}'),
                                            onToggleStatus: () {
                                              ref.read(tasksProvider.notifier).toggleTaskStatus(task.id);
                                            },
                                          )),
                                    ],
                                  ],
                                ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, int count) {
    final tokens = context.tokens;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(LucideIcons.layers, size: 14, color: tokens.textTertiary),
              const SizedBox(width: AppSpacing.xs),
              AppText(
                title,
                variant: TextVariant.tiny,
                fontWeight: FontWeight.w700,
                colorType: TextColorType.tertiary,
              ),
            ],
          ),
          AppText(
            '$count',
            variant: TextVariant.tiny,
            fontWeight: FontWeight.w700,
            colorType: TextColorType.tertiary,
          ),
        ],
      ),
    );
  }

  Widget _buildViewModeButton(
    BuildContext context, {
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final tokens = context.tokens;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: isSelected ? tokens.surface3 : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(
          icon,
          size: 16,
          color: isSelected ? tokens.accentText : tokens.textTertiary,
        ),
      ),
    );
  }
}
