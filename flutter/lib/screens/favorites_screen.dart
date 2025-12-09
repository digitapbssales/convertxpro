import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../localization/app_localizations.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final _svc = SupabaseService();
  List<Map<String, dynamic>> items = [];
  @override
  void initState() {
    super.initState();
    _load();
  }
  Future<void> _load() async {
    items = await _svc.loadFavorites();
    setState(() {});
  }
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.t('favorites'))),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (c, i) {
          final x = items[i];
          return ListTile(title: Text('${x['category']} ${x['from']}→${x['to']}'));
        },
      ),
    );
  }
}
