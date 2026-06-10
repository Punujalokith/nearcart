import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/domain/auth_notifier.dart';
import '../../orders/presentation/order_history_screen.dart';
import '../../../core/theme/app_theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user   = ref.watch(authNotifierProvider).user;
    final orders = ref.watch(ordersProvider);
    final orderCount = orders.valueOrNull?.length ?? 0;
    final deliveredCount = orders.valueOrNull?.where((o) => o['status'] == 'DELIVERED').length ?? 0;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          // ── Header ──────────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                  begin: Alignment.topLeft,
                  end:   Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  // Avatar
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 44,
                        backgroundColor: Colors.white.withOpacity(0.3),
                        child: Text(
                          user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?',
                          style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w800),
                        ),
                      ),
                      Positioned(
                        bottom: 0, right: 0,
                        child: Container(
                          width: 28, height: 28,
                          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          child: const Icon(Icons.edit, size: 14, color: AppTheme.primary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(user?.name ?? '', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                  const SizedBox(height: 16),

                  // Stats row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _StatBadge(label: 'Orders', value: '$orderCount'),
                      Container(width: 1, height: 32, color: Colors.white.withOpacity(0.3), margin: const EdgeInsets.symmetric(horizontal: 20)),
                      _StatBadge(label: 'Delivered', value: '$deliveredCount'),
                      Container(width: 1, height: 32, color: Colors.white.withOpacity(0.3), margin: const EdgeInsets.symmetric(horizontal: 20)),
                      _StatBadge(label: 'Saved', value: '0'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Menu sections ────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _MenuSection(
                    title: 'Account',
                    items: [
                      _MenuItem(icon: Icons.person_outline,    label: 'Personal Details',  onTap: () {}),
                      _MenuItem(icon: Icons.location_on_outlined, label: 'Delivery Addresses', onTap: () => context.push('/address-book')),
                      _MenuItem(icon: Icons.receipt_long_outlined, label: 'Order History',   onTap: () => context.go('/orders')),
                      _MenuItem(icon: Icons.shopping_cart_outlined, label: 'My Cart',         onTap: () => context.push('/cart')),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _MenuSection(
                    title: 'Preferences',
                    items: [
                      _MenuToggle(icon: Icons.notifications_outlined, label: 'Push Notifications'),
                      _MenuToggle(icon: Icons.email_outlined,          label: 'Email Updates'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _MenuSection(
                    title: 'Security',
                    items: [
                      _MenuItem(icon: Icons.lock_outline,      label: 'Change Password',  onTap: () {}),
                      _MenuItem(icon: Icons.security_outlined,  label: 'Privacy Settings', onTap: () {}),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Sign out
                  GestureDetector(
                    onTap: () async {
                      await ref.read(authNotifierProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: Row(children: const [
                        Icon(Icons.logout_rounded, color: AppTheme.error, size: 20),
                        SizedBox(width: 12),
                        Text('Sign Out', style: TextStyle(color: AppTheme.error, fontWeight: FontWeight.w600, fontSize: 15)),
                        Spacer(),
                        Icon(Icons.chevron_right, color: AppTheme.error, size: 18),
                      ]),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String label;
  final String value;
  const _StatBadge({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
    const SizedBox(height: 2),
    Text(label, style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 12)),
  ]);
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<Widget> items;
  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSub, letterSpacing: 0.5)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(children: [
            ...items.asMap().entries.map((e) => Column(children: [
              e.value,
              if (e.key < items.length - 1) const Divider(height: 1, indent: 52),
            ])),
          ]),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) => ListTile(
    onTap:    onTap,
    leading:  Container(
      width: 36, height: 36,
      decoration: BoxDecoration(color: AppTheme.primary50, borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, size: 18, color: AppTheme.primary),
    ),
    title:    Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
    trailing: const Icon(Icons.chevron_right, color: AppTheme.textSub, size: 18),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    minLeadingWidth: 0,
  );
}

class _MenuToggle extends ConsumerStatefulWidget {
  final IconData icon;
  final String label;
  const _MenuToggle({required this.icon, required this.label});

  @override
  ConsumerState<_MenuToggle> createState() => _MenuToggleState();
}

class _MenuToggleState extends ConsumerState<_MenuToggle> {
  bool _value = true;

  @override
  Widget build(BuildContext context) => ListTile(
    leading: Container(
      width: 36, height: 36,
      decoration: BoxDecoration(color: AppTheme.primary50, borderRadius: BorderRadius.circular(10)),
      child: Icon(widget.icon, size: 18, color: AppTheme.primary),
    ),
    title:   Text(widget.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
    trailing: Switch(
      value:         _value,
      onChanged:     (v) => setState(() => _value = v),
      activeColor:   AppTheme.primary,
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    minLeadingWidth: 0,
  );
}
