class ApiEndpoints {
  static const String productionBaseUrl = 'https://doit.samyukt.pro/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // Workspaces & Projects
  static const String workspaces = '/workspaces';
  static String workspaceMembers(String workspaceId) => '/workspaces/$workspaceId/members';
  static String projects(String workspaceId) => '/workspaces/$workspaceId/projects';

  // Tasks
  static const String tasks = '/tasks';
  static String taskDetail(String id) => '/tasks/$id';
  static String taskStatus(String id) => '/tasks/$id/status';
  static const String taskBatch = '/tasks/batch';

  // Bugs
  static const String bugs = '/bugs';
  static String bugDetail(String id) => '/bugs/$id';
  static String bugStatus(String id) => '/bugs/$id/status';

  // Stickies
  static const String stickies = '/stickies';
  static String stickyDetail(String id) => '/stickies/$id';
  static String stickyPin(String id) => '/stickies/$id/pin';

  // System & Version
  static const String versionPolicy = '/system/version-policy';
}
