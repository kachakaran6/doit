import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/priority_dot.dart';
import '../models/task.dart';

class TaskPriorityPickerSheet extends StatelessWidget {
  final TaskPriority currentPriority;
  final ValueChanged<TaskPriority> onPrioritySelected;

  const TaskPriorityPickerSheet({
    super.key,
    required this.currentPriority,
    required this.onPrioritySelected,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return AppSheet(
      title: 'Update Priority',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: TaskPriority.values.map((priority) {
            final isSelected = priority == currentPriority;
            final pStr = TaskViewModel.priorityToString(priority);

            return Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              decoration: BoxDecoration(
                color: isSelected ? tokens.accentSoft : tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(
                  color: isSelected ? tokens.accent : tokens.hairline,
                  width: 1.0,
                ),
              ),
              child: ListTile(
                leading: PriorityDot(priority: pStr, size: 12),
                title: AppText(
                  pStr,
                  variant: TextVariant.bodyMedium,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
                trailing: isSelected
                    ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                    : null,
                onTap: () {
                  onPrioritySelected(priority);
                  Navigator.pop(context);
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
