class AppConfig {
  // ── ENVIRONMENT SWITCH ────────────────────────────────────────────────────────
  // Set to true to use local dev server, false to use Railway production
  static const bool _isDev = false;

  // ── Local (Real device on WiFi) ───────────────────────────────────────────────
  // PC's WiFi IP — only needed when running backend locally
  // For emulator use: 10.0.2.2 instead
  static const String _devApi    = 'http://10.109.176.55:3000/api';
  static const String _devSocket = 'http://10.109.176.55:3000';

  // ── Production (Railway) ──────────────────────────────────────────────────────
  // Replace RAILWAY_URL with your actual Railway domain after deploying
  // Example: nearcart-backend-production.up.railway.app
  static const String _prodApi    = 'https://RAILWAY_URL/api';
  static const String _prodSocket = 'https://RAILWAY_URL';

  // ── Active config (auto-selected) ────────────────────────────────────────────
  static String get apiBaseUrl => _isDev ? _devApi    : _prodApi;
  static String get socketUrl  => _isDev ? _devSocket : _prodSocket;

  // Stripe publishable key (test mode)
  static const String stripePublishableKey = 'pk_test_replace_me';
}
