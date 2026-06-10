import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../data/orders_repository.dart';
import '../../../core/theme/app_theme.dart';

final _orderDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return OrdersRepository().getOrderById(id);
});

class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_orderDetailProvider(orderId));
    return async.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primary))),
      error:   (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data:    (order) => _TrackingView(order: order),
    );
  }
}

class _TrackingView extends StatelessWidget {
  final Map<String, dynamic> order;
  const _TrackingView({required this.order});

  static const _steps = [
    (status: 'PENDING',          icon: Icons.access_time_outlined,     label: 'Order Placed',       color: Color(0xFFF59E0B)),
    (status: 'CONFIRMED',        icon: Icons.check_circle_outline,      label: 'Confirmed',          color: Color(0xFF3B82F6)),
    (status: 'PREPARING',        icon: Icons.restaurant_outlined,       label: 'Preparing',          color: Color(0xFFA855F7)),
    (status: 'OUT_FOR_DELIVERY', icon: Icons.delivery_dining_outlined,  label: 'Out for Delivery',   color: Color(0xFFF97316)),
    (status: 'DELIVERED',        icon: Icons.home_outlined,             label: 'Delivered',          color: AppTheme.primary),
  ];

  int _currentStep(String status) => _steps.indexWhere((s) => s.status == status);

  @override
  Widget build(BuildContext context) {
    final status   = order['status'] as String;
    final tracking = order['tracking'];
    final address  = order['address'];
    final current  = _currentStep(status);
    final isCancelled = status == 'CANCELLED' || status == 'REFUNDED';

    final double? lat = tracking != null ? (tracking['lat'] as num?)?.toDouble() : null;
    final double? lng = tracking != null ? (tracking['lng'] as num?)?.toDouble() : null;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Order Tracking'),
            Text(
              '#${order['id'].toString().substring(0, 8).toUpperCase()}',
              style: const TextStyle(fontSize: 12, color: AppTheme.textSub, fontWeight: FontWeight.w400),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // ── Map ──────────────────────────────────────────────
          SizedBox(
            height: 220,
            child: lat != null && lng != null
                ? ClipRRect(
                    child: FlutterMap(
                      options: MapOptions(initialCenter: LatLng(lat, lng), initialZoom: 15),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.nearcart',
                        ),
                        MarkerLayer(markers: [
                          Marker(
                            point: LatLng(lat, lng),
                            child: Container(
                              width: 44, height: 44,
                              decoration: BoxDecoration(
                                color: AppTheme.primary,
                                shape: BoxShape.circle,
                                boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.4), blurRadius: 12, spreadRadius: 4)],
                              ),
                              child: const Icon(Icons.delivery_dining, color: Colors.white, size: 22),
                            ),
                          ),
                        ]),
                      ],
                    ),
                  )
                : Container(
                    color: const Color(0xFFF1F5F9),
                    child: Center(child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 60, height: 60,
                          decoration: const BoxDecoration(color: AppTheme.primary100, shape: BoxShape.circle),
                          child: const Icon(Icons.location_on_outlined, size: 28, color: AppTheme.primary),
                        ),
                        const SizedBox(height: 12),
                        const Text('Live tracking available\nwhen out for delivery',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppTheme.textSub, fontSize: 13)),
                      ],
                    )),
                  ),
          ),

          // ── Progress bar ──────────────────────────────────────
          if (!isCancelled && current >= 0)
            Container(
              color: AppTheme.surface,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_steps[current < _steps.length ? current : _steps.length - 1].label,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primary)),
                      Text('${current + 1} / ${_steps.length}',
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSub)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  LinearProgressIndicator(
                    value: (current + 1) / _steps.length,
                    backgroundColor: AppTheme.border,
                    color: AppTheme.primary,
                    minHeight: 5,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ],
              ),
            ),

          // ── Status timeline ───────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (address != null) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(children: [
                        const Icon(Icons.location_on_outlined, size: 18, color: AppTheme.primary),
                        const SizedBox(width: 10),
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Delivering to', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                            Text('${address['label']} — ${address['line1']}, ${address['city']}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          ],
                        )),
                      ]),
                    ),
                    const SizedBox(height: 20),
                  ],

                  const Text('Delivery Timeline', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),

                  if (isCancelled) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: Row(children: [
                        const Icon(Icons.cancel_outlined, color: AppTheme.error),
                        const SizedBox(width: 12),
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('Order Cancelled', style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.error)),
                          const Text('This order has been cancelled', style: TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        ]),
                      ]),
                    ),
                  ] else
                    ..._steps.asMap().entries.map((e) {
                      final idx    = e.key;
                      final step   = e.value;
                      final isDone = idx <= current;
                      final isCur  = idx == current;

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Timeline indicator
                          SizedBox(
                            width: 44,
                            child: Column(
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(
                                    color:  isDone ? (isCur ? step.color : step.color.withOpacity(0.15)) : const Color(0xFFF1F5F9),
                                    shape:  BoxShape.circle,
                                    border: isCur ? Border.all(color: step.color, width: 2.5) : null,
                                  ),
                                  child: Icon(
                                    step.icon,
                                    size:  18,
                                    color: isDone ? (isCur ? Colors.white : step.color) : AppTheme.textSub,
                                  ),
                                ),
                                if (idx < _steps.length - 1)
                                  Container(
                                    width: 2, height: 36,
                                    margin: const EdgeInsets.symmetric(vertical: 4),
                                    decoration: BoxDecoration(
                                      color: idx < current ? AppTheme.primary : AppTheme.border,
                                      borderRadius: BorderRadius.circular(1),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  step.label,
                                  style: TextStyle(
                                    fontSize:   14,
                                    fontWeight: isCur ? FontWeight.w700 : FontWeight.w500,
                                    color:      isDone ? AppTheme.textMain : AppTheme.textSub,
                                  ),
                                ),
                                if (isCur) Text(
                                  'Current status',
                                  style: TextStyle(fontSize: 11, color: step.color, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
