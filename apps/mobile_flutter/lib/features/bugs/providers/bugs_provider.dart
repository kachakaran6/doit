import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/sync/outbox_manager.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../models/bug.dart';

class BugsState {
  final List<BugViewModel> bugs;
  final bool isLoading;
  final BugSeverity? severityFilter;

  const BugsState({
    this.bugs = const [],
    this.isLoading = false,
    this.severityFilter,
  });

  BugsState copyWith({
    List<BugViewModel>? bugs,
    bool? isLoading,
    BugSeverity? severityFilter,
    bool clearSeverity = false,
  }) {
    return BugsState(
      bugs: bugs ?? this.bugs,
      isLoading: isLoading ?? this.isLoading,
      severityFilter: clearSeverity ? null : (severityFilter ?? this.severityFilter),
    );
  }

  List<BugViewModel> get filteredBugs {
    if (severityFilter == null) return bugs;
    return bugs.where((b) => b.severity == severityFilter).toList();
  }
}

class BugsNotifier extends Notifier<BugsState> {
  @override
  BugsState build() {
    ref.listen(workspaceProvider, (prev, next) {
      if (prev?.activeWorkspace?.id != next.activeWorkspace?.id ||
          prev?.activeProject?.id != next.activeProject?.id) {
        fetchBugs();
      }
    });

    return const BugsState();
  }

  Future<void> fetchBugs() async {
    state = state.copyWith(isLoading: true);
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id;

    try {
      final queryParams = <String, dynamic>{};
      if (projId != null && projId.isNotEmpty) {
        queryParams['projectId'] = projId;
      }

      final res = await apiClient.get<dynamic>(
        ApiEndpoints.bugs,
        queryParameters: queryParams,
      );

      List<dynamic> list = [];
      if (res is List) {
        list = res;
      } else if (res is Map && res['bugs'] is List) {
        list = res['bugs'];
      }

      final bugs = list.map((b) => BugViewModel.fromJson(b as Map<String, dynamic>)).toList();
      state = state.copyWith(bugs: bugs, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void setSeverityFilter(BugSeverity? sev) {
    if (sev == null) {
      state = state.copyWith(clearSeverity: true);
    } else {
      state = state.copyWith(severityFilter: sev);
    }
  }

  Future<void> updateBugStatus(String bugId, BugStatus newStatus) async {
    final index = state.bugs.indexWhere((b) => b.id == bugId);
    if (index == -1) return;

    final current = state.bugs[index];
    final updatedList = List<BugViewModel>.from(state.bugs);
    updatedList[index] = current.copyWith(status: newStatus);
    state = state.copyWith(bugs: updatedList);

    try {
      await apiClient.patch(
        ApiEndpoints.bugStatus(bugId),
        data: {'status': BugViewModel.statusToString(newStatus)},
      );
    } catch (_) {
      outboxManager.enqueue(
        entityId: bugId,
        method: 'PATCH',
        path: ApiEndpoints.bugStatus(bugId),
        body: {'status': BugViewModel.statusToString(newStatus)},
      );
    }
  }

  Future<bool> createBug({
    required String title,
    String? description,
    BugSeverity severity = BugSeverity.major,
    DeviceTelemetry? telemetry,
  }) async {
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id ?? wsState.activeWorkspace?.projects.firstOrNull?.id ?? 'default';

    final tempId = 'temp-bug-${DateTime.now().millisecondsSinceEpoch}';
    final optimisticBug = BugViewModel(
      id: tempId,
      humanId: 'BUG-NEW',
      title: title,
      description: description,
      severity: severity,
      status: BugStatus.triaged,
      projectId: projId,
      telemetry: telemetry,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(bugs: [optimisticBug, ...state.bugs]);

    final payload = {
      'title': title,
      'description': description,
      'severity': BugViewModel.severityToString(severity),
      'projectId': projId,
      'telemetry': telemetry?.toJson(),
    };

    try {
      final res = await apiClient.post<Map<String, dynamic>>(
        ApiEndpoints.bugs,
        data: payload,
      );
      final created = BugViewModel.fromJson(res);
      final list = state.bugs.map((b) => b.id == tempId ? created : b).toList();
      state = state.copyWith(bugs: list);
      return true;
    } catch (_) {
      outboxManager.enqueue(
        entityId: tempId,
        method: 'POST',
        path: ApiEndpoints.bugs,
        body: payload,
      );
      return true;
    }
  }

  Future<void> deleteBug(String bugId) async {
    state = state.copyWith(
      bugs: state.bugs.where((b) => b.id != bugId).toList(),
    );

    try {
      await apiClient.delete(ApiEndpoints.bugDetail(bugId));
    } catch (_) {
      outboxManager.enqueue(
        entityId: bugId,
        method: 'DELETE',
        path: ApiEndpoints.bugDetail(bugId),
      );
    }
  }
}

final bugsProvider = NotifierProvider<BugsNotifier, BugsState>(BugsNotifier.new);
