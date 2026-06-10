import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../domain/auth_notifier.dart';
import '../../../core/theme/app_theme.dart';

enum _Role { shopper, vendor, delivery }

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _nameCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _confCtrl  = TextEditingController();
  bool _obscure    = true;
  bool _obscureConf = true;
  _Role _role      = _Role.shopper;

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose();
    _passCtrl.dispose(); _confCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authNotifierProvider.notifier).register(
      name:     _nameCtrl.text.trim(),
      email:    _emailCtrl.text.trim(),
      password: _passCtrl.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authNotifierProvider);

    ref.listen(authNotifierProvider, (_, next) {
      if (next.user != null) context.go('/home');
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:         Text(next.error!),
            backgroundColor: AppTheme.error,
            behavior:        SnackBarBehavior.floating,
            shape:           RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    });

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 28),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                    begin: Alignment.topLeft,
                    end:   Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Create Account',
                      style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Join NearCart today',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Role selection
                      const Text(
                        'I am a...',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textMain),
                      ),
                      const SizedBox(height: 12),
                      Row(children: [
                        Expanded(child: _RoleCard(
                          icon:     Icons.shopping_bag_outlined,
                          label:    'Shopper',
                          selected: _role == _Role.shopper,
                          onTap:    () => setState(() => _role = _Role.shopper),
                        )),
                        const SizedBox(width: 10),
                        Expanded(child: _RoleCard(
                          icon:     Icons.storefront_outlined,
                          label:    'Vendor',
                          selected: _role == _Role.vendor,
                          onTap:    () => setState(() => _role = _Role.vendor),
                        )),
                        const SizedBox(width: 10),
                        Expanded(child: _RoleCard(
                          icon:     Icons.delivery_dining_outlined,
                          label:    'Delivery',
                          selected: _role == _Role.delivery,
                          onTap:    () => setState(() => _role = _Role.delivery),
                        )),
                      ]),
                      const SizedBox(height: 24),

                      // Fields
                      TextFormField(
                        controller: _nameCtrl,
                        textCapitalization: TextCapitalization.words,
                        decoration: const InputDecoration(
                          labelText:  'Full name',
                          prefixIcon: Icon(Icons.person_outline),
                          hintText:   'John Doe',
                        ),
                        validator: (v) => v!.length >= 2 ? null : 'Enter your name',
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller:   _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText:  'Email address',
                          prefixIcon: Icon(Icons.email_outlined),
                          hintText:   'you@example.com',
                        ),
                        validator: (v) => v!.contains('@') ? null : 'Enter a valid email',
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller:  _passCtrl,
                        obscureText: _obscure,
                        decoration: InputDecoration(
                          labelText:  'Password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          hintText:   'Min 8 characters',
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                        validator: (v) => v!.length >= 8 ? null : 'Minimum 8 characters',
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller:  _confCtrl,
                        obscureText: _obscureConf,
                        decoration: InputDecoration(
                          labelText:  'Confirm password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(_obscureConf ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscureConf = !_obscureConf),
                          ),
                        ),
                        validator: (v) => v == _passCtrl.text ? null : 'Passwords do not match',
                      ),
                      const SizedBox(height: 28),

                      ElevatedButton(
                        onPressed: state.isLoading ? null : _submit,
                        child: state.isLoading
                            ? const SizedBox(
                                height: 22, width: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                              )
                            : const Text('Create Account'),
                      ),
                      const SizedBox(height: 20),

                      Center(
                        child: GestureDetector(
                          onTap: () => context.go('/login'),
                          child: RichText(
                            text: const TextSpan(
                              text:  'Already have an account? ',
                              style: TextStyle(color: AppTheme.textSub, fontSize: 14),
                              children: [
                                TextSpan(
                                  text:  'Sign in',
                                  style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _RoleCard({required this.icon, required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primary100 : AppTheme.surface,
          border: Border.all(
            color:  selected ? AppTheme.primary : AppTheme.border,
            width:  selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Icon(icon, size: 24, color: selected ? AppTheme.primary : AppTheme.textSub),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize:   12,
                fontWeight: FontWeight.w600,
                color:      selected ? AppTheme.primary : AppTheme.textSub,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
