import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/local_storage.dart';

class ShakeConfigState {
  final bool enabled;
  final String sensitivity;
  final double threshold;

  const ShakeConfigState({
    required this.enabled,
    required this.sensitivity,
    required this.threshold,
  });

  ShakeConfigState copyWith({
    bool? enabled,
    String? sensitivity,
    double? threshold,
  }) {
    return ShakeConfigState(
      enabled: enabled ?? this.enabled,
      sensitivity: sensitivity ?? this.sensitivity,
      threshold: threshold ?? this.threshold,
    );
  }
}

class ShakeConfigNotifier extends Notifier<ShakeConfigState> {
  final _storage = LocalStorageService();

  @override
  ShakeConfigState build() {
    _load();
    return const ShakeConfigState(
      enabled: true,
      sensitivity: 'normal',
      threshold: 0.85,
    );
  }

  Future<void> _load() async {
    final e = await _storage.getShakeEnabled();
    final s = await _storage.getShakeSensitivity();
    double th = 0.85;
    if (s == 'high') th = 0.65;
    if (s == 'low') th = 1.20;
    state = ShakeConfigState(enabled: e, sensitivity: s, threshold: th);
  }

  void setEnabled(bool enabled) {
    state = state.copyWith(enabled: enabled);
  }

  void setSensitivity(String sensitivity) {
    double th = 0.85;
    if (sensitivity == 'high') th = 0.65;
    if (sensitivity == 'low') th = 1.20;
    state = state.copyWith(sensitivity: sensitivity, threshold: th);
  }
}

final shakeConfigProvider = NotifierProvider<ShakeConfigNotifier, ShakeConfigState>(ShakeConfigNotifier.new);

class OverlayBubbleNotifier extends Notifier<bool> {
  final _storage = LocalStorageService();

  @override
  bool build() {
    _load();
    return true; // Enabled by default for easy access
  }

  Future<void> _load() async {
    final b = await _storage.getOverlayBubbleEnabled();
    state = b;
  }

  void setEnabled(bool enabled) {
    state = enabled;
  }
}

final overlayBubbleProvider = NotifierProvider<OverlayBubbleNotifier, bool>(OverlayBubbleNotifier.new);
