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

const _addrLabels = ['Home', 'Work', 'Parents\' Home', 'Other'];

final _addrIcons = {
  'Home':   Icons.home_outlined,
  'Work':   Icons.work_outline,
  'Other':  Icons.location_on_outlined,
};

class AddressBookScreen extends ConsumerWidget {
  const AddressBookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(_addressesListProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('Address Book')),
      body: addresses.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error:   (e, _) => Center(child: Text('Error: $e')),
        data: (list) {
          if (list.isEmpty) {
            return Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90, height: 90,
                  decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle),
                  child: const Icon(Icons.location_off_outlined, size: 40, color: AppTheme.textSub),
                ),
                const SizedBox(height: 16),
                const Text('No addresses saved', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                const Text('Add a delivery address to get started', style: TextStyle(fontSize: 13, color: AppTheme.textSub)),
                const SizedBox(height: 24),
                SizedBox(
                  width: 180,
                  child: ElevatedButton.icon(
                    onPressed: () => _showAddDialog(context, ref),
                    icon:  const Icon(Icons.add, size: 18),
                    label: const Text('Add Address'),
                  ),
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
              final icon = _addrIcons[addr['label']] ?? Icons.location_on_outlined;
              return Container(
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: addr['isDefault'] == true ? AppTheme.primary : AppTheme.border,
                    width: addr['isDefault'] == true ? 2 : 1,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: addr['isDefault'] == true ? AppTheme.primary100 : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      icon,
                      size: 22,
                      color: addr['isDefault'] == true ? AppTheme.primary : AppTheme.textSub,
                    ),
                  ),
                  title: Text(addr['label'],
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text('${addr['line1']}, ${addr['city']}',
                        style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
                  ),
                  trailing: addr['isDefault'] == true
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.primary100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('Default', style: TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w700)),
                        )
                      : const Icon(Icons.chevron_right, color: AppTheme.textSub, size: 18),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed:  () => _showAddDialog(context, ref),
        icon:       const Icon(Icons.add, color: Colors.white),
        label:      const Text('Add Address', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context:            context,
      isScrollControlled: true,
      backgroundColor:    Colors.transparent,
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
  final _formKey   = GlobalKey<FormState>();
  final _line1     = TextEditingController();
  final _city      = TextEditingController();
  String _label    = 'Home';
  bool _isDefault  = false;
  bool _loading    = false;

  @override
  void dispose() { _line1.dispose(); _city.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await DioClient.instance.post(ApiEndpoints.myAddresses, data: {
        'label':     _label,
        'line1':     _line1.text,
        'city':      _city.text,
        'lat':       3.1390,
        'lng':       101.6869,
        'isDefault': _isDefault,
      });
      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } on DioException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:         Text(e.response?.data?['error'] ?? 'Failed to save'),
          backgroundColor: AppTheme.error,
          behavior:        SnackBarBehavior.floating,
          shape:           RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(24, 8, 24, MediaQuery.of(context).viewInsets.bottom + 28),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(color: AppTheme.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const Text('Add New Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),

            // Label chips
            const Text('Label', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textSub)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _addrLabels.map((l) {
                final selected = _label == l;
                return ChoiceChip(
                  label: Text(l),
                  selected: selected,
                  onSelected: (_) => setState(() => _label = l),
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : AppTheme.textMain,
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _line1,
              decoration: const InputDecoration(labelText: 'Street address', prefixIcon: Icon(Icons.streetview_outlined)),
              validator:  (v) => v!.isNotEmpty ? null : 'Required',
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _city,
              decoration: const InputDecoration(labelText: 'City', prefixIcon: Icon(Icons.location_city_outlined)),
              validator:  (v) => v!.isNotEmpty ? null : 'Required',
            ),
            const SizedBox(height: 4),
            SwitchListTile(
              value:         _isDefault,
              onChanged:     (v) => setState(() => _isDefault = v),
              title:         const Text('Set as default address', style: TextStyle(fontSize: 14)),
              activeColor:   AppTheme.primary,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loading ? null : _save,
              child: _loading
                  ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                  : const Text('Save Address'),
            ),
          ],
        ),
      ),
    );
  }
}
