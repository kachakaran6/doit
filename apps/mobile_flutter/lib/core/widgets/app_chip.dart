import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import 'app_text.dart';

class AppChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final Widget? icon;
  final String? count;

  const AppChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.onTap,
    this.icon,
    this.count,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    final bg = isSelected ? tokens.accentSoft : tokens.surface2;
    final fg = isSelected ? tokens.accentText : tokens.textSecondary;
    final border = isSelected
        ? Border.all(color: tokens.accent.withAlpha(80), width: 1.0)
        : Border.all(color: tokens.hairline, width: 1.0);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          if (onTap != null) {
            HapticFeedback.selectionClick();
            onTap!();
          }
        },
        borderRadius: AppRadius.borderFull,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.xs,
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.borderFull,
            border: border,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                icon!,
                const SizedBox(width: AppSpacing.xs),
              ],
              AppText(
                label,
                variant: TextVariant.bodySmall,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                customColor: fg,
              ),
              if (count != null) ...[
                const SizedBox(width: AppSpacing.xs),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    color: isSelected ? tokens.accent : tokens.surface3,
                    borderRadius: AppRadius.borderFull,
                  ),
                  child: AppText(
                    count!,
                    variant: TextVariant.tiny,
                    customColor: isSelected ? Colors.white : tokens.textTertiary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
