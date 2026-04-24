import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '/colors.dart';
import '/Providers/notificationProvider.dart';
import '/Providers/membersProvider.dart';

// DASHBOARD 
class Dashboard extends ConsumerStatefulWidget {
  final int workspaceId;
  final String workspaceName;

  const Dashboard({
    super.key,
    required this.workspaceId,
    required this.workspaceName,
  });

  @override
  ConsumerState<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends ConsumerState<Dashboard> {
  int _selectedIndex = 0;

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.dashboard_outlined, label: 'Overview'),
    _NavItem(icon: Icons.view_kanban_outlined, label: 'Boards'),
    _NavItem(icon: Icons.task_alt_outlined, label: 'Tasks'),
    _NavItem(icon: Icons.people_outline, label: 'Members'),
    _NavItem(icon: Icons.settings_outlined, label: 'Settings'),
  ];

  @override
  void initState() {
    super.initState();
    // Fetch invitations so bell badge is up to date
    Future.microtask(() {
      ref.read(notificationProvider.notifier).fetchInvitations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifState = ref.watch(notificationProvider);
    final pendingCount = notifState.pendingCount;

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: CustomScrollView(
        slivers: [
          // ── App Bar ───────────────────────────────────────
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.offWhite,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new,
                color: AppColors.darkGray,
                size: 20,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              widget.workspaceName,
              style: const TextStyle(
                color: AppColors.darkGray,
                fontWeight: FontWeight.w900,
                fontSize: 22,
              ),
            ),
            actions: [
              // ✅ Bell with badge
              Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.notifications_outlined,
                      color: AppColors.darkGray,
                    ),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => NotificationsPage(
                          workspaceName: widget.workspaceName,
                        ),
                      ),
                    ),
                  ),
                  if (pendingCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            pendingCount > 9 ? '9+' : '$pendingCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.more_horiz, color: AppColors.darkGray),
                onPressed: () {},
              ),
              const SizedBox(width: 8),
            ],
          ),

          // Nav Pills 
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(_navItems.length, (i) {
                    final selected = _selectedIndex == i;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedIndex = i),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.slateBlue : Colors.white,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: selected
                                ? AppColors.slateBlue
                                : AppColors.lightGray.withOpacity(0.5),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _navItems[i].icon,
                              size: 16,
                              color: selected
                                  ? Colors.white
                                  : AppColors.darkGray,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _navItems[i].label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: selected
                                    ? Colors.white
                                    : AppColors.darkGray,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),

          // Tab Body 
          SliverToBoxAdapter(
            child: IndexedStack(
              index: _selectedIndex,
              children: [
                _OverviewTab(workspaceId: widget.workspaceId),
                BoardsTab(workspaceId: widget.workspaceId),
                _PlaceholderTab(icon: Icons.task_alt_outlined, label: 'Tasks'),
                MembersTab(workspaceId: widget.workspaceId), // ✅ real screen
                _PlaceholderTab(
                  icon: Icons.settings_outlined,
                  label: 'Settings',
                ),
              ],
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.slateBlue,
        onPressed: () {},
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

// MEMBERS TAB 
class MembersTab extends ConsumerStatefulWidget {
  final int workspaceId;
  const MembersTab({super.key, required this.workspaceId});

  @override
  ConsumerState<MembersTab> createState() => _MembersTabState();
}

class _MembersTabState extends ConsumerState<MembersTab> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref
          .read(membersProvider(widget.workspaceId).notifier)
          .fetchMembers(widget.workspaceId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final membersState = ref.watch(membersProvider(widget.workspaceId));

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            'MEMBERS',
            style: TextStyle(
              color: AppColors.slateBlue,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),

          if (membersState.isLoading)
            const Center(child: CircularProgressIndicator())
          else if (membersState.error != null)
            Text(membersState.error!, style: const TextStyle(color: Colors.red))
          else if (membersState.members.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 48),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.lightGray.withOpacity(0.5)),
              ),
              child: const Column(
                children: [
                  Icon(
                    Icons.people_outline,
                    size: 40,
                    color: AppColors.slateBlue,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'No members yet',
                    style: TextStyle(
                      color: AppColors.darkGray,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Invite people from the home screen',
                    style: TextStyle(color: AppColors.slateBlue, fontSize: 13),
                  ),
                ],
              ),
            )
          else
            ...membersState.members.map((member) {
              final user = member['user'] as Map<String, dynamic>?;
              final name =
                  (user?['fullName'] as String?) ??
                  (user?['FullName'] as String?) ??
                  'Unknown';
              final email = user?['email'] as String? ?? '';
              final role = member['role'] as String? ?? 'member';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.lightGray.withOpacity(0.5),
                  ),
                ),
                child: Row(
                  children: [
                    // Avatar circle
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.slateBlue.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : '?',
                          style: const TextStyle(
                            color: AppColors.slateBlue,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              color: AppColors.darkGray,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            style: const TextStyle(
                              color: AppColors.slateBlue,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Role badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: role.toUpperCase() == 'OWNER'
                            ? AppColors.slateBlue
                            : AppColors.offWhite,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: role.toUpperCase() == 'OWNER'
                              ? AppColors.slateBlue
                              : AppColors.lightGray,
                        ),
                      ),
                      child: Text(
                        role[0].toUpperCase() + role.substring(1).toLowerCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: role.toUpperCase() == 'OWNER'
                              ? Colors.white
                              : AppColors.darkGray,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────
class NotificationsPage extends ConsumerStatefulWidget {
  final String workspaceName;
  const NotificationsPage({super.key, required this.workspaceName});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(notificationProvider.notifier).fetchInvitations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifState = ref.watch(notificationProvider);

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        backgroundColor: AppColors.offWhite,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: AppColors.darkGray,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: AppColors.darkGray,
            fontWeight: FontWeight.w900,
            fontSize: 22,
          ),
        ),
      ),
      body: notifState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : notifState.invitations.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.notifications_none_outlined,
                      size: 40,
                      color: AppColors.slateBlue,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "You're all caught up!",
                    style: TextStyle(
                      color: AppColors.darkGray,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'No new notifications',
                    style: TextStyle(color: AppColors.slateBlue, fontSize: 13),
                  ),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const Text(
                  'WORKSPACE INVITES',
                  style: TextStyle(
                    color: AppColors.slateBlue,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 16),
                ...notifState.invitations.map((invite) {
                  final inviteId = invite['id'] as int;
                  final workspaceName =
                      invite['workspace']?['name'] as String? ?? 'a workspace';
                  final invitedBy =
                      invite['invitedBy']?['fullName'] as String? ??
                      invite['invitedBy']?['FullName'] as String? ??
                      'Someone';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.lightGray.withOpacity(0.5),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.slateBlue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.folder_copy_outlined,
                                color: AppColors.slateBlue,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$invitedBy invited you to',
                                    style: const TextStyle(
                                      color: AppColors.slateBlue,
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    workspaceName,
                                    style: const TextStyle(
                                      color: AppColors.darkGray,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            // Accept
                            Expanded(
                              child: GestureDetector(
                                onTap: () async {
                                  final success = await ref
                                      .read(notificationProvider.notifier)
                                      .acceptInvitation(inviteId);
                                  if (success && context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Joined $workspaceName!'),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.slateBlue,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'Accept',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            // Decline
                            Expanded(
                              child: GestureDetector(
                                onTap: () async {
                                  await ref
                                      .read(notificationProvider.notifier)
                                      .declineInvitation(inviteId);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.offWhite,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: AppColors.lightGray,
                                    ),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'Decline',
                                      style: TextStyle(
                                        color: AppColors.darkGray,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
    );
  }
}

// ─── BOARDS TAB ──────────────────────────────────────────────
class BoardsTab extends StatelessWidget {
  final int workspaceId;
  const BoardsTab({super.key, required this.workspaceId});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'BOARDS',
                style: TextStyle(
                  color: AppColors.slateBlue,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                  fontSize: 12,
                ),
              ),
              GestureDetector(
                onTap: () {},
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.slateBlue,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.add, size: 14, color: Colors.white),
                      SizedBox(width: 4),
                      Text(
                        'New Board',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 48),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.lightGray.withOpacity(0.5)),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.offWhite,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.view_kanban_outlined,
                    size: 36,
                    color: AppColors.slateBlue,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'No boards yet',
                  style: TextStyle(
                    color: AppColors.darkGray,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Create a board to organise your work',
                  style: TextStyle(color: AppColors.slateBlue, fontSize: 13),
                ),
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.slateBlue,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Create your first board',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── OVERVIEW TAB ────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final int workspaceId;
  const _OverviewTab({required this.workspaceId});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _StatCard(
                label: 'Tasks',
                value: '—',
                icon: Icons.task_alt_outlined,
              ),
              const SizedBox(width: 12),
              _StatCard(
                label: 'Members',
                value: '—',
                icon: Icons.people_outline,
              ),
              const SizedBox(width: 12),
              _StatCard(
                label: 'Done',
                value: '—',
                icon: Icons.check_circle_outline,
              ),
            ],
          ),
          const SizedBox(height: 28),
          const Text(
            'RECENT ACTIVITY',
            style: TextStyle(
              color: AppColors.slateBlue,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          ...List.generate(
            4,
            (i) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.lightGray.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.offWhite,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.circle_outlined,
                      size: 18,
                      color: AppColors.slateBlue,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 12,
                          width: 160,
                          decoration: BoxDecoration(
                            color: AppColors.lightGray.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          height: 10,
                          width: 100,
                          decoration: BoxDecoration(
                            color: AppColors.lightGray.withOpacity(0.25),
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── STAT CARD ───────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.lightGray.withOpacity(0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.slateBlue, size: 20),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: AppColors.darkGray,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.slateBlue,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── PLACEHOLDER TAB ─────────────────────────────────────────
class _PlaceholderTab extends StatelessWidget {
  final IconData icon;
  final String label;
  const _PlaceholderTab({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 400,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: AppColors.slateBlue.withOpacity(0.4)),
            const SizedBox(height: 12),
            Text(
              '$label coming soon',
              style: TextStyle(
                color: AppColors.darkGray.withOpacity(0.5),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── NAV ITEM ────────────────────────────────────────────────
class _NavItem {
  final IconData icon;
  final String label;
  const _NavItem({required this.icon, required this.label});
}
