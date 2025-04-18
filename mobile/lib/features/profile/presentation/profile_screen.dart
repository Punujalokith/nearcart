import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/domain/auth_notifier.dart';
import '../../../core/theme/app_theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        children: [
          // User info header
          Container(
            padding: const EdgeInsets.all(24),
            child: Row(children: [
              CircleAvatar(
                radius: 36,
                backgroundColor: AppTheme.primary,
                child: Text(
                  (user?.name.isNotEmpty == true) ? user!.name[0].toUpperCase() : '?',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user?.name ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '', style: const TextStyle(color: AppTheme.textSub)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(user?.role ?? '', style: const TextStyle(color: AppTheme.primary, fontSize: 12)),
                  ),
                ],
              )),
            ]),
          ),
          const Divider(height: 0),

          _Tile(icon: Icons.location_on_outlined, label: 'Address Book',
              onTap: () => context.push('/address-book')),
          _Tile(icon: Icons.receipt_long_outlined, label: 'Order History',
              onTap: () => context.go('/orders')),
          _Tile(icon: Icons.shopping_cart_outlined, label: 'My Cart',
              onTap: () => context.push('/cart')),
          const Divider(),
          _Tile(
            icon: Icons.logout,
            label: 'Sign Out',
            color: AppTheme.error,
            onTap: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;
  const _Tile({required this.icon, required this.label, required this.onTap, this.color});

  @override
  Widget build(BuildContext context) => ListTile(
    leading: Icon(icon, color: color ?? AppTheme.textSub),
    title: Text(label, style: TextStyle(color: color)),
    trailing: color == null ? const Icon(Icons.chevron_right, color: AppTheme.textSub) : null,
    onTap: onTap,
  );
}
