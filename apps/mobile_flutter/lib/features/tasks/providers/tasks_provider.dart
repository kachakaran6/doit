import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/sync/outbox_manager.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../models/task.dart';

enum TaskFilterTab { all, myDay, upcoming, done }
enum TaskViewMode { list, board }

class TasksState {
  final List<TaskViewModel> tasks;
  final bool isLoading;
  final TaskFilterTab activeFilter;
  final TaskViewMode viewMode;
  final String searchQuery;

  const TasksState({
    this.tasks = const [],
    this.isLoading = false,
    this.activeFilter = TaskFilterTab.all,
    this.viewMode = TaskViewMode.list,
    this.searchQuery = '',
  });

  TasksState copyWith({
    List<TaskViewModel>? tasks,
    bool? isLoading,
    TaskFilterTab? activeFilter,
    TaskViewMode? viewMode,
    String? searchQuery,
  }) {
    return TasksState(
      tasks: tasks ?? this.tasks,
      isLoading: isLoading ?? this.isLoading,
      activeFilter: activeFilter ?? this.activeFilter,
      viewMode: viewMode ?? this.viewMode,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  List<TaskViewModel> get filteredTasks {
    return tasks.where((t) {
      if (searchQuery.isNotEmpty) {
        final q = searchQuery.toLowerCase();
        final matchTitle = t.title.toLowerCase().contains(q);
        final matchDesc = t.description?.toLowerCase().contains(q) ?? false;
        final matchId = t.humanId.toLowerCase().contains(q);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }

      switch (activeFilter) {
        case TaskFilterTab.done:
          return t.status == TaskStatus.done;
        case TaskFilterTab.myDay:
          return t.status != TaskStatus.done;
        case TaskFilterTab.upcoming:
          return t.dueDate != null && t.status != TaskStatus.done;
        case TaskFilterTab.all:
          return true;
      }
    }).toList();
  }
}

class TasksNotifier extends Notifier<TasksState> {
  @override
  TasksState build() {
    ref.listen(workspaceProvider, (prev, next) {
      if (prev?.activeWorkspace?.id != next.activeWorkspace?.id ||
          prev?.activeProject?.id != next.activeProject?.id) {
        fetchTasks();
      }
    });

    return const TasksState();
  }

  Future<void> fetchTasks() async {
    state = state.copyWith(isLoading: true);
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id;

    try {
      final queryParams = <String, dynamic>{};
      if (projId != null && projId.isNotEmpty) {
        queryParams['projectId'] = projId;
      }

      final res = await apiClient.get<dynamic>(
        ApiEndpoints.tasks,
        queryParameters: queryParams,
      );

      List<dynamic> list = [];
      if (res is List) {
        list = res;
      } else if (res is Map && res['tasks'] is List) {
        list = res['tasks'];
      }

      final tasks = list.map((t) => TaskViewModel.fromJson(t as Map<String, dynamic>)).toList();
      state = state.copyWith(tasks: tasks, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void setFilter(TaskFilterTab filter) {
    state = state.copyWith(activeFilter: filter);
  }

  void setViewMode(TaskViewMode mode) {
    state = state.copyWith(viewMode: mode);
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Future<void> toggleTaskStatus(String taskId) async {
    final index = state.tasks.indexWhere((t) => t.id == taskId);
    if (index == -1) return;

    final current = state.tasks[index];
    final nextStatus = current.status == TaskStatus.done ? TaskStatus.todo : TaskStatus.done;

    // Optimistic Update
    final updatedList = List<TaskViewModel>.from(state.tasks);
    updatedList[index] = current.copyWith(status: nextStatus);
    state = state.copyWith(tasks: updatedList);

    try {
      await apiClient.patch(
        ApiEndpoints.taskStatus(taskId),
        data: {'status': TaskViewModel.statusToString(nextStatus)},
      );
    } catch (_) {
      // Enqueue to offline outbox on error
      outboxManager.enqueue(
        entityId: taskId,
        method: 'PATCH',
        path: ApiEndpoints.taskStatus(taskId),
        body: {'status': TaskViewModel.statusToString(nextStatus)},
      );
    }
  }

  Future<void> updateTaskStatus(String taskId, TaskStatus newStatus) async {
    final index = state.tasks.indexWhere((t) => t.id == taskId);
    if (index == -1) return;

    final current = state.tasks[index];
    final updatedList = List<TaskViewModel>.from(state.tasks);
    updatedList[index] = current.copyWith(status: newStatus);
    state = state.copyWith(tasks: updatedList);

    try {
      await apiClient.patch(
        ApiEndpoints.taskStatus(taskId),
        data: {'status': TaskViewModel.statusToString(newStatus)},
      );
    } catch (_) {
      outboxManager.enqueue(
        entityId: taskId,
        method: 'PATCH',
        path: ApiEndpoints.taskStatus(taskId),
        body: {'status': TaskViewModel.statusToString(newStatus)},
      );
    }
  }

  Future<bool> createTask({
    required String title,
    String? description,
    TaskPriority priority = TaskPriority.medium,
    String? dueDate,
    List<TaskLabel> labels = const [],
  }) async {
    final wsState = ref.read(workspaceProvider);
    final projId = wsState.activeProject?.id ?? wsState.activeWorkspace?.projects.firstOrNull?.id ?? 'default';

    final tempId = 'temp-${DateTime.now().millisecondsSinceEpoch}';
    final optimisticTask = TaskViewModel(
      id: tempId,
      humanId: 'TASK-NEW',
      title: title,
      description: description,
      status: TaskStatus.todo,
      priority: priority,
      dueDate: dueDate,
      projectId: projId,
      labels: labels,
      isPending: true,
      createdAt: DateTime.now(),
    );

    // Optimistic insert
    state = state.copyWith(tasks: [optimisticTask, ...state.tasks]);

    final payload = {
      'title': title,
      'description': description,
      'priority': TaskViewModel.priorityToString(priority),
      'dueDate': dueDate,
      'projectId': projId,
      'labels': labels.map((l) => l.toJson()).toList(),
    };

    try {
      final res = await apiClient.post<Map<String, dynamic>>(
        ApiEndpoints.tasks,
        data: payload,
      );
      final created = TaskViewModel.fromJson(res);
      final list = state.tasks.map((t) => t.id == tempId ? created : t).toList();
      state = state.copyWith(tasks: list);
      return true;
    } catch (_) {
      outboxManager.enqueue(
        entityId: tempId,
        method: 'POST',
        path: ApiEndpoints.tasks,
        body: payload,
      );
      return true;
    }
  }

  Future<void> deleteTask(String taskId) async {
    state = state.copyWith(
      tasks: state.tasks.where((t) => t.id != taskId).toList(),
    );

    try {
      await apiClient.delete(ApiEndpoints.taskDetail(taskId));
    } catch (_) {
      outboxManager.enqueue(
        entityId: taskId,
        method: 'DELETE',
        path: ApiEndpoints.taskDetail(taskId),
      );
    }
  }
}

final tasksProvider = NotifierProvider<TasksNotifier, TasksState>(TasksNotifier.new);
