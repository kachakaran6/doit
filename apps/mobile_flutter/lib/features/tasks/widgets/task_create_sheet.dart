import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../../../core/widgets/app_chip.dart';
import '../models/task.dart';
import '../providers/tasks_provider.dart';
import '../../labels/widgets/label_manager_sheet.dart';

class TaskCreateSheet extends ConsumerStatefulWidget {
  const TaskCreateSheet({super.key});

  @override
  ConsumerState<TaskCreateSheet> createState() => _TaskCreateSheetState();
}

class _TaskCreateSheetState extends ConsumerState<TaskCreateSheet> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  TaskPriority _priority = TaskPriority.medium;
  final List<TaskLabel> _selectedLabels = [];
  bool _isSaving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _submit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    setState(() => _isSaving = true);
    await ref.read(tasksProvider.notifier).createTask(
          title: title,
          description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
          priority: _priority,
          labels: _selectedLabels,
        );
    if (mounted) Navigator.pop(context);
  }

  void _openLabelManager() {
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LabelManagerSheet(
        onLabelsChanged: (labels) {
          setState(() {
            _selectedLabels.clear();
            _selectedLabels.addAll(labels.map(
              (l) => TaskLabel(
                id: l.id,
                name: l.name,
                color: '#${l.color.toARGB32().toRadixString(16).substring(2)}',
              ),
            ));
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return AppSheet(
      title: 'Create Task',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            AppInput(
              controller: _titleController,
              hintText: 'What needs to be done?',
              autofocus: true,
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: AppSpacing.md),
            AppInput(
              controller: _descController,
              hintText: 'Add description (optional)...',
              maxLines: 3,
            ),
            const SizedBox(height: AppSpacing.md),

            // Priority Selector Chips
            AppText(
              'Priority',
              variant: TextVariant.caption,
              colorType: TextColorType.secondary,
              fontWeight: FontWeight.w600,
            ),
            const SizedBox(height: AppSpacing.xs),
            Wrap(
              spacing: AppSpacing.sm,
              children: TaskPriority.values.map((p) {
                final isSelected = _priority == p;
                return AppChip(
                  label: TaskViewModel.priorityToString(p),
                  isSelected: isSelected,
                  onTap: () => setState(() => _priority = p),
                );
              }).toList(),
            ),
            const SizedBox(height: AppSpacing.md),

            // Labels Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppText(
                  'Labels',
                  variant: TextVariant.caption,
                  colorType: TextColorType.secondary,
                  fontWeight: FontWeight.w600,
                ),
                GestureDetector(
                  onTap: _openLabelManager,
                  child: Row(
                    children: [
                      Icon(LucideIcons.tag, size: 12, color: tokens.accent),
                      const SizedBox(width: 4),
                      AppText('Manage Labels', variant: TextVariant.tiny, color: tokens.accent, fontWeight: FontWeight.w700),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: [
                ..._selectedLabels.map(
                  (l) => AppChip(
                    label: l.name,
                    isSelected: true,
                    onTap: () {
                      setState(() {
                        _selectedLabels.removeWhere((item) => item.id == l.id);
                      });
                    },
                  ),
                ),
                GestureDetector(
                  onTap: _openLabelManager,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: tokens.surface3,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.plus, size: 12),
                        const SizedBox(width: 4),
                        AppText('Add Label', variant: TextVariant.tiny),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),

            AppButton(
              label: 'Create Task',
              isLoading: _isSaving,
              isFullWidth: true,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
