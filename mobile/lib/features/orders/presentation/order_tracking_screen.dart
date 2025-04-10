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
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error:   (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data:    (order) => _TrackingView(order: order),
    );
  }
}

class _TrackingView extends StatelessWidget {
  final Map<String, dynamic> order;
  const _TrackingView({required this.order});

  static const _steps = [
    ('PENDING', Icons.pending_outlined, 'Order Placed'),
    ('CONFIRMED', Icons.check_circle_outline, 'Confirmed'),
    ('PREPARING', Icons.restaurant_outlined, 'Preparing'),
    ('OUT_FOR_DELIVERY', Icons.delivery_dining_outlined, 'Out for Delivery'),
    ('DELIVERED', Icons.home_outlined, 'Delivered'),
  ];

  int _currentStep(String status) {
    return _steps.indexWhere((s) => s.$1 == status);
  }

  @override
  Widget build(BuildContext context) {
    final status   = order['status'] as String;
    final tracking = order['tracking'];
    final address  = order['address'];
    final current  = _currentStep(status);

    final double? lat = tracking != null ? (tracking['lat'] as num?)?.toDouble() : null;
    final double? lng = tracking != null ? (tracking['lng'] as num?)?.toDouble() : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Order Tracking')),
      body: Column(
        children: [
          // Map
          SizedBox(
            height: 220,
            child: lat != null && lng != null
                ? FlutterMap(
                    options: MapOptions(initialCenter: LatLng(lat, lng), initialZoom: 15),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.nearcart',
                      ),
                      MarkerLayer(markers: [
                        Marker(
                          point: LatLng(lat, lng),
                          child: const Icon(Icons.delivery_dining, color: AppTheme.primary, size: 36),
                        ),
                      ]),
                    ],
                  )
                : Container(
                    color: AppTheme.border,
                    child: const Center(child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map_outlined, size: 48, color: AppTheme.textSub),
                        SizedBox(height: 8),
                        Text('Live tracking starts when\nout for delivery',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppTheme.textSub)),
                      ],
                    )),
                  ),
          ),

          // Status stepper
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order #${order['id'].toString().substring(0, 8).toUpperCase()}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  if (address != null) ...[
                    const SizedBox(height: 4),
                    Text('${address['line1']}, ${address['city']}',
                        style: const TextStyle(color: AppTheme.textSub)),
                  ],
                  const SizedBox(height: 20),
                  ..._steps.asMap().entries.map((e) {
                    final idx    = e.key;
                    final step   = e.value;
                    final isDone = idx <= current;
                    return Row(
                      children: [
                        Column(children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: isDone ? AppTheme.primary : AppTheme.border,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(step.$2, color: isDone ? Colors.white : AppTheme.textSub, size: 18),
                          ),
                          if (idx < _steps.length - 1)
                            Container(width: 2, height: 32,
                                color: idx < current ? AppTheme.primary : AppTheme.border),
                        ]),
                        const SizedBox(width: 16),
                        Text(step.$3, style: TextStyle(
                          fontWeight: idx == current ? FontWeight.bold : FontWeight.normal,
                          color: isDone ? AppTheme.textMain : AppTheme.textSub,
                        )),
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
