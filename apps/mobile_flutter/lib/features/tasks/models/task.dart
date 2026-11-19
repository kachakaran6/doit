enum TaskStatus { todo, inProgress, blocked, done }
enum TaskPriority { low, medium, high, urgent }

class TaskLabel {
  final String id;
  final String name;
  final String color;

  const TaskLabel({required this.id, required this.name, required this.color});

  factory TaskLabel.fromJson(Map<String, dynamic> json) => TaskLabel(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        color: json['color']?.toString() ?? '#3A66F2',
      );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'color': color};
}

class TaskAssignee {
  final String id;
  final String name;
  final String? email;
  final String? avatarUrl;

  const TaskAssignee({required this.id, required this.name, this.email, this.avatarUrl});

  factory TaskAssignee.fromJson(Map<String, dynamic> json) => TaskAssignee(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? json['fullName']?.toString() ?? 'Assignee',
        email: json['email']?.toString(),
        avatarUrl: json['avatarUrl']?.toString(),
      );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email, 'avatarUrl': avatarUrl};
}

class TaskViewModel {
  final String id;
  final String humanId;
  final String title;
  final String? description;
  final TaskStatus status;
  final TaskPriority priority;
  final String? dueDate;
  final String projectId;
  final TaskAssignee? assignee;
  final List<TaskLabel> labels;
  final bool isPending;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const TaskViewModel({
    required this.id,
    required this.humanId,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    this.dueDate,
    required this.projectId,
    this.assignee,
    this.labels = const [],
    this.isPending = false,
    this.createdAt,
    this.updatedAt,
  });

  TaskViewModel copyWith({
    String? id,
    String? humanId,
    String? title,
    String? description,
    TaskStatus? status,
    TaskPriority? priority,
    String? dueDate,
    String? projectId,
    TaskAssignee? assignee,
    List<TaskLabel>? labels,
    bool? isPending,
  }) {
    return TaskViewModel(
      id: id ?? this.id,
      humanId: humanId ?? this.humanId,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      dueDate: dueDate ?? this.dueDate,
      projectId: projectId ?? this.projectId,
      assignee: assignee ?? this.assignee,
      labels: labels ?? this.labels,
      isPending: isPending ?? this.isPending,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'humanId': humanId,
        'title': title,
        'description': description,
        'status': statusToString(status),
        'priority': priorityToString(priority),
        'dueDate': dueDate,
        'projectId': projectId,
        'assignee': assignee?.toJson(),
        'labels': labels.map((l) => l.toJson()).toList(),
      };

  factory TaskViewModel.fromJson(Map<String, dynamic> json) {
    final rawStatus = (json['status'] ?? 'TODO').toString().toUpperCase();
    TaskStatus status;
    switch (rawStatus) {
      case 'IN_PROGRESS':
        status = TaskStatus.inProgress;
        break;
      case 'BLOCKED':
        status = TaskStatus.blocked;
        break;
      case 'DONE':
        status = TaskStatus.done;
        break;
      case 'TODO':
      default:
        status = TaskStatus.todo;
        break;
    }

    final rawPriority = (json['priority'] ?? 'MEDIUM').toString().toUpperCase();
    TaskPriority priority;
    switch (rawPriority) {
      case 'URGENT':
      case 'P0':
        priority = TaskPriority.urgent;
        break;
      case 'HIGH':
      case 'P1':
        priority = TaskPriority.high;
        break;
      case 'LOW':
      case 'P3':
        priority = TaskPriority.low;
        break;
      case 'MEDIUM':
      case 'P2':
      default:
        priority = TaskPriority.medium;
        break;
    }

    final rawLabels = json['labels'] is List
        ? (json['labels'] as List)
            .map((l) => TaskLabel.fromJson(l as Map<String, dynamic>))
            .toList()
        : <TaskLabel>[];

    final rawAssignee = json['assignee'] is Map<String, dynamic>
        ? TaskAssignee.fromJson(json['assignee'] as Map<String, dynamic>)
        : null;

    return TaskViewModel(
      id: json['id']?.toString() ?? '',
      humanId: json['humanId']?.toString() ?? 'TASK',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      status: status,
      priority: priority,
      dueDate: json['dueDate']?.toString(),
      projectId: json['projectId']?.toString() ?? '',
      assignee: rawAssignee,
      labels: rawLabels,
      isPending: json['isPending'] == true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'].toString()) : null,
    );
  }

  static String statusToString(TaskStatus s) {
    switch (s) {
      case TaskStatus.inProgress:
        return 'IN_PROGRESS';
      case TaskStatus.blocked:
        return 'BLOCKED';
      case TaskStatus.done:
        return 'DONE';
      case TaskStatus.todo:
        return 'TODO';
    }
  }

  static String priorityToString(TaskPriority p) {
    switch (p) {
      case TaskPriority.urgent:
        return 'URGENT';
      case TaskPriority.high:
        return 'HIGH';
      case TaskPriority.low:
        return 'LOW';
      case TaskPriority.medium:
        return 'MEDIUM';
    }
  }
}
