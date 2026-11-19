class ApiError implements Exception {
  final int status;
  final String code;
  final String message;
  final Map<String, dynamic>? details;
  final String? traceId;

  const ApiError({
    required this.status,
    required this.code,
    required this.message,
    this.details,
    this.traceId,
  });

  factory ApiError.fromJson(Map<String, dynamic> json, int status) {
    final errObj = json['error'] is Map<String, dynamic>
        ? json['error'] as Map<String, dynamic>
        : json;

    return ApiError(
      status: status,
      code: errObj['code']?.toString() ?? 'API_ERROR',
      message: errObj['message']?.toString() ?? 'An unknown error occurred.',
      details: errObj['details'] is Map<String, dynamic>
          ? errObj['details'] as Map<String, dynamic>
          : null,
      traceId: errObj['traceId']?.toString(),
    );
  }

  @override
  String toString() => 'ApiError($status - $code): $message';
}
