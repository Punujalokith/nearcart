import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../data/auth_repository.dart';
import '../../../core/storage/secure_storage.dart';
import 'auth_state.dart';

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(AuthRepository());
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState()) {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    final token = await SecureStorage.getAccessToken();
    if (token != null) {
      try {
        final me = await _repo.getMe();
        state = AuthState(user: AppUser.fromJson(me));
      } catch (_) {
        await SecureStorage.clearTokens();
      }
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _repo.login(email: email, password: password);
      await SecureStorage.saveTokens(
        accessToken:  data['accessToken'],
        refreshToken: data['refreshToken'],
      );
      final me = await _repo.getMe();
      state = AuthState(user: AppUser.fromJson(me));
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['error'] ?? 'Login failed',
      );
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _repo.register(name: name, email: email, password: password);
      await SecureStorage.saveTokens(
        accessToken:  data['accessToken'],
        refreshToken: data['refreshToken'],
      );
      final me = await _repo.getMe();
      state = AuthState(user: AppUser.fromJson(me));
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['error'] ?? 'Registration failed',
      );
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState();
  }
}
