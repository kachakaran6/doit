import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const _activeWorkspaceIdKey = 'doit_active_workspace_id';
  static const _activeProjectIdKey = 'doit_active_project_id';
  static const _customApiUrlKey = 'doit_custom_api_url';
  static const _shakeEnabledKey = 'doit_shake_enabled';
  static const _shakeSensitivityKey = 'doit_shake_sensitivity'; // low, normal, high
  static const _overlayBubbleEnabledKey = 'doit_overlay_bubble_enabled';
  static const _aiProviderKey = 'doit_ai_provider';

  Future<void> saveActiveWorkspaceId(String? id) async {
    final prefs = await SharedPreferences.getInstance();
    if (id == null) {
      await prefs.remove(_activeWorkspaceIdKey);
    } else {
      await prefs.setString(_activeWorkspaceIdKey, id);
    }
  }

  Future<String?> getActiveWorkspaceId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_activeWorkspaceIdKey);
  }

  Future<void> saveActiveProjectId(String? id) async {
    final prefs = await SharedPreferences.getInstance();
    if (id == null) {
      await prefs.remove(_activeProjectIdKey);
    } else {
      await prefs.setString(_activeProjectIdKey, id);
    }
  }

  Future<String?> getActiveProjectId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_activeProjectIdKey);
  }

  Future<void> saveCustomApiUrl(String? url) async {
    final prefs = await SharedPreferences.getInstance();
    if (url == null) {
      await prefs.remove(_customApiUrlKey);
    } else {
      await prefs.setString(_customApiUrlKey, url);
    }
  }

  Future<String?> getCustomApiUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_customApiUrlKey);
  }

  Future<void> setShakeEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_shakeEnabledKey, enabled);
  }

  Future<bool> getShakeEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_shakeEnabledKey) ?? true;
  }

  Future<void> setShakeSensitivity(String sensitivity) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_shakeSensitivityKey, sensitivity);
  }

  Future<String> getShakeSensitivity() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_shakeSensitivityKey) ?? 'normal';
  }

  Future<void> setOverlayBubbleEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_overlayBubbleEnabledKey, enabled);
  }

  Future<bool> getOverlayBubbleEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_overlayBubbleEnabledKey) ?? true;
  }

  Future<void> setAiProvider(String provider) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_aiProviderKey, provider);
  }

  Future<String> getAiProvider() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_aiProviderKey) ?? 'openai';
  }
}
