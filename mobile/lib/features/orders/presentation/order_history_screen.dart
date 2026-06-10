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
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: orders.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error:   (e, _) => Center(child: Text('Error: $e')),
        data: (list) {
          if (list.isEmpty) {
            return Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90, height: 90,
                  decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle),
                  child: const Icon(Icons.receipt_long_outlined, size: 40, color: AppTheme.textSub),
                ),
                const SizedBox(height: 16),
                const Text('No orders yet', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                const Text('Your orders will appear here', style: TextStyle(fontSize: 13, color: AppTheme.textSub)),
              ],
            ));
          }

          // Group by active/past
          final active = list.where((o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].contains(o['status'])).toList();
          final past   = list.where((o) => ['DELIVERED', 'CANCELLED', 'REFUNDED'].contains(o['status'])).toList();

          return RefreshIndicator(
            color: AppTheme.primary,
            onRefresh: () => ref.refresh(ordersProvider.future),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
              children: [
                if (active.isNotEmpty) ...[
                  _GroupHeader(title: 'Active Orders', count: active.length, color: AppTheme.primary),
                  const SizedBox(height: 10),
                  ...active.map((o) => _OrderCard(order: o)),
                  const SizedBox(height: 20),
                ],
                if (past.isNotEmpty) ...[
                  _GroupHeader(title: 'Past Orders', count: past.length, color: AppTheme.textSub),
                  const SizedBox(height: 10),
                  ...past.map((o) => _OrderCard(order: o)),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _GroupHeader extends StatelessWidget {
  final String title;
  final int count;
  final Color color;
  const _GroupHeader({required this.title, required this.count, required this.color});

  @override
  Widget build(BuildContext context) => Row(children: [
    Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
    const SizedBox(width: 8),
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$count', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color)),
    ),
  ]);
}

class _OrderCard extends StatelessWidget {
  final dynamic order;
  const _OrderCard({required this.order});

  static const _statusConfig = {
    'PENDING':          (color: Color(0xFFF59E0B), bg: Color(0xFFFEF3C7), label: 'Pending'),
    'CONFIRMED':        (color: Color(0xFF3B82F6), bg: Color(0xFFEFF6FF), label: 'Confirmed'),
    'PREPARING':        (color: Color(0xFFA855F7), bg: Color(0xFFF3E8FF), label: 'Preparing'),
    'OUT_FOR_DELIVERY': (color: Color(0xFFF97316), bg: Color(0xFFFFF7ED), label: 'Out for Delivery'),
    'DELIVERED':        (color: AppTheme.primary,  bg: AppTheme.primary100, label: 'Delivered'),
    'CANCELLED':        (color: AppTheme.error,    bg: Color(0xFFFEE2E2), label: 'Cancelled'),
    'REFUNDED':         (color: AppTheme.textSub,  bg: AppTheme.border,   label: 'Refunded'),
  };

  @override
  Widget build(BuildContext context) {
    final status  = order['status'] as String;
    final total   = double.tryParse(order['totalAmount'].toString()) ?? 0;
    final date    = DateTime.tryParse(order['createdAt'] ?? '') ?? DateTime.now();
    final items   = (order['items'] as List?) ?? [];
    final vendor  = order['vendor'];
    final cfg     = _statusConfig[status];

    final isActive  = !['DELIVERED', 'CANCELLED', 'REFUNDED'].contains(status);
    final isDelivered = status == 'DELIVERED';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/orders/${order['id']}/track'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Store + status
              Row(children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.primary100,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.storefront_outlined, size: 18, color: AppTheme.primary),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(vendor?['storeName'] ?? 'Order',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    Text(DateFormat('dd MMM yyyy').format(date),
                        style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
                  ],
                )),
                if (cfg != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color:  cfg.bg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(cfg.label,
                        style: TextStyle(color: cfg.color, fontSize: 11, fontWeight: FontWeight.w700)),
                  ),
              ]),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),

              // Items + total
              Row(children: [
                Text('${items.length} item${items.length != 1 ? 's' : ''}',
                    style: const TextStyle(color: AppTheme.textSub, fontSize: 13)),
                const Spacer(),
                Text('RM ${total.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primary, fontSize: 15)),
              ]),
              const SizedBox(height: 12),

              // Action buttons
              Row(children: [
                if (isActive) Expanded(
                  child: SizedBox(
                    height: 38,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/orders/${order['id']}/track'),
                      style: ElevatedButton.styleFrom(minimumSize: const Size(0, 38)),
                      icon:  const Icon(Icons.location_on_outlined, size: 15),
                      label: const Text('Track Order', style: TextStyle(fontSize: 13)),
                    ),
                  ),
                ),
                if (!isActive) ...[
                  Expanded(
                    child: SizedBox(
                      height: 38,
                      child: OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                        child: const Text('Reorder', style: TextStyle(fontSize: 13)),
                      ),
                    ),
                  ),
                  if (isDelivered) ...[
                    const SizedBox(width: 8),
                    Expanded(
                      child: SizedBox(
                        height: 38,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(minimumSize: const Size(0, 38)),
                          child: const Text('Rate Order', style: TextStyle(fontSize: 13)),
                        ),
                      ),
                    ),
                  ],
                ],
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
