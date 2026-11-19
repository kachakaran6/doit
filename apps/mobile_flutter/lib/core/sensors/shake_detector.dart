import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:sensors_plus/sensors_plus.dart';

class ShakeDetector {
  final VoidCallback onShake;
  double shakeThresholdGravity;
  final int minTimeBetweenShakesMs;

  StreamSubscription<UserAccelerometerEvent>? _userAccelSub;
  StreamSubscription<AccelerometerEvent>? _accelSub;
  int _lastShakeTimestamp = 0;

  ShakeDetector({
    required this.onShake,
    this.shakeThresholdGravity = 0.85,
    this.minTimeBetweenShakesMs = 800,
  });

  void setThreshold(double threshold) {
    shakeThresholdGravity = threshold;
  }

  void startListening() {
    stopListening();

    try {
      // Primary: user accelerometer (has gravity pre-filtered by device sensor fusion)
      _userAccelSub = userAccelerometerEventStream().listen(
        (event) {
          final gForce = sqrt(event.x * event.x + event.y * event.y + event.z * event.z) / 9.80665;
          _evaluateShake(gForce);
        },
        onError: (err) {
          debugPrint('[ShakeDetector] userAccelerometer error: $err, falling back to raw accelerometer');
          _fallbackToRawAccelerometer();
        },
      );
    } catch (e) {
      debugPrint('[ShakeDetector] userAccelerometer exception: $e, falling back to raw accelerometer');
      _fallbackToRawAccelerometer();
    }
  }

  void _fallbackToRawAccelerometer() {
    _accelSub?.cancel();
    _accelSub = accelerometerEventStream().listen((event) {
      final gX = event.x / 9.80665;
      final gY = event.y / 9.80665;
      final gZ = event.z / 9.80665;
      final gForce = (sqrt(gX * gX + gY * gY + gZ * gZ) - 1.0).abs();
      _evaluateShake(gForce);
    });
  }

  void _evaluateShake(double gForce) {
    if (gForce >= shakeThresholdGravity) {
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - _lastShakeTimestamp > minTimeBetweenShakesMs) {
        _lastShakeTimestamp = now;
        onShake();
      }
    }
  }

  void stopListening() {
    _userAccelSub?.cancel();
    _userAccelSub = null;
    _accelSub?.cancel();
    _accelSub = null;
  }
}
