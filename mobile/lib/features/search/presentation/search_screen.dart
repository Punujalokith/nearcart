import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../home/data/products_repository.dart';
import '../../../core/theme/app_theme.dart';

final _searchQueryProvider   = StateProvider<String>((ref) => '');
final _minPriceProvider      = StateProvider<double?>((ref) => null);
final _maxPriceProvider      = StateProvider<double?>((ref) => null);

final _searchResultsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final q   = ref.watch(_searchQueryProvider);
  final min = ref.watch(_minPriceProvider);
  final max = ref.watch(_maxPriceProvider);
  if (q.isEmpty) return {'data': [], 'meta': {}};
  return ProductsRepository().getProducts(search: q, minPrice: min, maxPrice: max);
});

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});
  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _ctrl = TextEditingController();

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _showFilters() {
    showModalBottomSheet(
      context:       context,
      isScrollControlled: true,
      backgroundColor:    Colors.transparent,
      builder: (_) => _FilterSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(_searchResultsProvider);
    final query   = ref.watch(_searchQueryProvider);
    final hasFilters = ref.watch(_minPriceProvider) != null || ref.watch(_maxPriceProvider) != null;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        titleSpacing:    0,
        title: Container(
          height: 44,
          margin: const EdgeInsets.symmetric(horizontal: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(12),
          ),
          child: TextField(
            controller:  _ctrl,
            autofocus:   true,
            style:       const TextStyle(fontSize: 14, color: AppTheme.textMain),
            decoration:  const InputDecoration(
              hintText:    'Search products, stores...',
              hintStyle:   TextStyle(color: AppTheme.textSub, fontSize: 14),
              prefixIcon:  Icon(Icons.search, color: AppTheme.textSub, size: 20),
              border:      InputBorder.none,
              isDense:     true,
              contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 12),
            ),
            onChanged: (v) {
              Future.delayed(const Duration(milliseconds: 380), () {
                if (_ctrl.text == v) ref.read(_searchQueryProvider.notifier).state = v;
              });
            },
          ),
        ),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: hasFilters,
              backgroundColor: AppTheme.primary,
              child: const Icon(Icons.tune_rounded, color: AppTheme.textMain),
            ),
            onPressed: _showFilters,
          ),
        ],
      ),
      body: results.when(
        data: (data) {
          final items = data['data'] as List? ?? [];

          if (query.isEmpty) {
            return _EmptyState(
              icon:    Icons.search_rounded,
              title:   'Search for products',
              subtitle: 'Type to find items from local stores',
            );
          }

          if (items.isEmpty) {
            return _EmptyState(
              icon:    Icons.inventory_2_outlined,
              title:   'No results found',
              subtitle: 'Try a different keyword or remove filters',
            );
          }

          return Column(
            children: [
              // Results count + filter tags
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Row(children: [
                  Text(
                    '${items.length} results for "$query"',
                    style: const TextStyle(fontSize: 13, color: AppTheme.textSub),
                  ),
                ]),
              ),
              // Grid
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                  itemCount: items.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount:  2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing:  12,
                    childAspectRatio: 0.70,
                  ),
                  itemBuilder: (_, i) => _SearchCard(product: items[i]),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error:   (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _SearchCard extends StatelessWidget {
  final dynamic product;
  const _SearchCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final images = (product['imageUrls'] as List?) ?? [];
    final price  = double.tryParse(product['price'].toString()) ?? 0;
    final rating = product['avgRating'];

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
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: SizedBox(
                height: 120,
                width: double.infinity,
                child: images.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl:    images[0],
                        fit:         BoxFit.cover,
                        placeholder: (_, __) => Container(color: const Color(0xFFF1F5F9)),
                        errorWidget: (_, __, ___) => Container(
                          color: const Color(0xFFF1F5F9),
                          child: const Center(child: Icon(Icons.image_outlined, color: AppTheme.textSub)),
                        ),
                      )
                    : Container(
                        color: const Color(0xFFF1F5F9),
                        child: const Center(child: Icon(Icons.image_outlined, color: AppTheme.textSub, size: 32)),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  if (product['vendor']?['storeName'] != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      product['vendor']['storeName'],
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    'RM ${price.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                  if (rating != null) ...[
                    const SizedBox(height: 3),
                    Row(children: [
                      const Icon(Icons.star_rounded, size: 12, color: Colors.amber),
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

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyState({required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), shape: BoxShape.circle),
            child: Icon(icon, size: 36, color: AppTheme.textSub),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textMain)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 13, color: AppTheme.textSub)),
        ],
      ),
    );
  }
}

class _FilterSheet extends ConsumerStatefulWidget {
  @override
  ConsumerState<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<_FilterSheet> {
  late TextEditingController _minCtrl;
  late TextEditingController _maxCtrl;

  @override
  void initState() {
    super.initState();
    _minCtrl = TextEditingController(text: ref.read(_minPriceProvider)?.toString() ?? '');
    _maxCtrl = TextEditingController(text: ref.read(_maxPriceProvider)?.toString() ?? '');
  }

  @override
  void dispose() { _minCtrl.dispose(); _maxCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 8, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: AppTheme.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const Text('Filter Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 20),
          const Text('Price Range', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textMain)),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(
              controller:   _minCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Min (RM)', prefixText: 'RM '),
            )),
            const SizedBox(width: 12),
            Expanded(child: TextField(
              controller:   _maxCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Max (RM)', prefixText: 'RM '),
            )),
          ]),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  ref.read(_minPriceProvider.notifier).state = null;
                  ref.read(_maxPriceProvider.notifier).state = null;
                  Navigator.pop(context);
                },
                child: const Text('Clear All'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  ref.read(_minPriceProvider.notifier).state = double.tryParse(_minCtrl.text);
                  ref.read(_maxPriceProvider.notifier).state = double.tryParse(_maxCtrl.text);
                  Navigator.pop(context);
                },
                child: const Text('Apply'),
              ),
            ),
          ]),
        ],
      ),
    );
  }
}
