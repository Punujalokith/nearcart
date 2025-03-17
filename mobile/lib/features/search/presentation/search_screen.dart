import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../home/data/products_repository.dart';
import '../../../core/theme/app_theme.dart';

final _searchQueryProvider  = StateProvider<String>((ref) => '');
final _minPriceProvider     = StateProvider<double?>((ref) => null);
final _maxPriceProvider     = StateProvider<double?>((ref) => null);

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
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _FilterSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(_searchResultsProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _ctrl,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search products...',
            border: InputBorder.none,
            isDense: true,
          ),
          onChanged: (v) {
            Future.delayed(const Duration(milliseconds: 400), () {
              if (_ctrl.text == v) ref.read(_searchQueryProvider.notifier).state = v;
            });
          },
        ),
        actions: [
          IconButton(icon: const Icon(Icons.tune), onPressed: _showFilters),
        ],
      ),
      body: results.when(
        data: (data) {
          final items = data['data'] as List? ?? [];
          if (items.isEmpty && ref.read(_searchQueryProvider).isEmpty) {
            return const Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.search, size: 64, color: AppTheme.textSub),
                SizedBox(height: 16),
                Text('Search for products', style: TextStyle(color: AppTheme.textSub)),
              ],
            ));
          }
          if (items.isEmpty) {
            return const Center(child: Text('No results found', style: TextStyle(color: AppTheme.textSub)));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _SearchResultTile(product: items[i]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final dynamic product;
  const _SearchResultTile({required this.product});

  @override
  Widget build(BuildContext context) {
    final images = (product['imageUrls'] as List?) ?? [];
    final price  = double.tryParse(product['price'].toString()) ?? 0;

    return Card(
      child: ListTile(
        onTap: () => context.push('/product/${product['id']}'),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: images.isNotEmpty
              ? CachedNetworkImage(imageUrl: images[0], width: 56, height: 56, fit: BoxFit.cover)
              : Container(width: 56, height: 56, color: AppTheme.border,
                  child: const Icon(Icons.image_outlined, color: AppTheme.textSub)),
        ),
        title: Text(product['name'], maxLines: 1, overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(product['vendor']?['storeName'] ?? '', style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
        trailing: Text('RM ${price.toStringAsFixed(2)}',
            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
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
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          const Text('Price Range', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(
              controller: _minCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Min (RM)', prefixText: 'RM '),
            )),
            const SizedBox(width: 12),
            Expanded(child: TextField(
              controller: _maxCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Max (RM)', prefixText: 'RM '),
            )),
          ]),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(child: OutlinedButton(
              onPressed: () {
                ref.read(_minPriceProvider.notifier).state = null;
                ref.read(_maxPriceProvider.notifier).state = null;
                Navigator.pop(context);
              },
              child: const Text('Clear'),
            )),
            const SizedBox(width: 12),
            Expanded(child: ElevatedButton(
              onPressed: () {
                ref.read(_minPriceProvider.notifier).state = double.tryParse(_minCtrl.text);
                ref.read(_maxPriceProvider.notifier).state = double.tryParse(_maxCtrl.text);
                Navigator.pop(context);
              },
              child: const Text('Apply'),
            )),
          ]),
        ],
      ),
    );
  }
}
