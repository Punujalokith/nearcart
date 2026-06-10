import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTheme {
  // ── Colors ────────────────────────────────────────────────
  static const Color primary     = Color(0xFF16A34A); // Green-600
  static const Color primary50   = Color(0xFFF0FDF4); // Green-50
  static const Color primary100  = Color(0xFFDCFCE7); // Green-100
  static const Color primary700  = Color(0xFF15803D); // Green-700
  static const Color secondary   = Color(0xFF16A34A);
  static const Color error       = Color(0xFFDC2626);
  static const Color warning     = Color(0xFFF59E0B);
  static const Color background  = Color(0xFFF8FAFC);
  static const Color surface     = Color(0xFFFFFFFF);
  static const Color onPrimary   = Color(0xFFFFFFFF);
  static const Color textMain    = Color(0xFF0F172A);
  static const Color textSub     = Color(0xFF64748B);
  static const Color border      = Color(0xFFE2E8F0);
  static const Color cardBg      = Color(0xFFFFFFFF);

  static ThemeData get light {
    const colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary:    primary,
      onPrimary:  onPrimary,
      secondary:  primary,
      onSecondary: onPrimary,
      error:      error,
      onError:    onPrimary,
      surface:    surface,
      onSurface:  textMain,
    );

    return ThemeData(
      useMaterial3:           true,
      colorScheme:            colorScheme,
      scaffoldBackgroundColor: background,
      fontFamily:             'Inter',

      appBarTheme: const AppBarTheme(
        backgroundColor:     surface,
        foregroundColor:     textMain,
        elevation:           0,
        scrolledUnderElevation: 0,
        centerTitle:         false,
        titleTextStyle: TextStyle(
          color:      textMain,
          fontSize:   18,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor:           Colors.transparent,
          statusBarIconBrightness:  Brightness.dark,
        ),
      ),

      cardTheme: CardThemeData(
        color:     surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled:    true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        hintStyle: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 14),
        labelStyle: const TextStyle(color: textSub, fontSize: 14),
        prefixIconColor: textSub,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor:  primary,
          foregroundColor:  onPrimary,
          minimumSize:      const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation:        0,
          textStyle: const TextStyle(
            fontSize: 15, fontWeight: FontWeight.w600, fontFamily: 'Inter',
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: primary),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, fontFamily: 'Inter'),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, fontFamily: 'Inter'),
        ),
      ),

      chipTheme: ChipThemeData(
        selectedColor:     primary100,
        labelStyle: const TextStyle(fontSize: 13, fontFamily: 'Inter'),
        side: const BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor:  surface,
        indicatorColor:   primary50,
        labelTextStyle:   WidgetStateProperty.all(
          const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, fontFamily: 'Inter'),
        ),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primary);
          }
          return const IconThemeData(color: textSub);
        }),
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: onPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),

      dividerTheme: const DividerThemeData(color: border, space: 1),
      splashFactory: InkRipple.splashFactory,
    );
  }
}
