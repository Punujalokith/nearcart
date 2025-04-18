import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/theme/app_theme.dart';

final _addressesListProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final res = await DioClient.instance.get(ApiEndpoints.myAddresses);
  return res.data;
});

class AddressBookScreen extends ConsumerWidget {
  const AddressBookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(_addressesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Address Book')),
      body: addresses.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error:   (e, _) => Center(child: Text('Error: $e')),
        data: (list) {
          if (list.isEmpty) {
            return Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_off_outlined, size: 80, color: AppTheme.textSub),
                const SizedBox(height: 16),
                const Text('No addresses yet', style: TextStyle(color: AppTheme.textSub, fontSize: 16)),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => _showAddDialog(context, ref),
                  icon: const Icon(Icons.add),
                  label: const Text('Add Address'),
                ),
              ],
            ));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) {
              final addr = list[i];
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.location_on_outlined, color: AppTheme.primary),
                  title: Text(addr['label'], style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${addr['line1']}, ${addr['city']}'),
                  trailing: addr['isDefault'] == true
                      ? const Chip(label: Text('Default'), padding: EdgeInsets.zero)
                      : null,
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _AddAddressSheet(onSaved: () => ref.invalidate(_addressesListProvider)),
    );
  }
}

class _AddAddressSheet extends StatefulWidget {
  final VoidCallback onSaved;
  const _AddAddressSheet({required this.onSaved});
  @override
  State<_AddAddressSheet> createState() => _AddAddressSheetState();
}

class _AddAddressSheetState extends State<_AddAddressSheet> {
  final _formKey  = GlobalKey<FormState>();
  final _label    = TextEditingController(text: 'Home');
  final _line1    = TextEditingController();
  final _city     = TextEditingController();
  bool _isDefault = false;
  bool _loading   = false;

  @override
  void dispose() { _label.dispose(); _line1.dispose(); _city.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await DioClient.instance.post(ApiEndpoints.myAddresses, data: {
        'label': _label.text,
        'line1': _line1.text,
        'city':  _city.text,
        'lat':   3.1390,   // Default KL coords — in production use device GPS
        'lng':   101.6869,
        'isDefault': _isDefault,
      });
      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } on DioException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.response?.data?['error'] ?? 'Failed'), backgroundColor: AppTheme.error),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Add Address', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            TextFormField(
              controller: _label,
              decoration: const InputDecoration(labelText: 'Label (e.g. Home, Office)'),
              validator: (v) => v!.isNotEmpty ? null : 'Required',
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _line1,
              decoration: const InputDecoration(labelText: 'Street address'),
              validator: (v) => v!.isNotEmpty ? null : 'Required',
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _city,
              decoration: const InputDecoration(labelText: 'City'),
              validator: (v) => v!.isNotEmpty ? null : 'Required',
            ),
            CheckboxListTile(
              value: _isDefault,
              onChanged: (v) => setState(() => _isDefault = v!),
              title: const Text('Set as default'),
              contentPadding: EdgeInsets.zero,
            ),
            ElevatedButton(
              onPressed: _loading ? null : _save,
              child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Save Address'),
            ),
          ],
        ),
      ),
    );
  }
}
