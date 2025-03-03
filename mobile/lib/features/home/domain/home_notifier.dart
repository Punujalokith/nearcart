import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/products_repository.dart';

// ─── Providers ─────────────────────────────────────────────────────────────────

final categoriesProvider = FutureProvider<List<dynamic>>((ref) async {
  return ProductsRepository().getCategories();
});

final selectedCategoryProvider = StateProvider<String?>((ref) => null);

final productsProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  return ProductsRepository().getProducts(
    search:     params['search'],
    categoryId: params['categoryId'],
    minPrice:   params['minPrice'],
    maxPrice:   params['maxPrice'],
    page:       params['page'] ?? 1,
  );
});

// Convenience provider for home screen
final homeProductsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final categoryId = ref.watch(selectedCategoryProvider);
  return ProductsRepository().getProducts(categoryId: categoryId);
});
