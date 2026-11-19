class TestSession {
  final bool isActive;
  final String appUnderTest;
  final DateTime? startTime;
  final int elapsedSeconds;
  final List<String> bugIds;

  const TestSession({
    this.isActive = false,
    this.appUnderTest = 'com.samyukt.doit',
    this.startTime,
    this.elapsedSeconds = 0,
    this.bugIds = const [],
  });

  TestSession copyWith({
    bool? isActive,
    String? appUnderTest,
    DateTime? startTime,
    int? elapsedSeconds,
    List<String>? bugIds,
  }) {
    return TestSession(
      isActive: isActive ?? this.isActive,
      appUnderTest: appUnderTest ?? this.appUnderTest,
      startTime: startTime ?? this.startTime,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      bugIds: bugIds ?? this.bugIds,
    );
  }
}
