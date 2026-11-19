class ProjectItem {
  final String id;
  final String name;
  final String key;
  final String? color;
  final String workspaceId;

  const ProjectItem({
    required this.id,
    required this.name,
    required this.key,
    this.color,
    required this.workspaceId,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'key': key,
        'color': color,
        'workspaceId': workspaceId,
      };

  factory ProjectItem.fromJson(Map<String, dynamic> json) {
    return ProjectItem(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      key: json['key']?.toString() ?? '',
      color: json['color']?.toString(),
      workspaceId: json['workspaceId']?.toString() ?? '',
    );
  }
}

class WorkspaceItem {
  final String id;
  final String name;
  final String slug;
  final String role;
  final List<ProjectItem> projects;

  const WorkspaceItem({
    required this.id,
    required this.name,
    required this.slug,
    required this.role,
    this.projects = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'role': role,
        'projects': projects.map((p) => p.toJson()).toList(),
      };

  factory WorkspaceItem.fromJson(Map<String, dynamic> json) {
    final projs = json['projects'] is List
        ? (json['projects'] as List)
            .map((p) => ProjectItem.fromJson(p as Map<String, dynamic>))
            .toList()
        : <ProjectItem>[];

    return WorkspaceItem(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      role: json['role']?.toString() ?? 'member',
      projects: projs,
    );
  }
}

class TeamMember {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? avatarUrl;

  const TeamMember({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
  });

  factory TeamMember.fromJson(Map<String, dynamic> json) {
    return TeamMember(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? json['name']?.toString() ?? 'Team Member',
      role: json['role']?.toString() ?? 'member',
      avatarUrl: json['avatarUrl']?.toString(),
    );
  }
}
