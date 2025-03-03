import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../domain/home_notifier.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/domain/auth_notifier.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user        = ref.watch(authNotifierProvider).user;
    final categories  = ref.watch(categoriesProvider);
    final products    = ref.watch(homeProductsProvider);
    final selectedCat = ref.watch(selectedCategoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hello, ${user?.name.split(' ').first ?? 'there'} 👋',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('Find what you need', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.go('/search'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(homeProductsProvider.future),
        child: CustomScrollView(
          slivers: [
            // Category chips
            SliverToBoxAdapter(
              child: categories.when(
                data: (cats) => _CategoryChips(cats: cats, selected: selectedCat, ref: ref),
                loading: () => _ShimmerRow(),
                error: (_, __) => const SizedBox(),
              ),
            ),

            // Products grid
            products.when(
              data: (data) {
                final items = data['data'] as List;
                if (items.isEmpty) {
                  return const SliverFillRemaining(
                    child: Center(child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 64, color: AppTheme.textSub),
                        SizedBox(height: 16),
                        Text('No products found', style: TextStyle(color: AppTheme.textSub)),
                      ],
                    )),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) => _ProductCard(product: items[i]),
                      childCount: items.length,
                    ),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                  ),
                );
              },
              loading: () => SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate((_, __) => _ShimmerCard(), childCount: 6),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72,
                  ),
                ),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(child: Text('Error: $e')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryChips extends StatelessWidget {
  final List<dynamic> cats;
  final String? selected;
  final WidgetRef ref;
  const _CategoryChips({required this.cats, required this.selected, required this.ref});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: cats.length + 1,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          if (i == 0) {
            return FilterChip(
              label: const Text('All'),
              selected: selected == null,
              onSelected: (_) => ref.read(selectedCategoryProvider.notifier).state = null,
            );
          }
          final cat = cats[i - 1];
          return FilterChip(
            label: Text(cat['name']),
            selected: selected == cat['id'],
            onSelected: (_) => ref.read(selectedCategoryProvider.notifier).state = cat['id'],
          );
        },
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final dynamic product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final images = (product['imageUrls'] as List?) ?? [];
    final price  = double.tryParse(product['price'].toString()) ?? 0;
    final rating = product['avgRating'];

    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: images.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: images[0],
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (_, __) => Container(color: AppTheme.border),
                        errorWidget: (_, __, ___) => Container(
                          color: AppTheme.border,
                          child: const Icon(Icons.image_not_supported_outlined, color: AppTheme.textSub),
                        ),
                      )
                    : Container(
                        color: AppTheme.border,
                        child: const Center(child: Icon(Icons.image_outlined, color: AppTheme.textSub, size: 40)),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product['name'], maxLines: 2, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text('RM ${price.toStringAsFixed(2)}',
                      style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 14)),
                  if (rating != null) ...[
                    const SizedBox(height: 4),
                    Row(children: [
                      const Icon(Icons.star, size: 12, color: Colors.amber),
                      const SizedBox(width: 2),
                      Text('$rating', style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
                    ]),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Card(child: Container(color: Colors.white)),
    );
  }
}

class _ShimmerRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: 5,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (_, __) => Container(width: 80, height: 32, decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(20),
          )),
        ),
      ),
    );
  }
}
