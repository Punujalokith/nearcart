import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../data/orders_repository.dart';
import '../../../core/theme/app_theme.dart';

final ordersProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  return OrdersRepository().getBuyerOrders();
});

class OrderHistoryScreen extends ConsumerWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: orders.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error:   (e, _) => Center(child: Text('Error: $e')),
        data: (list) {
          if (list.isEmpty) {
            return const Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.receipt_long_outlined, size: 80, color: AppTheme.textSub),
                SizedBox(height: 16),
                Text('No orders yet', style: TextStyle(color: AppTheme.textSub, fontSize: 16)),
              ],
            ));
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(ordersProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _OrderCard(order: list[i]),
            ),
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final dynamic order;
  const _OrderCard({required this.order});

  Color _statusColor(String status) {
    switch (status) {
      case 'DELIVERED':        return AppTheme.secondary;
      case 'CANCELLED':
      case 'REFUNDED':         return AppTheme.error;
      case 'OUT_FOR_DELIVERY': return Colors.orange;
      default:                 return AppTheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status  = order['status'] as String;
    final total   = double.tryParse(order['totalAmount'].toString()) ?? 0;
    final date    = DateTime.tryParse(order['createdAt'] ?? '') ?? DateTime.now();
    final items   = (order['items'] as List?) ?? [];
    final vendor  = order['vendor'];

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push('/orders/${order['id']}/track'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Text(vendor?['storeName'] ?? 'Order',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(status.replaceAll('_', ' '),
                      style: TextStyle(color: _statusColor(status), fontSize: 12, fontWeight: FontWeight.w600)),
                ),
              ]),
              const SizedBox(height: 8),
              Text('${items.length} item${items.length > 1 ? 's' : ''}',
                  style: const TextStyle(color: AppTheme.textSub)),
              const SizedBox(height: 4),
              Text(DateFormat('dd MMM yyyy, HH:mm').format(date),
                  style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
              const Divider(height: 16),
              Row(children: [
                const Text('Total', style: TextStyle(color: AppTheme.textSub)),
                const Spacer(),
                Text('RM ${total.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
