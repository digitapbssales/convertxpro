import 'package:flutter/material.dart';
import '../services/supabase_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _svc = SupabaseService();
  List<Map<String, dynamic>> items = [];
  @override
  void initState() {
    super.initState();
    _load();
  }
  Future<void> _load() async {
    items = await _svc.loadHistory();
    setState(() {});
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (c, i) {
          final x = items[i];
          return ListTile(title: Text('${x['category']} ${x['from']}→${x['to']}'), subtitle: Text('${x['value']} = ${x['result']}'));
        },
      ),
    );
  }
}
