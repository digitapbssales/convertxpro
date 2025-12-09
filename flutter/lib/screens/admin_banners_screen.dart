import 'package:flutter/material.dart';
import '../services/banner_service.dart';

class AdminBannersScreen extends StatefulWidget {
  const AdminBannersScreen({super.key});
  @override
  State<AdminBannersScreen> createState() => _AdminBannersScreenState();
}

class _AdminBannersScreenState extends State<AdminBannersScreen> {
  final svc = BannerService();
  final title = TextEditingController();
  final message = TextEditingController();
  final link = TextEditingController();
  bool active = true;
  List<Map<String, dynamic>> items = [];
  @override
  void initState() {
    super.initState();
    _load();
  }
  Future<void> _load() async {
    items = await svc.loadActive();
    setState(() {});
  }
  Future<void> _create() async {
    await svc.supabase.from('banners').insert({ 'title': title.text, 'message': message.text, 'link_url': link.text, 'active': active });
    await _load();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Banners')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextFormField(controller: title, decoration: const InputDecoration(labelText: 'Title')),
          const SizedBox(height: 8),
          TextFormField(controller: message, decoration: const InputDecoration(labelText: 'Message')),
          const SizedBox(height: 8),
          TextFormField(controller: link, decoration: const InputDecoration(labelText: 'Link URL')),
          const SizedBox(height: 8),
          SwitchListTile(value: active, onChanged: (v) => setState(() => active = v), title: const Text('Active')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: _create, child: const Text('Create')),
          const SizedBox(height: 16),
          Expanded(child: ListView.builder(itemCount: items.length, itemBuilder: (c, i) {
            final x = items[i];
            return ListTile(title: Text(x['title'] ?? ''), subtitle: Text(x['message'] ?? ''));
          }))
        ]),
      ),
    );
  }
}
