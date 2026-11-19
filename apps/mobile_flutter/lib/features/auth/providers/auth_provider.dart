import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/native/system_overlay_service.dart';
import '../models/auth_session.dart';

class AuthState {
  final bool isInitialized;
  final bool isAuthenticated;
  final UserViewModel? user;
  final String? accessToken;
  final String? errorMessage;
  final bool isLoading;

  const AuthState({
    required this.isInitialized,
    required this.isAuthenticated,
    this.user,
    this.accessToken,
    this.errorMessage,
    this.isLoading = false,
  });

  AuthState copyWith({
    bool? isInitialized,
    bool? isAuthenticated,
    UserViewModel? user,
    String? accessToken,
    String? errorMessage,
    bool? isLoading,
  }) {
    return AuthState(
      isInitialized: isInitialized ?? this.isInitialized,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      errorMessage: errorMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final SecureStorageService _secureStorage = SecureStorageService();

  @override
  AuthState build() {
    _initAuth();
    return const AuthState(
      isInitialized: false,
      isAuthenticated: false,
    );
  }

  Future<void> _initAuth() async {
    try {
      final token = await _secureStorage.getAccessToken();
      final userJson = await _secureStorage.getUserSession();

      if (token != null && token.isNotEmpty) {
        apiClient.setAuthToken(token);
        UserViewModel? user;
        if (userJson != null) {
          user = UserViewModel.fromJson(userJson);
        }

        state = AuthState(
          isInitialized: true,
          isAuthenticated: true,
          accessToken: token,
          user: user,
        );

        SystemOverlayService.syncAuthCredentials(
          token: token,
          baseUrl: 'https://doit.samyukt.pro/api/v1',
        );

        // Background profile refresh from /auth/me
        _refreshUserProfile();
        return;
      }
    } catch (_) {}

    state = const AuthState(isInitialized: true, isAuthenticated: false);
  }

  Future<void> _refreshUserProfile() async {
    try {
      final res = await apiClient.get<Map<String, dynamic>>(ApiEndpoints.me);
      final userObj = res['user'] is Map<String, dynamic> ? res['user'] : res;
      final user = UserViewModel.fromJson(userObj as Map<String, dynamic>);
      state = state.copyWith(user: user);
      await _secureStorage.saveUserSession(user.toJson());
    } catch (_) {}
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.post<Map<String, dynamic>>(
        ApiEndpoints.login,
        data: {'email': email.trim(), 'password': password},
      );

      final session = AuthSession.fromJson(res);
      apiClient.setAuthToken(session.accessToken);
      await _secureStorage.saveTokens(
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      );
      await _secureStorage.saveUserSession(session.user.toJson());

      state = AuthState(
        isInitialized: true,
        isAuthenticated: true,
        accessToken: session.accessToken,
        user: session.user,
        isLoading: false,
      );

      SystemOverlayService.syncAuthCredentials(
        token: session.accessToken,
        refreshToken: session.refreshToken,
        baseUrl: 'https://doit.samyukt.pro/api/v1',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('ApiError: ', ''),
      );
      return false;
    }
  }

  Future<void> logout() async {
    apiClient.setAuthToken(null);
    await _secureStorage.clearAll();
    state = const AuthState(isInitialized: true, isAuthenticated: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
