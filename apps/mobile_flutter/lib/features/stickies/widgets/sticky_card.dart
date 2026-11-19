import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../models/sticky.dart';

class StickyCard extends StatelessWidget {
  final StickyViewModel sticky;
  final VoidCallback onTogglePin;
  final VoidCallback onDelete;

  const StickyCard({
    super.key,
    required this.sticky,
    required this.onTogglePin,
    required this.onDelete,
  });

  Color _parseColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return const Color(0xFFFEF08A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardColor = _parseColor(sticky.color);
    final isDarkSticky = ThemeData.estimateBrightnessForColor(cardColor) == Brightness.dark;
    final textColor = isDarkSticky ? Colors.white : const Color(0xFF1C1917);

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: AppRadius.borderLg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: onTogglePin,
                child: Icon(
                  sticky.isPinned ? LucideIcons.pin : LucideIcons.pinOff,
                  size: 16,
                  color: sticky.isPinned ? textColor : textColor.withAlpha(100),
                ),
              ),
              GestureDetector(
                onTap: onDelete,
                child: Icon(
                  LucideIcons.x,
                  size: 16,
                  color: textColor.withAlpha(120),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          AppText(
            sticky.body,
            variant: TextVariant.bodyMedium,
            fontWeight: FontWeight.w500,
            customColor: textColor,
            maxLines: 8,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
