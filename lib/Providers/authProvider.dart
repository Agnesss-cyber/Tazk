import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../Services/authService.dart';

// ─── STATE ────────────────────────────────────────────
// Holds everything auth-related that the UI might need
class AuthState {
  final bool isLoading;
  final String? token;
  final String? error;
  final Map<String, dynamic>? user; // stores { id, fullName, email }

  const AuthState({
    this.isLoading = false,
    this.token,
    this.error,
    this.user,
  });

  AuthState copyWith({
    bool? isLoading,
    String? token,
    String? error,
    Map<String, dynamic>? user,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      error: error,         // error resets to null if not passed
      user: user ?? this.user,
    );
  }
}

// NOTIFIER 
class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  // Called when user taps "Log In"
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      //  Send request to  (C# backend)
      final result = await AuthService.login(email, password);
      print('🔍 Full result from backend: $result'); 
      print('🔑 Token: ${result['token']}'); 
      print('👤 User: ${result['user']}');

      // Save the token and user info
      state = state.copyWith(
        isLoading: false,
        token: result['token'],
        user: result['user'],
      );
      return true; // success — UI can navigate

    } catch (e) {
      // Kitchen returned an error
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false; // failed — UI stays on login page
    }
  }

  // Called when user taps "Sign Up"
  Future<bool> register(String fullName, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await AuthService.register(fullName, email, password);

      state = state.copyWith(isLoading: false);
      return true; // success — UI can navigate to login

    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  // Called when user logs out
  void logout() {
    state = const AuthState();
  }
}

// ─── PROVIDER 
final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);