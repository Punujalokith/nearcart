class ApiEndpoints {
  // Auth
  static const String register  = '/auth/register';
  static const String login     = '/auth/login';
  static const String refresh   = '/auth/refresh';
  static const String logout    = '/auth/logout';
  static const String fcmToken  = '/auth/fcm-token';

  // Users
  static const String me            = '/users/me';
  static const String myAddresses   = '/users/me/addresses';

  // Vendors
  static const String vendors = '/vendors';
  static String vendorById(String id) => '/vendors/$id';

  // Products
  static const String products = '/products';
  static String productById(String id) => '/products/$id';
  static String productImages(String id) => '/products/$id/images';

  // Categories
  static const String categories = '/categories';

  // Orders
  static const String orders        = '/orders';
  static const String buyerOrders   = '/orders/buyer/me';
  static const String vendorOrders  = '/orders/vendor/me';
  static String orderById(String id)     => '/orders/$id';
  static String orderStatus(String id)   => '/orders/$id/status';

  // Payments
  static const String checkout         = '/payments/checkout';
  static const String connectOnboard   = '/payments/connect/onboard';
  static const String connectStatus    = '/payments/connect/status';

  // Reviews
  static const String reviews                   = '/reviews';
  static String reviewsByProduct(String id)     => '/reviews/product/$id';
}
