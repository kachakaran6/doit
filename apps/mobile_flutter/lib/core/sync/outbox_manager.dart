import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../network/http_client.dart';

enum OutboxState { pending, uploading, sending, failed, reconciled }

class OutboxEntry {
  final String id;
  final String idempotencyKey;
  final String entityId;
  final String method;
  final String path;
  final dynamic body;
  final DateTime createdAt;
  int attempts;
  OutboxState state;
  String? lastError;

  OutboxEntry({
    required this.id,
    required this.idempotencyKey,
    required this.entityId,
    required this.method,
    required this.path,
    required this.body,
    required this.createdAt,
    this.attempts = 0,
    this.state = OutboxState.pending,
    this.lastError,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'idempotencyKey': idempotencyKey,
        'entityId': entityId,
        'method': method,
        'path': path,
        'body': body,
        'createdAt': createdAt.toIso8601String(),
        'attempts': attempts,
        'state': state.name,
        'lastError': lastError,
      };

  factory OutboxEntry.fromJson(Map<String, dynamic> json) => OutboxEntry(
        id: json['id'] as String,
        idempotencyKey: json['idempotencyKey'] as String,
        entityId: json['entityId'] as String,
        method: json['method'] as String,
        path: json['path'] as String,
        body: json['body'],
        createdAt: DateTime.parse(json['createdAt'] as String),
        attempts: json['attempts'] as int? ?? 0,
        state: OutboxState.values.firstWhere(
          (s) => s.name == json['state'],
          orElse: () => OutboxState.pending,
        ),
        lastError: json['lastError'] as String?,
      );
}

class OutboxManager extends ChangeNotifier {
  static final OutboxManager _instance = OutboxManager._internal();
  factory OutboxManager() => _instance;

  static const _storageKey = 'doit_outbox_queue';
  final List<OutboxEntry> _queue = [];
  bool _isFlushing = false;

  OutboxManager._internal() {
    _loadQueue();
    _listenToConnectivity();
  }

  List<OutboxEntry> get queue => List.unmodifiable(_queue);
  int get pendingCount => _queue.where((e) => e.state != OutboxState.reconciled).length;
  int get failedCount => _queue.where((e) => e.state == OutboxState.failed).length;

  Future<void> _loadQueue() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final str = prefs.getString(_storageKey);
      if (str != null && str.isNotEmpty) {
        final list = jsonDecode(str) as List;
        _queue.clear();
        _queue.addAll(list.map((item) => OutboxEntry.fromJson(item as Map<String, dynamic>)));
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _persistQueue() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = _queue.map((e) => e.toJson()).toList();
      await prefs.setString(_storageKey, jsonEncode(list));
    } catch (_) {}
  }

  void _listenToConnectivity() {
    Connectivity().onConnectivityChanged.listen((results) {
      if (!results.contains(ConnectivityResult.none)) {
        flush();
      }
    });
  }

  OutboxEntry enqueue({
    required String entityId,
    required String method,
    required String path,
    dynamic body,
  }) {
    final entry = OutboxEntry(
      id: 'outbox-${DateTime.now().millisecondsSinceEpoch}-${const Uuid().v4().substring(0, 6)}',
      idempotencyKey: const Uuid().v4(),
      entityId: entityId,
      method: method.toUpperCase(),
      path: path,
      body: body,
      createdAt: DateTime.now(),
      attempts: 0,
      state: OutboxState.pending,
    );

    _queue.add(entry);
    _persistQueue();
    notifyListeners();
    flush();
    return entry;
  }

  Future<void> flush() async {
    if (_isFlushing) return;
    _isFlushing = true;

    try {
      final pending = _queue.where(
        (e) => e.state == OutboxState.pending || (e.state == OutboxState.failed && e.attempts < 3),
      ).toList();

      for (final entry in pending) {
        entry.state = OutboxState.sending;
        entry.attempts += 1;
        notifyListeners();

        try {
          final client = HttpClient();
          final headers = {
            'Idempotency-Key': entry.idempotencyKey,
          };

          if (entry.method == 'POST') {
            await client.post(entry.path, data: entry.body, headers: headers);
          } else if (entry.method == 'PATCH') {
            await client.patch(entry.path, data: entry.body);
          } else if (entry.method == 'DELETE') {
            await client.delete(entry.path, data: entry.body);
          } else if (entry.method == 'PUT') {
            await client.put(entry.path, data: entry.body);
          }

          entry.state = OutboxState.reconciled;
          entry.lastError = null;
        } catch (e) {
          entry.state = OutboxState.failed;
          entry.lastError = e.toString();
        }

        await _persistQueue();
        notifyListeners();
      }
    } finally {
      _isFlushing = false;
    }
  }

  Future<void> clearReconciled() async {
    _queue.removeWhere((e) => e.state == OutboxState.reconciled);
    await _persistQueue();
    notifyListeners();
  }
}

final outboxManager = OutboxManager();
