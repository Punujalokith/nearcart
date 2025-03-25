class CartItem {
  final String productId;
  final String name;
  final double price;
  final String? imageUrl;
  final String vendorId;
  final String vendorName;
  int quantity;

  CartItem({
    required this.productId,
    required this.name,
    required this.price,
    this.imageUrl,
    required this.vendorId,
    required this.vendorName,
    this.quantity = 1,
  });

  double get subtotal => price * quantity;

  CartItem copyWith({int? quantity}) => CartItem(
    productId:  productId,
    name:       name,
    price:      price,
    imageUrl:   imageUrl,
    vendorId:   vendorId,
    vendorName: vendorName,
    quantity:   quantity ?? this.quantity,
  );
}
