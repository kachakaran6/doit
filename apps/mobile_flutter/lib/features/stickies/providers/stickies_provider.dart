import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/sync/outbox_manager.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../models/sticky.dart';

class StickiesState {
  final List<StickyViewModel> stickies;
  final bool isLoading;

  const StickiesState({
    this.stickies = const [],
    this.isLoading = false,
  });

  StickiesState copyWith({
    List<StickyViewModel>? stickies,
    bool? isLoading,
  }) {
    return StickiesState(
      stickies: stickies ?? this.stickies,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class StickiesNotifier extends Notifier<StickiesState> {
  @override
  StickiesState build() {
    ref.listen(workspaceProvider, (prev, next) {
      if (prev?.activeWorkspace?.id != next.activeWorkspace?.id ||
          prev?.activeProject?.id != next.activeProject?.id) {
        fetchStickies();
      }
    });

    return const StickiesState();
  }

  Future<void> fetchStickies() async {
    state = state.copyWith(isLoading: true);
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id;

    try {
      final queryParams = <String, dynamic>{};
      if (projId != null && projId.isNotEmpty) {
        queryParams['projectId'] = projId;
      }

      final res = await apiClient.get<dynamic>(
        ApiEndpoints.stickies,
        queryParameters: queryParams,
      );

      List<dynamic> list = [];
      if (res is List) {
        list = res;
      } else if (res is Map && res['stickies'] is List) {
        list = res['stickies'];
      }

      final stickies = list.map((s) => StickyViewModel.fromJson(s as Map<String, dynamic>)).toList();
      state = state.copyWith(stickies: stickies, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> createSticky({
    required String body,
    String color = '#FEF08A',
  }) async {
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id ?? wsState.activeWorkspace?.projects.firstOrNull?.id ?? 'default';

    final tempId = 'temp-sticky-${DateTime.now().millisecondsSinceEpoch}';
    final optimistic = StickyViewModel(
      id: tempId,
      body: body,
      color: color,
      projectId: projId,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(stickies: [optimistic, ...state.stickies]);

    final payload = {
      'body': body,
      'color': color,
      'projectId': projId,
    };

    try {
      final res = await apiClient.post<Map<String, dynamic>>(
        ApiEndpoints.stickies,
        data: payload,
      );
      final created = StickyViewModel.fromJson(res);
      final list = state.stickies.map((s) => s.id == tempId ? created : s).toList();
      state = state.copyWith(stickies: list);
      return true;
    } catch (_) {
      outboxManager.enqueue(
        entityId: tempId,
        method: 'POST',
        path: ApiEndpoints.stickies,
        body: payload,
      );
      return true;
    }
  }

  Future<void> togglePin(String stickyId) async {
    final index = state.stickies.indexWhere((s) => s.id == stickyId);
    if (index == -1) return;

    final current = state.stickies[index];
    final updated = current.copyWith(isPinned: !current.isPinned);

    final list = List<StickyViewModel>.from(state.stickies);
    list[index] = updated;
    state = state.copyWith(stickies: list);

    try {
      await apiClient.patch(
        ApiEndpoints.stickyPin(stickyId),
        data: {'isPinned': updated.isPinned},
      );
    } catch (_) {
      outboxManager.enqueue(
        entityId: stickyId,
        method: 'PATCH',
        path: ApiEndpoints.stickyPin(stickyId),
        body: {'isPinned': updated.isPinned},
      );
    }
  }

  Future<void> deleteSticky(String stickyId) async {
    state = state.copyWith(
      stickies: state.stickies.where((s) => s.id != stickyId).toList(),
    );

    try {
      await apiClient.delete(ApiEndpoints.stickyDetail(stickyId));
    } catch (_) {
      outboxManager.enqueue(
        entityId: stickyId,
        method: 'DELETE',
        path: ApiEndpoints.stickyDetail(stickyId),
      );
    }
  }
}

final stickiesProvider = NotifierProvider<StickiesNotifier, StickiesState>(StickiesNotifier.new);
