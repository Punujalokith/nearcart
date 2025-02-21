import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/storage/secure_storage.dart';

class AuthRepository {
  final Dio _dio = DioClient.instance;

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String role = 'BUYER',
  }) async {
    final res = await _dio.post(ApiEndpoints.register, data: {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _dio.post(ApiEndpoints.login, data: {
      'email': email,
      'password': password,
    });
    return res.data;
  }

  Future<void> logout() async {
    final token = await SecureStorage.getRefreshToken();
    try {
      await _dio.post(ApiEndpoints.logout, data: {'refreshToken': token});
    } catch (_) {}
    await SecureStorage.clearTokens();
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await _dio.get(ApiEndpoints.me);
    return res.data;
  }
}
