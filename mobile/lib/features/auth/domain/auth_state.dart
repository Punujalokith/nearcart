class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    id:    json['id'],
    name:  json['name'],
    email: json['email'],
    role:  json['role'],
    phone: json['phone'],
  );
}

class AuthState {
  final AppUser? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({AppUser? user, bool? isLoading, String? error, bool clearUser = false}) =>
      AuthState(
        user:      clearUser ? null : (user ?? this.user),
        isLoading: isLoading ?? this.isLoading,
        error:     error,
      );
}
