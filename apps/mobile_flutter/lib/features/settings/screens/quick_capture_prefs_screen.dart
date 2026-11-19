import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/storage/local_storage.dart';
import '../../../core/providers/capture_bubble_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuickCapturePrefsScreen extends ConsumerStatefulWidget {
  const QuickCapturePrefsScreen({super.key});

  @override
  ConsumerState<QuickCapturePrefsScreen> createState() => _QuickCapturePrefsScreenState();
}

class _QuickCapturePrefsScreenState extends ConsumerState<QuickCapturePrefsScreen> {
  final _storage = LocalStorageService();
  bool _shakeEnabled = true;
  bool _bubbleEnabled = true;
  String _sensitivity = 'normal'; // low, normal, high

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() async {
    final e = await _storage.getShakeEnabled();
    final b = await _storage.getOverlayBubbleEnabled();
    final s = await _storage.getShakeSensitivity();
    if (mounted) {
      setState(() {
        _shakeEnabled = e;
        _bubbleEnabled = b;
        _sensitivity = s;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Quick Capture Settings',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // 1. Shake to Capture Card
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText(
                        'Shake to Capture',
                        variant: TextVariant.bodyMedium,
                        fontWeight: FontWeight.w700,
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        'Shake phone anywhere to open report sheet',
                        variant: TextVariant.caption,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _shakeEnabled,
                  activeThumbColor: tokens.accent,
                  onChanged: (val) {
                    HapticFeedback.selectionClick();
                    setState(() => _shakeEnabled = val);
                    _storage.setShakeEnabled(val);
                    ref.read(shakeConfigProvider.notifier).setEnabled(val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // 2. Floating Bubble Overlay Card
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText(
                        'Floating Bubble Overlay',
                        variant: TextVariant.bodyMedium,
                        fontWeight: FontWeight.w700,
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        'Draggable quick-action button on screen',
                        variant: TextVariant.caption,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _bubbleEnabled,
                  activeThumbColor: tokens.accent,
                  onChanged: (val) {
                    HapticFeedback.selectionClick();
                    setState(() => _bubbleEnabled = val);
                    _storage.setOverlayBubbleEnabled(val);
                    ref.read(overlayBubbleProvider.notifier).setEnabled(val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // 3. Sensitivity Threshold
          AppText(
            'SHAKE SENSITIVITY THRESHOLD',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              children: [
                _buildSensitivityOption('high', 'High (0.65g)', 'Triggers easily on gentle wrist flick'),
                Divider(color: tokens.hairline, height: 16),
                _buildSensitivityOption('normal', 'Normal (0.85g) - Recommended', 'Balanced for natural handheld motion'),
                Divider(color: tokens.hairline, height: 16),
                _buildSensitivityOption('low', 'Firm (1.20g)', 'Requires an intentional, firm shake'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensitivityOption(String key, String title, String subtitle) {
    final tokens = context.tokens;
    final isSelected = _sensitivity == key;

    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _sensitivity = key);
        _storage.setShakeSensitivity(key);
        ref.read(shakeConfigProvider.notifier).setSensitivity(key);
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppText(
                    title,
                    variant: TextVariant.bodyMedium,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                  AppText(
                    subtitle,
                    variant: TextVariant.caption,
                    colorType: TextColorType.secondary,
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(LucideIcons.check, color: tokens.accent, size: 20),
          ],
        ),
      ),
    );
  }
}
