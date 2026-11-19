import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';

class ShakeTestModal extends StatefulWidget {
  const ShakeTestModal({super.key});

  @override
  State<ShakeTestModal> createState() => _ShakeTestModalState();
}

class _ShakeTestModalState extends State<ShakeTestModal> {
  StreamSubscription<UserAccelerometerEvent>? _userSub;
  StreamSubscription<AccelerometerEvent>? _rawSub;
  double _currentGForce = 0.0;
  double _peakGForce = 0.0;
  int _shakeCount = 0;
  int _lastTrigger = 0;

  @override
  void initState() {
    super.initState();
    _startListening();
  }

  void _startListening() {
    try {
      _userSub = userAccelerometerEventStream().listen(
        (event) {
          final gForce = sqrt(event.x * event.x + event.y * event.y + event.z * event.z) / 9.80665;
          _processGForce(gForce);
        },
        onError: (_) => _startRawListening(),
      );
    } catch (_) {
      _startRawListening();
    }
  }

  void _startRawListening() {
    _rawSub?.cancel();
    _rawSub = accelerometerEventStream().listen((event) {
      final gX = event.x / 9.80665;
      final gY = event.y / 9.80665;
      final gZ = event.z / 9.80665;
      final gForce = (sqrt(gX * gX + gY * gY + gZ * gZ) - 1.0).abs();
      _processGForce(gForce);
    });
  }

  void _processGForce(double gForce) {
    if (!mounted) return;
    setState(() {
      _currentGForce = gForce;
      if (gForce > _peakGForce) _peakGForce = gForce;

      final now = DateTime.now().millisecondsSinceEpoch;
      if (gForce >= 0.85 && (now - _lastTrigger) > 800) {
        _lastTrigger = now;
        _shakeCount += 1;
        HapticFeedback.mediumImpact();
      }
    });
  }

  @override
  void dispose() {
    _userSub?.cancel();
    _rawSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Dialog(
      backgroundColor: tokens.surface1,
      shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXxl),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: tokens.accentSoft,
                  shape: BoxShape.circle,
                ),
                child: Icon(LucideIcons.activity, size: 28, color: tokens.accentText),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            AppText(
              'Shake Detector Live Test',
              variant: TextVariant.titleSmall,
              fontWeight: FontWeight.w700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xs),
            AppText(
              'Shake your phone now to test sensor sensitivity.',
              variant: TextVariant.bodySmall,
              colorType: TextColorType.secondary,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(color: tokens.hairline),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppText('Live G-Force:', variant: TextVariant.caption),
                      AppText(
                        '${_currentGForce.toStringAsFixed(2)} g',
                        variant: TextVariant.caption,
                        fontWeight: FontWeight.w700,
                        customColor: _currentGForce >= 0.85 ? tokens.success : tokens.textPrimary,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppText('Peak G-Force:', variant: TextVariant.caption),
                      AppText(
                        '${_peakGForce.toStringAsFixed(2)} g',
                        variant: TextVariant.caption,
                        fontWeight: FontWeight.w700,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppText('Shakes Triggered:', variant: TextVariant.caption),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: _shakeCount > 0 ? tokens.successSoft : tokens.surface3,
                          borderRadius: AppRadius.borderFull,
                        ),
                        child: AppText(
                          '$_shakeCount detected',
                          variant: TextVariant.tiny,
                          fontWeight: FontWeight.w700,
                          customColor: _shakeCount > 0 ? tokens.success : tokens.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Done',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
