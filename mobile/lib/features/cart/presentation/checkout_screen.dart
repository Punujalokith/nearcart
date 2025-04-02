import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../domain/cart_notifier.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/theme/app_theme.dart';

final _addressesProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await DioClient.instance.get(ApiEndpoints.myAddresses);
  return res.data;
});

final _selectedAddressProvider = StateProvider<String?>((ref) => null);

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  bool _isLoading = false;

  Future<void> _placeOrder() async {
    final addressId = ref.read(_selectedAddressProvider);
    if (addressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }

    final cart = ref.read(cartNotifierProvider);
    setState(() => _isLoading = true);

    try {
      // 1. Create order
      final orderRes = await DioClient.instance.post(ApiEndpoints.orders, data: {
        'addressId': addressId,
        'items': cart.map((i) => {'productId': i.productId, 'quantity': i.quantity}).toList(),
      });
      final orderId = orderRes.data['id'];

      // 2. Create Stripe checkout session
      await DioClient.instance.post(ApiEndpoints.checkout, data: {'orderId': orderId});
      // Stripe checkout URL available at payRes.data['url'] for WebView integration

      // 3. Clear cart
      ref.read(cartNotifierProvider.notifier).clear();

      // 4. Navigate to order confirmation
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed! Redirecting to payment...'), backgroundColor: AppTheme.secondary),
        );
        context.go('/orders/$orderId/track');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['error'] ?? 'Order failed'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart       = ref.watch(cartNotifierProvider);
    final addresses  = ref.watch(_addressesProvider);
    final selectedId = ref.watch(_selectedAddressProvider);
    final total      = ref.read(cartNotifierProvider.notifier).total;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delivery Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            addresses.when(
              data: (addrs) {
                if (addrs.isEmpty) {
                  return Column(children: [
                    const Text('No saved addresses', style: TextStyle(color: AppTheme.textSub)),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/address-book'),
                      icon: const Icon(Icons.add),
                      label: const Text('Add Address'),
                    ),
                  ]);
                }
                return Column(
                  children: addrs.map<Widget>((addr) => RadioListTile<String>(
                    value: addr['id'],
                    groupValue: selectedId,
                    onChanged: (v) => ref.read(_selectedAddressProvider.notifier).state = v,
                    title: Text(addr['label'], style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text('${addr['line1']}, ${addr['city']}'),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(color: selectedId == addr['id'] ? AppTheme.primary : AppTheme.border),
                    ),
                  )).toList(),
                );
              },
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 24),
            const Text('Order Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...cart.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(children: [
                Expanded(child: Text('${item.name} x${item.quantity}')),
                Text('RM ${item.subtotal.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.w500)),
              ]),
            )),
            const Divider(),
            Row(children: [
              const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Spacer(),
              Text('RM ${total.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
            ]),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _placeOrder,
              child: _isLoading
                  ? const SizedBox(height: 20, width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Place Order & Pay'),
            ),
          ],
        ),
      ),
    );
  }
}
