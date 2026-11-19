class StickyViewModel {
  final String id;
  final String body;
  final String color;
  final bool isPinned;
  final String? convertedTaskId;
  final String projectId;
  final DateTime? createdAt;

  const StickyViewModel({
    required this.id,
    required this.body,
    this.color = '#FEF08A', // Soft yellow default
    this.isPinned = false,
    this.convertedTaskId,
    required this.projectId,
    this.createdAt,
  });

  StickyViewModel copyWith({
    String? id,
    String? body,
    String? color,
    bool? isPinned,
    String? convertedTaskId,
    String? projectId,
  }) {
    return StickyViewModel(
      id: id ?? this.id,
      body: body ?? this.body,
      color: color ?? this.color,
      isPinned: isPinned ?? this.isPinned,
      convertedTaskId: convertedTaskId ?? this.convertedTaskId,
      projectId: projectId ?? this.projectId,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'body': body,
        'color': color,
        'isPinned': isPinned,
        'convertedTaskId': convertedTaskId,
        'projectId': projectId,
      };

  factory StickyViewModel.fromJson(Map<String, dynamic> json) => StickyViewModel(
        id: json['id']?.toString() ?? '',
        body: json['body']?.toString() ?? '',
        color: json['color']?.toString() ?? '#FEF08A',
        isPinned: json['isPinned'] == true,
        convertedTaskId: json['convertedTaskId']?.toString(),
        projectId: json['projectId']?.toString() ?? '',
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}
