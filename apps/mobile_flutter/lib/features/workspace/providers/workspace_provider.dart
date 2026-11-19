import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/storage/local_storage.dart';
import '../../../core/native/system_overlay_service.dart';
import '../models/workspace.dart';

class WorkspaceState {
  final List<WorkspaceItem> workspaces;
  final WorkspaceItem? activeWorkspace;
  final ProjectItem? activeProject; // null means 'All Projects'
  final bool isLoading;

  const WorkspaceState({
    this.workspaces = const [],
    this.activeWorkspace,
    this.activeProject,
    this.isLoading = false,
  });

  WorkspaceState copyWith({
    List<WorkspaceItem>? workspaces,
    WorkspaceItem? activeWorkspace,
    ProjectItem? activeProject,
    bool? isLoading,
    bool clearActiveProject = false,
  }) {
    return WorkspaceState(
      workspaces: workspaces ?? this.workspaces,
      activeWorkspace: activeWorkspace ?? this.activeWorkspace,
      activeProject: clearActiveProject ? null : (activeProject ?? this.activeProject),
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class WorkspaceNotifier extends Notifier<WorkspaceState> {
  final LocalStorageService _localStorage = LocalStorageService();

  @override
  WorkspaceState build() {
    return const WorkspaceState();
  }

  Future<void> fetchWorkspaces() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await apiClient.get<dynamic>(ApiEndpoints.workspaces);
      List<dynamic> list = [];
      if (res is List) {
        list = res;
      } else if (res is Map && res['workspaces'] is List) {
        list = res['workspaces'];
      }

      final workspaces = list
          .map((w) => WorkspaceItem.fromJson(w as Map<String, dynamic>))
          .toList();

      final savedWsId = await _localStorage.getActiveWorkspaceId();
      final savedProjId = await _localStorage.getActiveProjectId();

      WorkspaceItem? activeWs;
      if (savedWsId != null && workspaces.any((w) => w.id == savedWsId)) {
        activeWs = workspaces.firstWhere((w) => w.id == savedWsId);
      } else if (workspaces.isNotEmpty) {
        activeWs = workspaces.first;
      }

      ProjectItem? activeProj;
      if (activeWs != null && activeWs.projects.isNotEmpty) {
        if (savedProjId == 'ALL') {
          activeProj = null;
        } else if (savedProjId != null && activeWs.projects.any((p) => p.id == savedProjId)) {
          activeProj = activeWs.projects.firstWhere((p) => p.id == savedProjId);
        } else {
          activeProj = activeWs.projects.first;
        }
      }

      if (activeWs != null) {
        apiClient.setWorkspaceId(activeWs.id);
        await _localStorage.saveActiveWorkspaceId(activeWs.id);
      }
      if (activeProj != null) {
        await _localStorage.saveActiveProjectId(activeProj.id);
      }

      state = WorkspaceState(
        workspaces: workspaces,
        activeWorkspace: activeWs,
        activeProject: activeProj,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> setActiveWorkspace(WorkspaceItem ws) async {
    apiClient.setWorkspaceId(ws.id);
    await _localStorage.saveActiveWorkspaceId(ws.id);

    ProjectItem? proj = ws.projects.isNotEmpty ? ws.projects.first : null;
    if (proj != null) {
      await _localStorage.saveActiveProjectId(proj.id);
    }

    state = state.copyWith(
      activeWorkspace: ws,
      activeProject: proj,
    );

    SystemOverlayService.syncAuthCredentials(
      token: apiClient.authToken,
      workspaceId: ws.id,
      projectId: proj?.id,
    );
  }

  Future<void> setActiveProject(ProjectItem? proj) async {
    if (proj == null) {
      await _localStorage.saveActiveProjectId('ALL');
      state = state.copyWith(clearActiveProject: true);
    } else {
      await _localStorage.saveActiveProjectId(proj.id);
      state = state.copyWith(activeProject: proj);
    }

    SystemOverlayService.syncAuthCredentials(
      token: apiClient.authToken,
      workspaceId: state.activeWorkspace?.id,
      projectId: proj?.id,
    );
  }
}

final workspaceProvider = NotifierProvider<WorkspaceNotifier, WorkspaceState>(WorkspaceNotifier.new);
