enum BugSeverity { critical, major, minor, trivial }
enum BugStatus { triaged, inProgress, resolved, verified }

class DeviceTelemetry {
  final String deviceModel;
  final String osVersion;
  final String appVersion;
  final String buildNumber;
  final String timestamp;
  final String? screenResolution;
  final double? batteryLevel;
  final int? freeMemoryMb;

  const DeviceTelemetry({
    required this.deviceModel,
    required this.osVersion,
    required this.appVersion,
    required this.buildNumber,
    required this.timestamp,
    this.screenResolution,
    this.batteryLevel,
    this.freeMemoryMb,
  });

  Map<String, dynamic> toJson() => {
        'deviceModel': deviceModel,
        'osVersion': osVersion,
        'appVersion': appVersion,
        'buildNumber': buildNumber,
        'timestamp': timestamp,
        'screenResolution': screenResolution,
        'batteryLevel': batteryLevel,
        'freeMemoryMb': freeMemoryMb,
      };

  factory DeviceTelemetry.fromJson(Map<String, dynamic> json) => DeviceTelemetry(
        deviceModel: json['deviceModel']?.toString() ?? 'Mobile Device',
        osVersion: json['osVersion']?.toString() ?? '14.0',
        appVersion: json['appVersion']?.toString() ?? '1.0.0',
        buildNumber: json['buildNumber']?.toString() ?? '1',
        timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
        screenResolution: json['screenResolution']?.toString(),
        batteryLevel: (json['batteryLevel'] as num?)?.toDouble(),
        freeMemoryMb: json['freeMemoryMb'] as int?,
      );
}

class BugViewModel {
  final String id;
  final String humanId;
  final String title;
  final String? description;
  final BugSeverity severity;
  final BugStatus status;
  final String projectId;
  final List<String> reproductionSteps;
  final DeviceTelemetry? telemetry;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const BugViewModel({
    required this.id,
    required this.humanId,
    required this.title,
    this.description,
    required this.severity,
    required this.status,
    required this.projectId,
    this.reproductionSteps = const [],
    this.telemetry,
    this.createdAt,
    this.updatedAt,
  });

  BugViewModel copyWith({
    String? id,
    String? humanId,
    String? title,
    String? description,
    BugSeverity? severity,
    BugStatus? status,
    String? projectId,
    List<String>? reproductionSteps,
    DeviceTelemetry? telemetry,
  }) {
    return BugViewModel(
      id: id ?? this.id,
      humanId: humanId ?? this.humanId,
      title: title ?? this.title,
      description: description ?? this.description,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      projectId: projectId ?? this.projectId,
      reproductionSteps: reproductionSteps ?? this.reproductionSteps,
      telemetry: telemetry ?? this.telemetry,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'humanId': humanId,
        'title': title,
        'description': description,
        'severity': severityToString(severity),
        'status': statusToString(status),
        'projectId': projectId,
        'reproductionSteps': reproductionSteps,
        'telemetry': telemetry?.toJson(),
      };

  factory BugViewModel.fromJson(Map<String, dynamic> json) {
    final rawSev = (json['severity'] ?? 'MAJOR').toString().toUpperCase();
    BugSeverity sev;
    switch (rawSev) {
      case 'CRITICAL':
        sev = BugSeverity.critical;
        break;
      case 'MINOR':
        sev = BugSeverity.minor;
        break;
      case 'TRIVIAL':
        sev = BugSeverity.trivial;
        break;
      case 'MAJOR':
      default:
        sev = BugSeverity.major;
        break;
    }

    final rawStat = (json['status'] ?? 'TRIAGED').toString().toUpperCase();
    BugStatus stat;
    switch (rawStat) {
      case 'IN_PROGRESS':
        stat = BugStatus.inProgress;
        break;
      case 'RESOLVED':
        stat = BugStatus.resolved;
        break;
      case 'VERIFIED':
        stat = BugStatus.verified;
        break;
      case 'TRIAGED':
      default:
        stat = BugStatus.triaged;
        break;
    }

    final rawSteps = json['reproductionSteps'] is List
        ? (json['reproductionSteps'] as List).map((s) => s.toString()).toList()
        : <String>[];

    final rawTelemetry = json['telemetry'] is Map<String, dynamic>
        ? DeviceTelemetry.fromJson(json['telemetry'] as Map<String, dynamic>)
        : null;

    return BugViewModel(
      id: json['id']?.toString() ?? '',
      humanId: json['humanId']?.toString() ?? 'BUG',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      severity: sev,
      status: stat,
      projectId: json['projectId']?.toString() ?? '',
      reproductionSteps: rawSteps,
      telemetry: rawTelemetry,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'].toString()) : null,
    );
  }

  static String severityToString(BugSeverity s) {
    switch (s) {
      case BugSeverity.critical:
        return 'CRITICAL';
      case BugSeverity.minor:
        return 'MINOR';
      case BugSeverity.trivial:
        return 'TRIVIAL';
      case BugSeverity.major:
        return 'MAJOR';
    }
  }

  static String statusToString(BugStatus s) {
    switch (s) {
      case BugStatus.inProgress:
        return 'IN_PROGRESS';
      case BugStatus.resolved:
        return 'RESOLVED';
      case BugStatus.verified:
        return 'VERIFIED';
      case BugStatus.triaged:
        return 'TRIAGED';
    }
  }
}
