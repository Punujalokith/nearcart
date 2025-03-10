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
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
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
  int _qty = 1;
  int _imgIndex = 0;

  @override
  Widget build(BuildContext context) {
    final p      = widget.product;
    final images = (p['imageUrls'] as List?) ?? [];
    final price  = double.tryParse(p['price'].toString()) ?? 0;
    final rating = p['avgRating'];
    final reviews = (p['reviews'] as List?) ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Image carousel
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: images.isNotEmpty
                  ? PageView.builder(
                      itemCount: images.length,
                      onPageChanged: (i) => setState(() => _imgIndex = i),
                      itemBuilder: (_, i) => CachedNetworkImage(
                        imageUrl: images[i], fit: BoxFit.cover,
                      ),
                    )
                  : Container(color: AppTheme.border,
                      child: const Icon(Icons.image_outlined, size: 80, color: AppTheme.textSub)),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image dots
                  if (images.length > 1)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(images.length, (i) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: _imgIndex == i ? 20 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: _imgIndex == i ? AppTheme.primary : AppTheme.border,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      )),
                    ),
                  const SizedBox(height: 16),
                  Text(p['name'], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(children: [
                    Text('RM ${price.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                    const Spacer(),
                    if (rating != null) Row(children: [
                      const Icon(Icons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text('$rating (${p['reviewCount']})',
                          style: const TextStyle(color: AppTheme.textSub)),
                    ]),
                  ]),
                  const SizedBox(height: 8),
                  Text('${p['stock']} in stock', style: TextStyle(
                    color: (p['stock'] as int) > 0 ? AppTheme.secondary : AppTheme.error,
                    fontWeight: FontWeight.w500,
                  )),
                  const SizedBox(height: 16),

                  // Vendor
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(children: [
                      const Icon(Icons.storefront_outlined, color: AppTheme.textSub),
                      const SizedBox(width: 8),
                      Text(p['vendor']?['storeName'] ?? 'Unknown store',
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                      if (p['vendor']?['city'] != null) ...[
                        const SizedBox(width: 8),
                        Text('• ${p['vendor']['city']}',
                            style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
                      ],
                    ]),
                  ),
                  const SizedBox(height: 16),

                  const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Text(p['description'], style: const TextStyle(color: AppTheme.textSub, height: 1.5)),
                  const SizedBox(height: 24),

                  // Quantity selector
                  Row(children: [
                    const Text('Quantity', style: TextStyle(fontWeight: FontWeight.w600)),
                    const Spacer(),
                    _QtyButton(icon: Icons.remove, onTap: () { if (_qty > 1) setState(() => _qty--); }),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('$_qty', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                    _QtyButton(icon: Icons.add, onTap: () {
                      if (_qty < (p['stock'] as int)) setState(() => _qty++);
                    }),
                  ]),
                  const SizedBox(height: 24),

                  // Reviews
                  if (reviews.isNotEmpty) ...[
                    const Text('Reviews', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),
                    ...reviews.take(3).map((r) => _ReviewTile(review: r)),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
        ),
        child: ElevatedButton.icon(
          onPressed: (p['stock'] as int) <= 0 ? null : () {
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
              const SnackBar(content: Text('Added to cart ✓'), backgroundColor: AppTheme.secondary),
            );
          },
          icon: const Icon(Icons.shopping_cart_outlined),
          label: Text('Add to Cart • RM ${(price * _qty).toStringAsFixed(2)}'),
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
      width: 32, height: 32,
      decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
      child: Icon(icon, size: 16),
    ),
  );
}

class _ReviewTile extends StatelessWidget {
  final dynamic review;
  const _ReviewTile({required this.review});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text(review['user']?['name'] ?? 'User', style: const TextStyle(fontWeight: FontWeight.w600)),
            const Spacer(),
            Row(children: List.generate(5, (i) => Icon(
              Icons.star, size: 14,
              color: i < (review['rating'] as int) ? Colors.amber : AppTheme.border,
            ))),
          ]),
          if (review['comment'] != null) ...[
            const SizedBox(height: 4),
            Text(review['comment'], style: const TextStyle(color: AppTheme.textSub)),
          ],
          const Divider(),
        ],
      ),
    );
  }
}
