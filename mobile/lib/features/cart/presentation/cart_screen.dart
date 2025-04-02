import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../domain/cart_notifier.dart';
import '../../../core/theme/app_theme.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartNotifierProvider);
    final total = ref.read(cartNotifierProvider.notifier).total;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cart'),
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () => ref.read(cartNotifierProvider.notifier).clear(),
              child: const Text('Clear', style: TextStyle(color: AppTheme.error)),
            ),
        ],
      ),
      body: items.isEmpty
          ? const Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shopping_cart_outlined, size: 80, color: AppTheme.textSub),
                SizedBox(height: 16),
                Text('Your cart is empty', style: TextStyle(color: AppTheme.textSub, fontSize: 16)),
              ],
            ))
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) {
                      final item = items[i];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: item.imageUrl != null
                                  ? Image.network(item.imageUrl!, width: 64, height: 64, fit: BoxFit.cover)
                                  : Container(width: 64, height: 64, color: AppTheme.border,
                                      child: const Icon(Icons.image_outlined)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text('RM ${item.price.toStringAsFixed(2)}',
                                    style: const TextStyle(color: AppTheme.primary)),
                              ],
                            )),
                            Row(children: [
                              _QtyBtn(icon: Icons.remove, onTap: () =>
                                  ref.read(cartNotifierProvider.notifier).updateQuantity(item.productId, item.quantity - 1)),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                child: Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              _QtyBtn(icon: Icons.add, onTap: () =>
                                  ref.read(cartNotifierProvider.notifier).updateQuantity(item.productId, item.quantity + 1)),
                            ]),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                  ),
                  child: Column(children: [
                    Row(children: [
                      const Text('Total', style: TextStyle(fontSize: 16)),
                      const Spacer(),
                      Text('RM ${total.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                    ]),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.push('/checkout'),
                      child: const Text('Proceed to Checkout'),
                    ),
                  ]),
                ),
              ],
            ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 28, height: 28,
      decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(6)),
      child: Icon(icon, size: 14),
    ),
  );
}
