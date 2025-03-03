import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';

class ProductsRepository {
  final Dio _dio = DioClient.instance;

  Future<Map<String, dynamic>> getProducts({
    String? search,
    String? categoryId,
    double? minPrice,
    double? maxPrice,
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _dio.get(ApiEndpoints.products, queryParameters: {
      if (search     != null) 'search': search,
      if (categoryId != null) 'categoryId': categoryId,
      if (minPrice   != null) 'minPrice': minPrice,
      if (maxPrice   != null) 'maxPrice': maxPrice,
      'page': page,
      'limit': limit,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> getProductById(String id) async {
    final res = await _dio.get(ApiEndpoints.productById(id));
    return res.data;
  }

  Future<List<dynamic>> getCategories() async {
    final res = await _dio.get(ApiEndpoints.categories);
    return res.data;
  }
}
