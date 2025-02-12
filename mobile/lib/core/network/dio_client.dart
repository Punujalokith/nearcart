import 'package:dio/dio.dart';
import '../config.dart';
import '../storage/secure_storage.dart';

class DioClient {
  static Dio? _dio;

  static Dio get instance {
    _dio ??= _create();
    return _dio!;
  }

  static Dio _create() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(_AuthInterceptor(dio));
    return dio;
  }
}

class _AuthInterceptor extends Interceptor {
  final Dio dio;
  _AuthInterceptor(this.dio);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await SecureStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken != null) {
        try {
          final refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
          final res = await refreshDio.post('/auth/refresh', data: {'refreshToken': refreshToken});
          final newAccessToken = res.data['accessToken'];
          final newRefreshToken = res.data['refreshToken'];

          await SecureStorage.saveTokens(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          );

          // Retry the original request
          final opts = err.requestOptions;
          opts.headers['Authorization'] = 'Bearer $newAccessToken';
          final response = await dio.fetch(opts);
          return handler.resolve(response);
        } catch (_) {
          await SecureStorage.clearTokens();
        }
      }
    }
    handler.next(err);
  }
}
