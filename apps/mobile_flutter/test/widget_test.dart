import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:doit_mobile/main.dart';
import 'package:doit_mobile/features/tasks/models/task.dart';
import 'package:doit_mobile/features/bugs/models/bug.dart';
import 'package:doit_mobile/features/stickies/models/sticky.dart';
import 'package:doit_mobile/core/theme/app_colors.dart';

void main() {
  group('DoIt Unit & Domain Model Tests', () {
    test('TaskViewModel serialization and status transitions', () {
      final task = TaskViewModel(
        id: 'task-1',
        humanId: 'TASK-101',
        title: 'Port Auth Flow to Flutter',
        description: 'Implement JWT refresh mutex',
        status: TaskStatus.todo,
        priority: TaskPriority.urgent,
        projectId: 'proj-1',
        dueDate: '2026-12-01',
      );

      final json = task.toJson();
      expect(json['id'], 'task-1');
      expect(json['status'], 'TODO');
      expect(json['priority'], 'URGENT');

      final deserialized = TaskViewModel.fromJson(json);
      expect(deserialized.id, task.id);
      expect(deserialized.status, TaskStatus.todo);
      expect(deserialized.priority, TaskPriority.urgent);

      final updated = deserialized.copyWith(status: TaskStatus.done);
      expect(updated.status, TaskStatus.done);
    });

    test('BugViewModel telemetry serialization', () {
      const telemetry = DeviceTelemetry(
        deviceModel: 'Pixel 8 Pro',
        osVersion: 'Android 14',
        appVersion: '1.0.0',
        buildNumber: '59',
        timestamp: '2026-11-19T11:00:00Z',
      );

      final bug = BugViewModel(
        id: 'bug-1',
        humanId: 'BUG-42',
        title: 'Network timeout during cold start',
        severity: BugSeverity.critical,
        status: BugStatus.triaged,
        projectId: 'proj-1',
        telemetry: telemetry,
      );

      final json = bug.toJson();
      expect(json['severity'], 'CRITICAL');
      expect(json['telemetry']['deviceModel'], 'Pixel 8 Pro');

      final deserialized = BugViewModel.fromJson(json);
      expect(deserialized.severity, BugSeverity.critical);
      expect(deserialized.telemetry?.deviceModel, 'Pixel 8 Pro');
    });

    test('StickyViewModel pin toggle', () {
      final sticky = StickyViewModel(
        id: 'sticky-1',
        body: 'Refactor background session timer',
        color: '#BBF7D0',
        isPinned: false,
        projectId: 'proj-1',
      );

      expect(sticky.isPinned, false);
      final pinned = sticky.copyWith(isPinned: true);
      expect(pinned.isPinned, true);
    });

    test('ThemeExtension color luminance consistency', () {
      final darkTokens = AppThemeTokens.dark(accentName: AppAccentName.blue);
      expect(darkTokens.canvas, AppColors.darkCanvas);
      expect(darkTokens.isDark, true);

      final lightTokens = AppThemeTokens.light(accentName: AppAccentName.blue);
      expect(lightTokens.canvas, AppColors.lightCanvas);
      expect(lightTokens.isDark, false);
    });
  });

  group('DoIt Widget Smoke Tests', () {
    testWidgets('DoItApp initial frame renders cleanly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: DoItApp(),
        ),
      );

      // Trigger animation frame
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(DoItApp), findsOneWidget);
    });
  });
}
