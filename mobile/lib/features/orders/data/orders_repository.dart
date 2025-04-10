import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';

class OrdersRepository {
  final Dio _dio = DioClient.instance;

  Future<List<dynamic>> getBuyerOrders() async {
    final res = await _dio.get(ApiEndpoints.buyerOrders);
    return res.data;
  }

  Future<Map<String, dynamic>> getOrderById(String id) async {
    final res = await _dio.get(ApiEndpoints.orderById(id));
    return res.data;
  }
}
