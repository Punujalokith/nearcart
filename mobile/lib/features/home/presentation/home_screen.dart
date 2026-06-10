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
      backgroundColor: AppTheme.background,
      body: RefreshIndicator(
        color: AppTheme.primary,
        onRefresh: () => ref.refresh(homeProductsProvider.future),
        child: CustomScrollView(
          slivers: [
            // ── App bar ───────────────────────────────────────
            SliverAppBar(
              expandedHeight: 0,
              floating:       true,
              snap:           true,
              backgroundColor: AppTheme.surface,
              titleSpacing:   0,
              title: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          const Icon(Icons.location_on, size: 14, color: AppTheme.primary),
                          const SizedBox(width: 4),
                          Text(
                            'Kuala Lumpur',
                            style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textMain,
                            ),
                          ),
                          const Icon(Icons.keyboard_arrow_down, size: 16, color: AppTheme.textSub),
                        ]),
                        Text(
                          'Hello, ${user?.name.split(' ').first ?? 'there'} 👋',
                          style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.search, color: AppTheme.textMain),
                    onPressed: () => context.go('/search'),
                  ),
                  Stack(
                    children: [
                      const Icon(Icons.notifications_outlined, color: AppTheme.textMain, size: 26),
                      Positioned(
                        right: 0, top: 0,
                        child: Container(
                          width: 8, height: 8,
                          decoration: const BoxDecoration(
                            color: AppTheme.error,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ]),
              ),
            ),

            // ── Search bar ────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: GestureDetector(
                  onTap: () => context.go('/search'),
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(children: [
                      const Icon(Icons.search, color: AppTheme.textSub, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        'Search products, stores...',
                        style: const TextStyle(color: AppTheme.textSub, fontSize: 14),
                      ),
                    ]),
                  ),
                ),
              ),
            ),

            // ── Promo banner ──────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Container(
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                      begin:  Alignment.topLeft,
                      end:    Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -20, top: -20,
                        child: Container(
                          width: 100, height: 100,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment:  MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.25),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'LIMITED OFFER',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Up to 30% OFF',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'On fresh produce & groceries',
                              style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // ── Category chips ────────────────────────────────
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 20, 16, 10),
                    child: Text('Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textMain)),
                  ),
                  categories.when(
                    data:    (cats) => _CategoryChips(cats: cats, selected: selectedCat, ref: ref),
                    loading: () => _ShimmerRow(),
                    error:   (_, __) => const SizedBox(),
                  ),
                ],
              ),
            ),

            // ── Featured products header ──────────────────────
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Nearby Products', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textMain)),
                    Text('See all', style: TextStyle(fontSize: 13, color: AppTheme.primary, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),

            // ── Products grid ─────────────────────────────────
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
                        Text('No products nearby', style: TextStyle(color: AppTheme.textSub, fontSize: 15)),
                        SizedBox(height: 4),
                        Text('Try a different category', style: TextStyle(color: AppTheme.textSub, fontSize: 13)),
                      ],
                    )),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  sliver: SliverGrid(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) => _ProductCard(product: items[i]),
                      childCount: items.length,
                    ),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount:     2,
                      crossAxisSpacing:   12,
                      mainAxisSpacing:    12,
                      childAspectRatio:   0.70,
                    ),
                  ),
                );
              },
              loading: () => SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                    (_, __) => _ShimmerCard(),
                    childCount: 6,
                  ),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.70,
                  ),
                ),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(child: Text('Error loading products: $e')),
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

  static const _icons = {
    'Grocery':  Icons.shopping_basket_outlined,
    'Food':     Icons.restaurant_outlined,
    'Pharmacy': Icons.local_pharmacy_outlined,
    'Fashion':  Icons.checkroom_outlined,
  };

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: cats.length + 1,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          if (i == 0) {
            final isAll = selected == null;
            return _Chip(label: 'All', isSelected: isAll, onTap: () => ref.read(selectedCategoryProvider.notifier).state = null);
          }
          final cat = cats[i - 1];
          final isSelected = selected == cat['id'];
          return _Chip(
            label: cat['name'],
            icon: _icons[cat['name']],
            isSelected: isSelected,
            onTap: () => ref.read(selectedCategoryProvider.notifier).state = cat['id'],
          );
        },
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool isSelected;
  final VoidCallback onTap;
  const _Chip({required this.label, this.icon, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: isSelected ? Colors.white : AppTheme.textSub),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppTheme.textMain,
              ),
            ),
          ],
        ),
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
    final isOrganic = product['category']?['name'] == 'Grocery';

    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: images.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: images[0],
                            fit:      BoxFit.cover,
                            placeholder: (_, __) => Container(color: const Color(0xFFF1F5F9)),
                            errorWidget: (_, __, ___) => Container(
                              color: const Color(0xFFF1F5F9),
                              child: const Center(child: Icon(Icons.image_not_supported_outlined, color: AppTheme.textSub)),
                            ),
                          )
                        : Container(
                            color: const Color(0xFFF1F5F9),
                            child: const Center(child: Icon(Icons.image_outlined, color: AppTheme.textSub, size: 36)),
                          ),
                  ),
                ),
                if (isOrganic)
                  Positioned(
                    top: 8, left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('ORGANIC', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                    ),
                  ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.textMain),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'RM ${price.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                  if (rating != null) ...[
                    const SizedBox(height: 4),
                    Row(children: [
                      const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                      const SizedBox(width: 3),
                      Text('$rating', style: const TextStyle(fontSize: 11, color: AppTheme.textSub, fontWeight: FontWeight.w500)),
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
      baseColor:      const Color(0xFFE2E8F0),
      highlightColor: const Color(0xFFF8FAFC),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

class _ShimmerRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: Shimmer.fromColors(
        baseColor:      const Color(0xFFE2E8F0),
        highlightColor: const Color(0xFFF8FAFC),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: 5,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (_, __) => Container(
            width: 80, height: 36,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
          ),
        ),
      ),
    );
  }
}
