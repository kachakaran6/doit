import 'dart:io';
import 'package:flutter/services.dart';

class CleanScreenshotResult {
  final String uri;
  final String name;
  final int sizeBytes;
  final String mimeType;

  CleanScreenshotResult({
    required this.uri,
    required this.name,
    required this.sizeBytes,
    required this.mimeType,
  });
}

class SystemOverlayService {
  static const MethodChannel _channel = MethodChannel('com.samyukt.doit/overlay_service');

  static bool get isAndroid => Platform.isAndroid;

  static void setOnItemCreatedListener(void Function() callback) {
    if (!isAndroid) return;
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onItemCreated') {
        callback();
      }
    });
  }

  static Future<bool> isAvailable() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('isAvailable');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> hasPermission() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('hasPermission');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<void> requestPermission() async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('requestPermission');
    } catch (_) {}
  }

  static Future<void> openAppSettings() async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('openAppSettings');
    } catch (_) {}
  }

  static Future<bool> startBubble() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('startBubble');
      return res ?? false;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> stopBubble() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('stopBubble');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> isBubbleRunning() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('isBubbleRunning');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<void> syncAuthCredentials({
    required String? token,
    String? refreshToken,
    String baseUrl = 'https://doit.samyukt.pro/api/v1',
    String? projectId,
    String? workspaceId,
  }) async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('syncAuthCredentialsFull', {
        'token': token,
        'refreshToken': refreshToken,
        'baseUrl': baseUrl,
        'projectId': projectId,
        'workspaceId': workspaceId,
      });
    } catch (_) {}
  }

  static Future<void> setShakeEnabled(bool enabled, [String sensitivity = 'normal']) async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('setShakeEnabled', {
        'enabled': enabled,
        'sensitivity': sensitivity,
      });
    } catch (_) {}
  }

  static Future<void> updateThemeConfig({
    required String mode,
    required String resolvedTheme,
    required String accent,
    required String accentFill,
    required String accentSoft,
  }) async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('updateThemeConfig', {
        'mode': mode,
        'resolvedTheme': resolvedTheme,
        'accent': accent,
        'accentFill': accentFill,
        'accentSoft': accentSoft,
      });
    } catch (_) {}
  }

  static Future<bool> isAccessibilityEnabled() async {
    if (!isAndroid) return false;
    try {
      final res = await _channel.invokeMethod<bool>('isAccessibilityEnabled');
      return res ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<void> openAccessibilitySettings() async {
    if (!isAndroid) return;
    try {
      await _channel.invokeMethod('openAccessibilitySettings');
    } catch (_) {}
  }

  static Future<CleanScreenshotResult?> captureCleanScreenshot() async {
    if (!isAndroid) return null;
    try {
      final res = await _channel.invokeMapMethod<String, dynamic>('captureCleanScreenshot');
      if (res != null) {
        return CleanScreenshotResult(
          uri: res['uri'] as String,
          name: res['name'] as String,
          sizeBytes: (res['sizeBytes'] as num).toInt(),
          mimeType: res['mimeType'] as String,
        );
      }
    } catch (_) {}
    return null;
  }
}
