import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../core/widgets/priority_dot.dart';

class FoundationGalleryScreen extends StatelessWidget {
  const FoundationGalleryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Foundation Gallery',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Surface Ramp Section
          _buildSectionHeader('8% Luminance Surface Ramp'),
          AppCard(
            level: CardLevel.surface1,
            child: AppText('Surface 1 (Base Cards, List Items)', variant: TextVariant.bodyMedium),
          ),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            level: CardLevel.surface2,
            child: AppText('Surface 2 (Inputs, Chips, Stat Tiles)', variant: TextVariant.bodyMedium),
          ),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            level: CardLevel.surface3,
            child: AppText('Surface 3 (Active pills, pressed states)', variant: TextVariant.bodyMedium),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Typography Scale Section
          _buildSectionHeader('Typography Scale'),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppText('Display (28px Bold)', variant: TextVariant.display),
                const SizedBox(height: 6),
                AppText('Title Large (22px SemiBold)', variant: TextVariant.titleLarge),
                const SizedBox(height: 6),
                AppText('Title Medium (18px SemiBold)', variant: TextVariant.titleMedium),
                const SizedBox(height: 6),
                AppText('Title Small (16px SemiBold)', variant: TextVariant.titleSmall),
                const SizedBox(height: 6),
                AppText('Body Large (15px Regular)', variant: TextVariant.bodyLarge),
                const SizedBox(height: 6),
                AppText('Body Medium (14px Regular)', variant: TextVariant.bodyMedium),
                const SizedBox(height: 6),
                AppText('Caption (12px Medium)', variant: TextVariant.caption),
                const SizedBox(height: 6),
                AppText('Tiny (10px Bold Eyebrow)', variant: TextVariant.tiny),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Button Hierarchy Section
          _buildSectionHeader('Buttons'),
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.sm,
            children: [
              AppButton(label: 'Primary', onPressed: () {}),
              AppButton(label: 'Secondary', variant: ButtonVariant.secondary, onPressed: () {}),
              AppButton(label: 'Outline', variant: ButtonVariant.outline, onPressed: () {}),
              AppButton(label: 'Danger', variant: ButtonVariant.danger, onPressed: () {}),
              AppButton(label: 'Loading', isLoading: true, onPressed: () {}),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          // Chips & Badges Section
          _buildSectionHeader('Chips & Status Badges'),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: const [
              AppChip(label: 'Selected Chip', isSelected: true, count: '12'),
              AppChip(label: 'Normal Chip'),
              StatusBadge(status: 'TODO'),
              StatusBadge(status: 'IN_PROGRESS'),
              StatusBadge(status: 'DONE'),
              StatusBadge(status: 'BLOCKED'),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          // Priority Dots Section
          _buildSectionHeader('Priority Indicators'),
          Row(
            children: const [
              PriorityDot(priority: 'URGENT', size: 12),
              SizedBox(width: 8),
              AppText('Urgent (P0)'),
              SizedBox(width: 16),
              PriorityDot(priority: 'HIGH', size: 12),
              SizedBox(width: 8),
              AppText('High (P1)'),
              SizedBox(width: 16),
              PriorityDot(priority: 'MEDIUM', size: 12),
              SizedBox(width: 8),
              AppText('Medium (P2)'),
              SizedBox(width: 16),
              PriorityDot(priority: 'LOW', size: 12),
              SizedBox(width: 8),
              AppText('Low (P3)'),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          // Avatars Section
          _buildSectionHeader('Avatars'),
          Row(
            children: const [
              AppAvatar(name: 'Karan', size: 48),
              SizedBox(width: 12),
              AppAvatar(name: 'Engineering Lead', size: 40),
              SizedBox(width: 12),
              AppAvatar(name: 'QA Tester', size: 32),
            ],
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppText(
        title,
        variant: TextVariant.caption,
        colorType: TextColorType.secondary,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}
