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
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('My Cart', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            if (items.isNotEmpty)
              Text('${items.length} item${items.length > 1 ? 's' : ''}',
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSub)),
          ],
        ),
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () => ref.read(cartNotifierProvider.notifier).clear(),
              child: const Text('Clear all', style: TextStyle(color: AppTheme.error, fontSize: 13)),
            ),
        ],
      ),
      body: items.isEmpty
          ? Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90, height: 90,
                  decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle),
                  child: const Icon(Icons.shopping_cart_outlined, size: 40, color: AppTheme.textSub),
                ),
                const SizedBox(height: 16),
                const Text('Your cart is empty', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: AppTheme.textMain)),
                const SizedBox(height: 6),
                const Text('Add items from nearby stores', style: TextStyle(fontSize: 13, color: AppTheme.textSub)),
                const SizedBox(height: 24),
                SizedBox(
                  width: 160,
                  child: ElevatedButton(
                    onPressed: () => context.go('/home'),
                    child: const Text('Browse Stores'),
                  ),
                ),
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
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(children: [
                          // Image
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: SizedBox(
                              width: 70, height: 70,
                              child: item.imageUrl != null
                                  ? Image.network(item.imageUrl!, fit: BoxFit.cover)
                                  : Container(
                                      color: const Color(0xFFF1F5F9),
                                      child: const Icon(Icons.image_outlined, color: AppTheme.textSub),
                                    ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          // Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.name,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.vendorName,
                                  style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'RM ${item.price.toStringAsFixed(2)}',
                                      style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 14),
                                    ),
                                    // Qty controls
                                    Container(
                                      decoration: BoxDecoration(
                                        color: AppTheme.background,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: AppTheme.border),
                                      ),
                                      child: Row(children: [
                                        _QtyBtn(
                                          icon: Icons.remove,
                                          onTap: () => ref.read(cartNotifierProvider.notifier)
                                              .updateQuantity(item.productId, item.quantity - 1),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 14),
                                          child: Text('${item.quantity}',
                                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                        ),
                                        _QtyBtn(
                                          icon: Icons.add,
                                          onTap: () => ref.read(cartNotifierProvider.notifier)
                                              .updateQuantity(item.productId, item.quantity + 1),
                                        ),
                                      ]),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ]),
                      );
                    },
                  ),
                ),

                // ── Bottom summary ────────────────────────────
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, -4))],
                  ),
                  child: Column(
                    children: [
                      // Promo code row
                      Container(
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppTheme.background,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(children: [
                          const SizedBox(width: 14),
                          const Icon(Icons.discount_outlined, size: 18, color: AppTheme.textSub),
                          const SizedBox(width: 10),
                          const Expanded(child: Text('Apply promo code', style: TextStyle(color: AppTheme.textSub, fontSize: 14))),
                          const Icon(Icons.chevron_right, color: AppTheme.textSub, size: 18),
                          const SizedBox(width: 10),
                        ]),
                      ),
                      const SizedBox(height: 14),
                      Row(children: [
                        const Text('Order Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        const Spacer(),
                        Text('RM ${total.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                      ]),
                      const SizedBox(height: 14),
                      ElevatedButton(
                        onPressed: () => context.push('/checkout'),
                        child: const Text('Proceed to Checkout'),
                      ),
                    ],
                  ),
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
    child: Padding(
      padding: const EdgeInsets.all(10),
      child: Icon(icon, size: 16, color: AppTheme.primary),
    ),
  );
}
