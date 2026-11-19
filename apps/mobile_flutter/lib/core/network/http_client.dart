import 'dart:async';
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../storage/local_storage.dart';
import 'api_endpoints.dart';
import 'api_error.dart';

class HttpClient {
  static final HttpClient _instance = HttpClient._internal();
  factory HttpClient() => _instance;

  late final Dio dio;
  final SecureStorageService _secureStorage = SecureStorageService();
  final LocalStorageService _localStorage = LocalStorageService();

  String? _authToken;
  String? _workspaceId;
  String _baseUrl = ApiEndpoints.productionBaseUrl;

  Completer<String?>? _refreshCompleter;
  void Function()? onUnauthorized;

  HttpClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-client-platform': 'flutter',
        },
      ),
    );

    _setupInterceptors();
    _initializeConfig();
  }

  Future<void> _initializeConfig() async {
    final customUrl = await _localStorage.getCustomApiUrl();
    if (customUrl != null && customUrl.isNotEmpty) {
      _baseUrl = customUrl;
      dio.options.baseUrl = _baseUrl;
    }
    _authToken = await _secureStorage.getAccessToken();
    _workspaceId = await _localStorage.getActiveWorkspaceId();
  }

  void setBaseUrl(String url) {
    _baseUrl = url.replaceAll(RegExp(r'/+$'), '');
    dio.options.baseUrl = _baseUrl;
    _localStorage.saveCustomApiUrl(_baseUrl);
  }

  String getBaseUrl() => _baseUrl;
  String get baseUrl => _baseUrl;

  void setAuthToken(String? token) {
    _authToken = token;
  }

  String? getAuthToken() => _authToken;
  String? get authToken => _authToken;
  Future<String?> getRefreshToken() => _secureStorage.getRefreshToken();

  void setWorkspaceId(String? workspaceId) {
    _workspaceId = workspaceId;
    _localStorage.saveActiveWorkspaceId(workspaceId);
  }

  String? getWorkspaceId() => _workspaceId;

  void _setupInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken != null && _authToken!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          if (_workspaceId != null && _workspaceId!.isNotEmpty) {
            options.headers['x-workspace-id'] = _workspaceId;
          }
          return handler.next(options);
        },
        onError: (DioException err, handler) async {
          final statusCode = err.response?.statusCode;

          // Mutex-guarded Token Refresh on 401
          if (statusCode == 401 && !err.requestOptions.path.contains('/auth/refresh')) {
            try {
              final newToken = await _executeTokenRefresh();
              if (newToken != null) {
                // Retry failed request with new token
                final opts = Options(
                  method: err.requestOptions.method,
                  headers: {
                    ...err.requestOptions.headers,
                    'Authorization': 'Bearer $newToken',
                  },
                );
                final retryRes = await dio.request(
                  err.requestOptions.path,
                  data: err.requestOptions.data,
                  queryParameters: err.requestOptions.queryParameters,
                  options: opts,
                );
                return handler.resolve(retryRes);
              }
            } catch (_) {}

            onUnauthorized?.call();
          }

          // Convert into structured ApiError
          if (err.response != null && err.response?.data is Map<String, dynamic>) {
            final apiError = ApiError.fromJson(
              err.response!.data as Map<String, dynamic>,
              statusCode ?? 500,
            );
            return handler.reject(
              DioException(
                requestOptions: err.requestOptions,
                response: err.response,
                error: apiError,
                message: apiError.message,
              ),
            );
          }

          return handler.next(err);
        },
      ),
    );
  }

  Future<String?> _executeTokenRefresh() async {
    // If a refresh is already in progress, wait for it
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }

    _refreshCompleter = Completer<String?>();

    try {
      final refreshToken = await _secureStorage.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        _refreshCompleter!.complete(null);
        return null;
      }

      final refreshDio = Dio(
        BaseOptions(
          baseUrl: _baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ),
      );

      final res = await refreshDio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = res.data is Map ? (res.data['data'] ?? res.data) : null;
        final newAccess = data?['accessToken']?.toString();
        final newRefresh = data?['refreshToken']?.toString() ?? refreshToken;

        if (newAccess != null) {
          _authToken = newAccess;
          await _secureStorage.saveTokens(
            accessToken: newAccess,
            refreshToken: newRefresh,
          );
          _refreshCompleter!.complete(newAccess);
          return newAccess;
        }
      }
    } catch (_) {
      // Network failure on refresh - do not logout yet, return null
    } finally {
      final c = _refreshCompleter;
      _refreshCompleter = null;
      if (!c!.isCompleted) c.complete(null);
    }

    return null;
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    final res = await dio.get(path, queryParameters: queryParameters);
    return _unwrapResponse<T>(res.data);
  }

  Future<T> post<T>(String path, {dynamic data, Map<String, dynamic>? headers}) async {
    final opts = headers != null ? Options(headers: headers) : null;
    final res = await dio.post(path, data: data, options: opts);
    return _unwrapResponse<T>(res.data);
  }

  Future<T> patch<T>(String path, {dynamic data}) async {
    final res = await dio.patch(path, data: data);
    return _unwrapResponse<T>(res.data);
  }

  Future<T> put<T>(String path, {dynamic data}) async {
    final res = await dio.put(path, data: data);
    return _unwrapResponse<T>(res.data);
  }

  Future<T> delete<T>(String path, {dynamic data}) async {
    final res = await dio.delete(path, data: data);
    return _unwrapResponse<T>(res.data);
  }

  T _unwrapResponse<T>(dynamic body) {
    if (body is Map<String, dynamic> && body.containsKey('data')) {
      return body['data'] as T;
    }
    return body as T;
  }
}

final apiClient = HttpClient();
