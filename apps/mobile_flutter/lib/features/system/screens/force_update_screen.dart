import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';

class ForceUpdateScreen extends StatelessWidget {
  final String minVersion;
  final String downloadUrl;

  const ForceUpdateScreen({
    super.key,
    required this.minVersion,
    required this.downloadUrl,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Scaffold(
      backgroundColor: tokens.canvas,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: tokens.warningSoft,
                    borderRadius: AppRadius.borderXxl,
                    border: Border.all(color: tokens.warning.withAlpha(90), width: 1.5),
                  ),
                  child: Icon(LucideIcons.arrowUpCircle, size: 42, color: tokens.warning),
                ),
              ),
              const SizedBox(height: AppSpacing.xxl),
              AppText(
                'Update Required',
                variant: TextVariant.display,
                fontWeight: FontWeight.w800,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppText(
                'A new critical version of DoIt ($minVersion) is required to continue syncing tasks and defects.',
                variant: TextVariant.bodyMedium,
                colorType: TextColorType.secondary,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.xxxl),
              AppButton(
                label: 'Update Now via Play Store',
                size: ButtonSize.lg,
                onPressed: () {
                  // open store URL
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
