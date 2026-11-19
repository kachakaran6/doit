import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/storage/local_storage.dart';
import '../../../core/providers/capture_bubble_provider.dart';
import '../../../core/native/system_overlay_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuickCapturePrefsScreen extends ConsumerStatefulWidget {
  const QuickCapturePrefsScreen({super.key});

  @override
  ConsumerState<QuickCapturePrefsScreen> createState() => _QuickCapturePrefsScreenState();
}

class _QuickCapturePrefsScreenState extends ConsumerState<QuickCapturePrefsScreen> with WidgetsBindingObserver {
  final _storage = LocalStorageService();
  bool _shakeEnabled = true;
  bool _inAppBubbleEnabled = true;
  bool _systemBubbleRunning = false;
  bool _accessibilityEnabled = false;
  String _sensitivity = 'normal'; // low, normal, high

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkNativeServices();
    }
  }

  void _load() async {
    final e = await _storage.getShakeEnabled();
    final b = await _storage.getOverlayBubbleEnabled();
    final s = await _storage.getShakeSensitivity();
    if (mounted) {
      setState(() {
        _shakeEnabled = e;
        _inAppBubbleEnabled = b;
        _sensitivity = s;
      });
    }
    _checkNativeServices();
  }

  void _checkNativeServices() async {
    final running = await SystemOverlayService.isBubbleRunning();
    final a11y = await SystemOverlayService.isAccessibilityEnabled();
    if (mounted) {
      setState(() {
        _systemBubbleRunning = running;
        _accessibilityEnabled = a11y;
      });
    }
  }

  void _toggleSystemBubble(bool enable) async {
    if (enable) {
      final hasPerm = await SystemOverlayService.hasPermission();
      if (!hasPerm) {
        await SystemOverlayService.requestPermission();
        return;
      }
      final success = await SystemOverlayService.startBubble();
      if (mounted) setState(() => _systemBubbleRunning = success);
    } else {
      await SystemOverlayService.stopBubble();
      if (mounted) setState(() => _systemBubbleRunning = false);
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
          // 1. Whole-Mobile System-Wide Floating Bubble
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          AppText(
                            'System-Wide Floating Bubble',
                            variant: TextVariant.bodyMedium,
                            fontWeight: FontWeight.w700,
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: tokens.accent.withAlpha(35),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: AppText(
                              'CORE',
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w800,
                              customColor: tokens.accentText,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        'Floats over ANY app across your whole phone for instant bug reporting & tasks',
                        variant: TextVariant.caption,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _systemBubbleRunning,
                  activeThumbColor: tokens.accent,
                  onChanged: (val) {
                    HapticFeedback.selectionClick();
                    _toggleSystemBubble(val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // 2. Silent 1-Tap Screenshot via Accessibility
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: InkWell(
              onTap: () async {
                HapticFeedback.selectionClick();
                await SystemOverlayService.openAccessibilitySettings();
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppText(
                          'Silent Instant Screenshot',
                          variant: TextVariant.bodyMedium,
                          fontWeight: FontWeight.w700,
                        ),
                        const SizedBox(height: 2),
                        AppText(
                          _accessibilityEnabled
                              ? 'Accessibility service active: captures any app silently'
                              : 'Tap to enable in Accessibility for 1-tap silent capture without dialogs',
                          variant: TextVariant.caption,
                          colorType: _accessibilityEnabled ? TextColorType.secondary : TextColorType.warning,
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    _accessibilityEnabled ? LucideIcons.checkCircle2 : LucideIcons.externalLink,
                    color: _accessibilityEnabled ? tokens.success : tokens.textSecondary,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // 3. Shake to Capture Card
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
                        'Shake phone anywhere (even in other apps) to trigger bug reporting',
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
                    SystemOverlayService.setShakeEnabled(val, _sensitivity);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // 4. In-App Draggable Bubble Card
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
                        'In-App Floating Bubble',
                        variant: TextVariant.bodyMedium,
                        fontWeight: FontWeight.w700,
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        'Draggable quick capture button inside DoIt app',
                        variant: TextVariant.caption,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _inAppBubbleEnabled,
                  activeThumbColor: tokens.accent,
                  onChanged: (val) {
                    HapticFeedback.selectionClick();
                    setState(() => _inAppBubbleEnabled = val);
                    _storage.setOverlayBubbleEnabled(val);
                    ref.read(overlayBubbleProvider.notifier).setEnabled(val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // 5. Sensitivity Threshold
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
        SystemOverlayService.setShakeEnabled(_shakeEnabled, key);
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
