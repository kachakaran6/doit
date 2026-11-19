import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';

class QuickCaptureGuideSheet extends StatefulWidget {
  const QuickCaptureGuideSheet({super.key});

  @override
  State<QuickCaptureGuideSheet> createState() => _QuickCaptureGuideSheetState();
}

class _QuickCaptureGuideSheetState extends State<QuickCaptureGuideSheet> {
  int _selectedTab = 0; // 0: Floating Bubble, 1: Shake to Report, 2: Troubleshooting

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Container(
      decoration: BoxDecoration(
        color: tokens.surface1,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: tokens.surface3,
                borderRadius: AppRadius.borderFull,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppText(
                'Hardware & Capture Guide',
                variant: TextVariant.titleSmall,
                fontWeight: FontWeight.w700,
              ),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Segmented Tab Switcher
          Row(
            children: [
              _buildTabPill(0, 'Floating Bubble', LucideIcons.layers),
              const SizedBox(width: AppSpacing.xs),
              _buildTabPill(1, 'Shake to Report', LucideIcons.smartphone),
              const SizedBox(width: AppSpacing.xs),
              _buildTabPill(2, 'Troubleshoot', LucideIcons.helpCircle),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Tab Content
          if (_selectedTab == 0) _buildBubbleTab(context),
          if (_selectedTab == 1) _buildShakeTab(context),
          if (_selectedTab == 2) _buildTroubleshootTab(context),

          const SizedBox(height: AppSpacing.xl),
          AppButton(
            label: 'Got It',
            variant: ButtonVariant.primary,
            isFullWidth: true,
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ),
    );
  }

  Widget _buildTabPill(int index, String label, IconData icon) {
    final tokens = context.tokens;
    final isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? tokens.accent.withAlpha(38) : tokens.surface2,
            borderRadius: AppRadius.borderFull,
            border: Border.all(
              color: isSelected ? tokens.accent : Colors.transparent,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: isSelected ? tokens.accent : tokens.textSecondary),
              const SizedBox(width: 4),
              Flexible(
                child: AppText(
                  label,
                  variant: TextVariant.tiny,
                  color: isSelected ? tokens.accent : tokens.textSecondary,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBubbleTab(BuildContext context) {
    return Column(
      children: [
        AppCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              const Icon(LucideIcons.checkCircle2, color: Color(0xFF0E8550), size: 20),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppText('Display Over Other Apps: Ready', variant: TextVariant.bodySmall, fontWeight: FontWeight.w700),
                    AppText('Floating capture bubble can be spawned outside DoIt.', variant: TextVariant.caption, colorType: TextColorType.secondary),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _buildStepRow('1', 'Tap the bubble from any running application to trigger snapshot'),
        _buildStepRow('2', 'Add annotations, voice notes, or issue tags instantly'),
        _buildStepRow('3', 'Submits directly to your active DoIt workspace bug queue'),
      ],
    );
  }

  Widget _buildShakeTab(BuildContext context) {
    return Column(
      children: [
        _buildStepRow('1', 'Hold your mobile device securely in your hand'),
        _buildStepRow('2', 'Perform a quick two-directional wrist flick or sharp shake'),
        _buildStepRow('3', 'Quick Capture dialog opens instantly with automatic device telemetry'),
        _buildStepRow('4', 'Adjust sensitivity threshold under Settings > Quick Capture'),
      ],
    );
  }

  Widget _buildTroubleshootTab(BuildContext context) {
    return Column(
      children: [
        _buildStepRow('•', 'MIUI / HyperOS: Ensure "Display pop-up windows while running in the background" is checked in Android App Info'),
        _buildStepRow('•', 'Battery Optimization: Exclude DoIt from restrictive background battery killers'),
        _buildStepRow('•', 'Shake Detection: If accidental shakes trigger, set sensitivity to "Low (Firm)" in Settings'),
      ],
    );
  }

  Widget _buildStepRow(String bullet, String description) {
    final tokens = context.tokens;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: tokens.surface3,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: AppText(bullet, variant: TextVariant.tiny, fontWeight: FontWeight.w700),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: AppText(description, variant: TextVariant.caption, colorType: TextColorType.secondary),
          ),
        ],
      ),
    );
  }
}
