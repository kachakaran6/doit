class UserViewModel {
  final String id;
  final String email;
  final String fullName;
  final String? avatarUrl;

  const UserViewModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.avatarUrl,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullName': fullName,
        'avatarUrl': avatarUrl,
      };

  factory UserViewModel.fromJson(Map<String, dynamic> json) {
    final rawName = (json['fullName'] ?? json['name'] ?? '').toString().trim();
    final email = json['email']?.toString() ?? '';
    final name = rawName.isNotEmpty
        ? (rawName.toLowerCase() == 'active user' ? (email.split('@').first) : rawName)
        : (email.isNotEmpty ? email.split('@').first : 'User');

    return UserViewModel(
      id: json['id']?.toString() ?? '',
      email: email,
      fullName: name,
      avatarUrl: json['avatarUrl']?.toString(),
    );
  }
}

class AuthSession {
  final String accessToken;
  final String refreshToken;
  final UserViewModel user;

  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'user': user.toJson(),
      };

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      user: UserViewModel.fromJson(
        json['user'] is Map<String, dynamic>
            ? json['user'] as Map<String, dynamic>
            : json,
      ),
    );
  }
}
