import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'cart_item.dart';

final cartNotifierProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem({
    required String productId,
    required String name,
    required double price,
    String? imageUrl,
    required String vendorId,
    required String vendorName,
    int quantity = 1,
  }) {
    final existing = state.indexWhere((i) => i.productId == productId);
    if (existing >= 0) {
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == existing) state[i].copyWith(quantity: state[i].quantity + quantity)
          else state[i],
      ];
    } else {
      state = [...state, CartItem(
        productId: productId, name: name, price: price,
        imageUrl: imageUrl, vendorId: vendorId, vendorName: vendorName, quantity: quantity,
      )];
    }
  }

  void updateQuantity(String productId, int qty) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    state = [for (final item in state) item.productId == productId ? item.copyWith(quantity: qty) : item];
  }

  void removeItem(String productId) {
    state = state.where((i) => i.productId != productId).toList();
  }

  void clear() => state = [];

  double get total => state.fold(0, (sum, item) => sum + item.subtotal);
  String? get vendorId => state.isEmpty ? null : state.first.vendorId;
  String? get vendorName => state.isEmpty ? null : state.first.vendorName;
}
