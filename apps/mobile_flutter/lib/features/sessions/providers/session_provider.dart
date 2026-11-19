import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/test_session.dart';

class SessionNotifier extends Notifier<TestSession> {
  Timer? _timer;

  @override
  TestSession build() {
    ref.onDispose(() {
      _timer?.cancel();
    });
    return const TestSession();
  }

  void startSession(String appName) {
    _timer?.cancel();
    state = TestSession(
      isActive: true,
      appUnderTest: appName,
      startTime: DateTime.now(),
      elapsedSeconds: 0,
      bugIds: [],
    );

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      state = state.copyWith(elapsedSeconds: state.elapsedSeconds + 1);
    });
  }

  TestSession endSession() {
    _timer?.cancel();
    _timer = null;
    final finalSession = state;
    state = const TestSession(isActive: false);
    return finalSession;
  }

  void recordBug(String bugId) {
    state = state.copyWith(bugIds: [...state.bugIds, bugId]);
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, TestSession>(SessionNotifier.new);
