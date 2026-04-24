import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../Services/workspaceService.dart';
import 'authProvider.dart';

// State
class WorkspaceState {
  final bool isLoading;
  final List<dynamic> workspaces;
  final String? error;

  const WorkspaceState({
    this.isLoading = false,
    this.workspaces = const [],
    this.error,
  });

  WorkspaceState copyWith({
    bool? isLoading,
    List<dynamic>? workspaces,
    String? error,
  }) {
    return WorkspaceState(
      isLoading: isLoading ?? this.isLoading,
      workspaces: workspaces ?? this.workspaces,
      error: error,
    );
  }
}

// Notifier
class WorkspaceNotifier extends Notifier<WorkspaceState> {
  @override
  WorkspaceState build() => const WorkspaceState();

  // Call this when HomePage loads
  Future<void> fetchWorkspaces() async {
    final auth = ref.read(authProvider);
    if (auth.token == null || auth.user == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final userId = auth.user!['id'] as int;
      final workspaces = await WorkspaceService.getWorkspaces(
        userId,
        auth.token!,
      );
      state = state.copyWith(isLoading: false, workspaces: workspaces);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<bool> createWorkspace(String name, String type) async {
    final auth = ref.read(authProvider);
    print('token: ${auth.token}'); 
    print('user: ${auth.user}');
    if (auth.token == null || auth.user == null) return false;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final userId = auth.user!['id'] as int;
      final newWorkspace = await WorkspaceService.createWorkspace(
        name,
        type,
        userId,
        auth.token!,
      );

      // Add new workspace to existing list
      final updated = [...state.workspaces, newWorkspace];
      state = state.copyWith(isLoading: false, workspaces: updated);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> sendInvite(int workspaceId, String email) async {
    final auth = ref.read(authProvider);
    if (auth.token == null) return false;

    try {
      await WorkspaceService.sendInvite(workspaceId, email, auth.token!);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString().replaceAll('Exception: ', ''));
      return false;
    }
  }
}

final workspaceProvider = NotifierProvider<WorkspaceNotifier, WorkspaceState>(
  WorkspaceNotifier.new,
);
