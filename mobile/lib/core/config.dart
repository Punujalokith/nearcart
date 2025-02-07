class AppConfig {
  // Android emulator → use 10.0.2.2 to reach your PC's localhost
  // Real device on same WiFi → replace with your PC's local IP e.g. 192.168.1.5
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api';
  static const String socketUrl  = 'http://10.0.2.2:3000';
  static const String stripePublishableKey = 'pk_test_replace_me';
}
