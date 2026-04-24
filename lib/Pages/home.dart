import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '/colors.dart';
import '/Providers/authProvider.dart';
import '/Providers/workspaceProvider.dart';
import '/Pages/dashboard.dart';
import '/Pages/landing.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      // ✅ actually calls fetchWorkspaces (no wrapping arrow function)
      ref.read(workspaceProvider.notifier).fetchWorkspaces();
    });
  }

  void _showCreateWorkspaceDialog() {
    final pageContext = context;
    final nameController = TextEditingController();
    final inviteController = TextEditingController();
    String selectedType = 'public';
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (sheetContext, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 24,
              ),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.lightGray,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'New Workspace',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.darkGray,
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Text(
                      'Workspace Name',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGray,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: nameController,
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Name is required'
                          : null,
                      decoration: InputDecoration(
                        hintText: 'e.g. Marketing Team',
                        filled: true,
                        fillColor: AppColors.offWhite,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Visibility',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGray,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: ['public', 'private'].map((type) {
                        final selected = selectedType == type;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () =>
                                setModalState(() => selectedType = type),
                            child: Container(
                              margin: EdgeInsets.only(
                                right: type == 'public' ? 8 : 0,
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: selected
                                    ? AppColors.slateBlue
                                    : AppColors.offWhite,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    type == 'public'
                                        ? Icons.public
                                        : Icons.lock_outline,
                                    size: 16,
                                    color: selected
                                        ? Colors.white
                                        : AppColors.darkGray,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    type[0].toUpperCase() + type.substring(1),
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: selected
                                          ? Colors.white
                                          : AppColors.darkGray,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Invite Members (optional)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGray,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: inviteController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        hintText: 'colleague@example.com',
                        filled: true,
                        fillColor: AppColors.offWhite,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          if (!formKey.currentState!.validate()) return;

                          final success = await ref
                              .read(workspaceProvider.notifier)
                              .createWorkspace(
                                nameController.text.trim(),
                                selectedType,
                              );

                          if (!success) {
                            // Show error if creation failed
                            final error = ref.read(workspaceProvider).error;
                            if (pageContext.mounted && error != null) {
                              ScaffoldMessenger.of(pageContext).showSnackBar(
                                SnackBar(
                                  content: Text(error),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                            return;
                          }

                          // Send invite if email entered
                          if (inviteController.text.trim().isNotEmpty) {
                            final workspaces = ref
                                .read(workspaceProvider)
                                .workspaces;
                            final newId = workspaces.last['id'] as int;
                            await ref
                                .read(workspaceProvider.notifier)
                                .sendInvite(
                                  newId,
                                  inviteController.text.trim(),
                                );
                          }

                          final workspaces = ref
                              .read(workspaceProvider)
                              .workspaces;
                          final newWorkspace = workspaces.last;

                          if (pageContext.mounted) {
                            Navigator.pop(sheetContext); // close sheet

                            Navigator.push(
                              pageContext,
                              MaterialPageRoute(
                                builder: (_) => Dashboard(
                                  workspaceId: newWorkspace['id'] as int,
                                  workspaceName: newWorkspace['name'] as String,
                                ),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.darkGray,
                          foregroundColor: AppColors.offWhite,
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Create Workspace',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final workspaceState = ref.watch(workspaceProvider);

    // ✅ Check both casings — C# HotChocolate usually sends 'fullName'
    // but if your schema returns 'FullName' this catches it too
    final fullName =
        (auth.user?['FullName'] as String?) ??
        (auth.user?['fullName'] as String?) ??
        'there';
    final firstName = fullName.split(' ').first;

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.offWhite,
            elevation: 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.search, color: AppColors.darkGray),
                onPressed: () {},
              ),
              // ✅ Logout button
              IconButton(
                icon: const Icon(Icons.logout, color: AppColors.darkGray),
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => LandingPage()),
                    (route) => false,
                  );
                },
              ),
              const SizedBox(width: 8),
            ],
            title: Text(
              'Welcome, $firstName 👋',
              style: const TextStyle(
                color: AppColors.darkGray,
                fontWeight: FontWeight.w900,
                fontSize: 22,
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "YOUR WORKSPACES",
                    style: TextStyle(
                      color: AppColors.slateBlue,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildCreateWorkspaceButton(),
                ],
              ),
            ),
          ),

          if (workspaceState.isLoading)
            const SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              ),
            )
          else if (workspaceState.error != null)
            SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    workspaceState.error!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              ),
            )
          else if (workspaceState.workspaces.isEmpty)
            const SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text(
                    'No workspaces yet.\nCreate one to get started!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.slateBlue),
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                final ws = workspaceState.workspaces[index];
                return _buildWorkspaceCard(
                  ws['name'] as String,
                  ws['type'] as String,
                  ws['id'] as int,
                );
              }, childCount: workspaceState.workspaces.length),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildCreateWorkspaceButton() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.slateBlue,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.slateBlue.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _showCreateWorkspaceDialog,
          borderRadius: BorderRadius.circular(16),
          child: const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_circle_outline, color: AppColors.offWhite),
                SizedBox(width: 12),
                Text(
                  "Create New Workspace",
                  style: TextStyle(
                    color: AppColors.offWhite,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWorkspaceCard(String title, String type, int id) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => Dashboard(workspaceId: id, workspaceName: title),
        ),
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.lightGray.withOpacity(0.5)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.offWhite,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.folder_copy_outlined,
                color: AppColors.slateBlue,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.darkGray,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        type.toLowerCase() == 'private'
                            ? Icons.lock_outline
                            : Icons.public,
                        size: 12,
                        color: AppColors.slateBlue,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        type[0].toUpperCase() + type.substring(1),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.slateBlue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.lightGray),
          ],
        ),
      ),
    );
  }
}
