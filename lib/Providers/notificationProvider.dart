import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../Services/workspaceService.dart';
import 'authProvider.dart';
import 'workspaceProvider.dart';

class NotificationState {
  final bool isLoading;
  final List<dynamic> invitations; // pending invites
  final String? error;

  const NotificationState({
    this.isLoading = false,
    this.invitations = const [],
    this.error,
  });

  NotificationState copyWith({
    bool? isLoading,
    List<dynamic>? invitations,
    String? error,
  }) {
    return NotificationState(
      isLoading: isLoading ?? this.isLoading,
      invitations: invitations ?? this.invitations,
      error: error,
    );
  }

  // ✅ Only count pending ones for the bell badge
  int get pendingCount =>
      invitations.where((i) => i['status'] == 'PENDING').length;
}

class NotificationNotifier extends Notifier<NotificationState> {
  @override
  NotificationState build() => const NotificationState();

  Future<void> fetchInvitations() async {
    final auth = ref.read(authProvider);
    if (auth.token == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final invitations = await WorkspaceService.getInvitations(auth.token!);
      state = state.copyWith(isLoading: false, invitations: invitations);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<bool> acceptInvitation(int invitationId) async {
    final auth = ref.read(authProvider);
    if (auth.token == null) return false;

    try {
      await WorkspaceService.acceptInvitation(invitationId, auth.token!);

      // Remove from list locally
      final updated = state.invitations
          .where((i) => i['id'] != invitationId)
          .toList();
      state = state.copyWith(invitations: updated);

      // Refresh workspaces so the new one appears in HomePage
      ref.read(workspaceProvider.notifier).fetchWorkspaces();
      return true;
    } catch (e) {
      state = state.copyWith(
          error: e.toString().replaceAll('Exception: ', ''));
      return false;
    }
  }

  Future<bool> declineInvitation(int invitationId) async {
    final auth = ref.read(authProvider);
    if (auth.token == null) return false;

    try {
      await WorkspaceService.declineInvitation(invitationId, auth.token!);

      // Remove from list locally
      final updated = state.invitations
          .where((i) => i['id'] != invitationId)
          .toList();
      state = state.copyWith(invitations: updated);
      return true;
    } catch (e) {
      state = state.copyWith(
          error: e.toString().replaceAll('Exception: ', ''));
      return false;
    }
  }
}

final notificationProvider =
    NotifierProvider<NotificationNotifier, NotificationState>(
  NotificationNotifier.new,
);

