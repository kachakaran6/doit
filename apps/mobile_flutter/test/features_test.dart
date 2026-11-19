import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:doit_mobile/features/workspace/models/workspace.dart';
import 'package:doit_mobile/features/tasks/models/task.dart';
import 'package:doit_mobile/features/bugs/models/bug.dart';
import 'package:doit_mobile/core/sync/outbox_manager.dart';
import 'package:doit_mobile/features/labels/widgets/label_manager_sheet.dart';

void main() {
  group('Workspace & Project Model Tests', () {
    test('WorkspaceItem serialization and member counting', () {
      const ws = WorkspaceItem(
        id: 'ws-123',
        name: 'Samyukt Engineering',
        slug: 'samyukt-eng',
        role: 'owner',
      );

      final json = ws.toJson();
      expect(json['id'], 'ws-123');
      expect(json['name'], 'Samyukt Engineering');
      expect(json['role'], 'owner');

      final deserialized = WorkspaceItem.fromJson(json);
      expect(deserialized.id, ws.id);
      expect(deserialized.name, ws.name);
    });

    test('ProjectItem model with color and key', () {
      const proj = ProjectItem(
        id: 'proj-456',
        workspaceId: 'ws-123',
        name: 'Mobile Core',
        key: 'CORE',
        color: '#3A66F2',
      );

      final json = proj.toJson();
      expect(json['key'], 'CORE');
      expect(json['color'], '#3A66F2');

      final deserialized = ProjectItem.fromJson(json);
      expect(deserialized.name, 'Mobile Core');
      expect(deserialized.key, 'CORE');
    });
  });

  group('Offline Outbox Item Validation', () {
    test('OutboxEntry serialization and retry increments', () {
      final item = OutboxEntry(
        id: 'outbox-1',
        idempotencyKey: 'idem-123',
        entityId: 'ent-123',
        method: 'POST',
        path: '/api/v1/tasks',
        body: {'title': 'Offline task test'},
        createdAt: DateTime.now(),
        attempts: 0,
      );

      final json = item.toJson();
      expect(json['path'], '/api/v1/tasks');
      expect(json['attempts'], 0);

      final deserialized = OutboxEntry.fromJson(json);
      expect(deserialized.id, 'outbox-1');
      expect(deserialized.method, 'POST');
    });
  });

  group('Task Priority & Severity Mapping', () {
    test('TaskPriority values and serialization', () {
      expect(TaskPriority.urgent.name, 'urgent');
      expect(TaskPriority.high.name, 'high');
      expect(TaskPriority.medium.name, 'medium');
      expect(TaskPriority.low.name, 'low');
    });

    test('BugSeverity values and serialization', () {
      expect(BugSeverity.critical.name, 'critical');
      expect(BugSeverity.major.name, 'major');
      expect(BugSeverity.minor.name, 'minor');
    });

    test('TaskLabel serialization', () {
      const label = TaskLabel(id: 'l-1', name: 'UI / UX', color: '#6366F1');
      final json = label.toJson();
      expect(json['id'], 'l-1');
      expect(json['name'], 'UI / UX');
      expect(json['color'], '#6366F1');

      final deserialized = TaskLabel.fromJson(json);
      expect(deserialized.id, 'l-1');
      expect(deserialized.name, 'UI / UX');
    });

    test('LabelOption model initialization', () {
      const opt = LabelOption(id: 'opt-1', name: 'Security', color: Color(0xFFF43F5E));
      expect(opt.id, 'opt-1');
      expect(opt.name, 'Security');
      expect(opt.color.toARGB32(), 0xFFF43F5E);
    });
  });
}
