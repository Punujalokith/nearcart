import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../domain/cart_notifier.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/theme/app_theme.dart';

final _addressesProvider      = FutureProvider<List<dynamic>>((ref) async {
  final res = await DioClient.instance.get(ApiEndpoints.myAddresses);
  return res.data;
});

final _selectedAddressProvider = StateProvider<String?>((ref) => null);
final _stepProvider            = StateProvider<int>((ref) => 0);

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
      _snack('Please select a delivery address', isError: true);
      return;
    }

    final cart = ref.read(cartNotifierProvider);
    setState(() => _isLoading = true);

    try {
      final orderRes = await DioClient.instance.post(ApiEndpoints.orders, data: {
        'addressId': addressId,
        'items': cart.map((i) => {'productId': i.productId, 'quantity': i.quantity}).toList(),
      });
      final orderId = orderRes.data['id'];
      await DioClient.instance.post(ApiEndpoints.checkout, data: {'orderId': orderId});
      ref.read(cartNotifierProvider.notifier).clear();
      if (mounted) {
        _snack('Order placed! Proceeding to payment...');
        context.go('/orders/$orderId/track');
      }
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['error'] ?? 'Order failed', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _snack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content:         Text(msg),
      backgroundColor: isError ? AppTheme.error : AppTheme.primary,
      behavior:        SnackBarBehavior.floating,
      shape:           RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final cart       = ref.watch(cartNotifierProvider);
    final addresses  = ref.watch(_addressesProvider);
    final selectedId = ref.watch(_selectedAddressProvider);
    final total      = ref.read(cartNotifierProvider.notifier).total;

    const steps = ['Delivery', 'Payment', 'Confirm'];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Checkout'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: List.generate(steps.length, (i) {
                final isDone    = i < 1;
                final isCurrent = i == 0;
                return Expanded(
                  child: Row(children: [
                    if (i > 0) Expanded(child: Container(height: 2, color: isDone ? AppTheme.primary : AppTheme.border)),
                    Column(children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(
                          color:  isCurrent ? AppTheme.primary : (isDone ? AppTheme.primary : AppTheme.border),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isDone && !isCurrent
                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                              : Text('${i + 1}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(steps[i], style: TextStyle(
                        fontSize: 10,
                        fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w400,
                        color: isCurrent ? AppTheme.primary : AppTheme.textSub,
                      )),
                    ]),
                    if (i < steps.length - 1) const Expanded(child: SizedBox()),
                  ]),
                );
              }),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // Delivery address section
            _SectionHeader(title: 'Delivery Address', icon: Icons.location_on_outlined),
            const SizedBox(height: 12),
            addresses.when(
              data: (addrs) {
                if (addrs.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(children: [
                      const Icon(Icons.location_off_outlined, size: 32, color: AppTheme.textSub),
                      const SizedBox(height: 8),
                      const Text('No saved addresses', style: TextStyle(color: AppTheme.textSub)),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 42,
                        child: OutlinedButton.icon(
                          onPressed: () => context.push('/address-book'),
                          icon:  const Icon(Icons.add, size: 16),
                          label: const Text('Add Address'),
                          style: OutlinedButton.styleFrom(minimumSize: const Size(0, 42)),
                        ),
                      ),
                    ]),
                  );
                }
                return Column(
                  children: addrs.map<Widget>((addr) {
                    final isSelected = selectedId == addr['id'];
                    return GestureDetector(
                      onTap: () => ref.read(_selectedAddressProvider.notifier).state = addr['id'],
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary100 : AppTheme.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.border, width: isSelected ? 2 : 1),
                        ),
                        child: Row(children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.primary : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.location_on_outlined, size: 18, color: isSelected ? Colors.white : AppTheme.textSub),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(addr['label'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              Text('${addr['line1']}, ${addr['city']}',
                                  style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
                            ],
                          )),
                          if (isSelected) const Icon(Icons.check_circle, color: AppTheme.primary, size: 20),
                        ]),
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => const CircularProgressIndicator(color: AppTheme.primary),
              error:   (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 24),

            // Order summary
            _SectionHeader(title: 'Order Summary', icon: Icons.receipt_long_outlined),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  ...cart.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(children: [
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${item.name}', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                          Text('x${item.quantity}', style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        ],
                      )),
                      Text('RM ${item.subtotal.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    ]),
                  )),
                  Container(
                    height: 1,
                    color: AppTheme.border,
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(children: [
                      const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Text('RM ${total.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                    ]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: ElevatedButton(
          onPressed: _isLoading ? null : _placeOrder,
          child: _isLoading
              ? const SizedBox(height: 22, width: 22,
                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
              : const Text('Place Order & Pay'),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 18, color: AppTheme.primary),
      const SizedBox(width: 8),
      Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textMain)),
    ]);
  }
}
