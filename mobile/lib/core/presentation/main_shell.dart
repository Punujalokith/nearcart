import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';
import '../../features/cart/domain/cart_notifier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MainShell extends ConsumerWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location  = GoRouterState.of(context).matchedLocation;
    final cartCount = ref.watch(cartNotifierProvider).fold(0, (sum, item) => sum + item.quantity);

    int currentIndex = 0;
    if (location.startsWith('/search'))  currentIndex = 1;
    if (location.startsWith('/orders'))  currentIndex = 2;
    if (location.startsWith('/profile')) currentIndex = 3;

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surface,
          border: Border(top: BorderSide(color: AppTheme.border)),
        ),
        child: NavigationBar(
          selectedIndex: currentIndex,
          backgroundColor: Colors.transparent,
          elevation: 0,
          height: 64,
          animationDuration: const Duration(milliseconds: 250),
          onDestinationSelected: (i) {
            switch (i) {
              case 0: context.go('/home');    break;
              case 1: context.go('/search');  break;
              case 2: context.go('/orders');  break;
              case 3: context.go('/profile'); break;
            }
          },
          destinations: [
            _navDest(Icons.home_outlined,          Icons.home_rounded,      'Home'),
            _navDest(Icons.search_outlined,         Icons.search_rounded,    'Search'),
            _navDest(Icons.receipt_long_outlined,   Icons.receipt_long,      'Orders'),
            _navDest(Icons.person_outline_rounded,  Icons.person_rounded,    'Profile'),
          ],
        ),
      ),
      floatingActionButton: cartCount > 0
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/cart'),
              elevation:  4,
              icon:  const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 20),
              label: Text(
                'Cart ($cartCount)',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
              ),
            )
          : null,
    );
  }

  NavigationDestination _navDest(IconData icon, IconData selectedIcon, String label) {
    return NavigationDestination(
      icon:         Icon(icon),
      selectedIcon: Icon(selectedIcon),
      label:        label,
    );
  }
}
