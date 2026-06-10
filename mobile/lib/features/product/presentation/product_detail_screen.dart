import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../home/data/products_repository.dart';
import '../../cart/domain/cart_notifier.dart';
import '../../../core/theme/app_theme.dart';

final _productDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return ProductsRepository().getProductById(id);
});

class ProductDetailScreen extends ConsumerWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_productDetailProvider(productId));
    return async.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primary))),
      error:   (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data:    (product) => _ProductDetailView(product: product),
    );
  }
}

class _ProductDetailView extends ConsumerStatefulWidget {
  final Map<String, dynamic> product;
  const _ProductDetailView({required this.product});
  @override
  ConsumerState<_ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends ConsumerState<_ProductDetailView> {
  int _qty      = 1;
  int _imgIndex = 0;

  @override
  Widget build(BuildContext context) {
    final p       = widget.product;
    final images  = (p['imageUrls'] as List?) ?? [];
    final price   = double.tryParse(p['price'].toString()) ?? 0;
    final rating  = p['avgRating'];
    final reviews = (p['reviews'] as List?) ?? [];
    final stock   = (p['stock'] as int?) ?? 0;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          // ── Image area ──────────────────────────────────────
          SliverAppBar(
            expandedHeight: 300,
            pinned:         true,
            backgroundColor: AppTheme.surface,
            foregroundColor: AppTheme.textMain,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                children: [
                  if (images.isNotEmpty)
                    PageView.builder(
                      itemCount: images.length,
                      onPageChanged: (i) => setState(() => _imgIndex = i),
                      itemBuilder: (_, i) => CachedNetworkImage(
                        imageUrl: images[i], fit: BoxFit.cover,
                        placeholder: (_, __) => Container(color: const Color(0xFFF1F5F9)),
                      ),
                    )
                  else
                    Container(
                      color: const Color(0xFFF1F5F9),
                      child: const Center(child: Icon(Icons.image_outlined, size: 80, color: AppTheme.textSub)),
                    ),
                  if (images.length > 1)
                    Positioned(
                      bottom: 16, left: 0, right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(images.length, (i) => AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: _imgIndex == i ? 20 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: _imgIndex == i ? AppTheme.primary : Colors.white.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        )),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // ── Content ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title + rating
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            p['name'],
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textMain),
                          ),
                        ),
                        if (rating != null) ...[
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(children: [
                              const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                              const SizedBox(width: 4),
                              Text('$rating', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            ]),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Price + stock
                    Row(children: [
                      Text(
                        'RM ${price.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppTheme.primary),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: stock > 0 ? AppTheme.primary100 : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          stock > 0 ? '$stock in stock' : 'Out of stock',
                          style: TextStyle(
                            fontSize:   12,
                            fontWeight: FontWeight.w600,
                            color:      stock > 0 ? AppTheme.primary : AppTheme.error,
                          ),
                        ),
                      ),
                    ]),
                    const SizedBox(height: 16),

                    // Vendor card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.primary100,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.storefront_outlined, color: AppTheme.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p['vendor']?['storeName'] ?? 'Unknown store',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                            ),
                            if (p['vendor']?['city'] != null)
                              Text(
                                p['vendor']['city'],
                                style: const TextStyle(color: AppTheme.textSub, fontSize: 12),
                              ),
                          ],
                        )),
                        const Icon(Icons.chevron_right, color: AppTheme.textSub, size: 18),
                      ]),
                    ),
                    const SizedBox(height: 20),

                    // Description
                    const Text('Description', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(p['description'] ?? '', style: const TextStyle(color: AppTheme.textSub, height: 1.6, fontSize: 14)),
                    const SizedBox(height: 24),

                    // Quantity
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(children: [
                        const Text('Quantity', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const Spacer(),
                        _QtyButton(
                          icon:  Icons.remove,
                          onTap: () { if (_qty > 1) setState(() => _qty--); },
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Text('$_qty', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        ),
                        _QtyButton(
                          icon:  Icons.add,
                          onTap: () { if (_qty < stock) setState(() => _qty++); },
                        ),
                      ]),
                    ),
                    const SizedBox(height: 24),

                    // Reviews
                    if (reviews.isNotEmpty) ...[
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Reviews', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                        Text('${reviews.length} reviews', style: const TextStyle(fontSize: 12, color: AppTheme.textSub)),
                      ]),
                      const SizedBox(height: 12),
                      ...reviews.take(3).map((r) => _ReviewTile(review: r)),
                    ],
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: ElevatedButton.icon(
          onPressed: stock <= 0 ? null : () {
            ref.read(cartNotifierProvider.notifier).addItem(
              productId:  p['id'],
              name:       p['name'],
              price:      price,
              imageUrl:   images.isNotEmpty ? images[0] : null,
              vendorId:   p['vendor']?['id'] ?? '',
              vendorName: p['vendor']?['storeName'] ?? '',
              quantity:   _qty,
            );
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Added to cart'),
                backgroundColor: AppTheme.primary,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                duration: const Duration(seconds: 2),
              ),
            );
          },
          icon:  const Icon(Icons.shopping_cart_outlined, size: 20),
          label: Text('Add to Cart  •  RM ${(price * _qty).toStringAsFixed(2)}'),
        ),
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyButton({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        color: AppTheme.primary100,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, size: 18, color: AppTheme.primary),
    ),
  );
}

class _ReviewTile extends StatelessWidget {
  final dynamic review;
  const _ReviewTile({required this.review});
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primary100,
              child: Text(
                (review['user']?['name'] ?? 'U')[0].toUpperCase(),
                style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
            const SizedBox(width: 10),
            Text(review['user']?['name'] ?? 'User', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const Spacer(),
            Row(children: List.generate(5, (i) => Icon(
              Icons.star_rounded, size: 13,
              color: i < (review['rating'] as int) ? Colors.amber : AppTheme.border,
            ))),
          ]),
          if (review['comment'] != null) ...[
            const SizedBox(height: 8),
            Text(review['comment'], style: const TextStyle(color: AppTheme.textSub, fontSize: 13, height: 1.4)),
          ],
        ],
      ),
    );
  }
}
