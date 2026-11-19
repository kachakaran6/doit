import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';

class VersionPolicyState {
  final bool checked;
  final bool needsUpdate;
  final String? minAppVersion;
  final String? downloadUrl;

  const VersionPolicyState({
    this.checked = false,
    this.needsUpdate = false,
    this.minAppVersion,
    this.downloadUrl,
  });
}

class VersionPolicyNotifier extends Notifier<VersionPolicyState> {
  @override
  VersionPolicyState build() {
    _checkVersion();
    return const VersionPolicyState();
  }

  Future<void> _checkVersion() async {
    try {
      final pkg = await PackageInfo.fromPlatform();
      final currentBuild = int.tryParse(pkg.buildNumber) ?? 1;

      final res = await apiClient.get<Map<String, dynamic>>(ApiEndpoints.versionPolicy);
      final minBuild = res['minBuildNumber'] as int? ?? 1;
      final minVer = res['minVersion']?.toString() ?? '1.0.0';
      final url = res['downloadUrl']?.toString() ?? 'https://doit.samyukt.pro';

      if (currentBuild < minBuild) {
        state = VersionPolicyState(
          checked: true,
          needsUpdate: true,
          minAppVersion: minVer,
          downloadUrl: url,
        );
        return;
      }
    } catch (_) {}

    state = const VersionPolicyState(checked: true, needsUpdate: false);
  }
}

final versionPolicyProvider =
    NotifierProvider<VersionPolicyNotifier, VersionPolicyState>(VersionPolicyNotifier.new);
