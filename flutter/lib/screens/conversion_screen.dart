import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../conversion/conversion_engine.dart';
import '../conversion/categories.dart';
import '../services/currency_service.dart';
import '../services/crypto_service.dart';
import '../services/supabase_service.dart';

final _engine = ConversionEngine();
final _currency = CurrencyService();
final _crypto = CryptoService();
final _supabase = SupabaseService();

class ConversionScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> args;
  const ConversionScreen({super.key, required this.args});
  @override
  ConsumerState<ConversionScreen> createState() => _ConversionScreenState();
}

class _ConversionScreenState extends ConsumerState<ConversionScreen> {
  String fromUnit = '';
  String toUnit = '';
  double value = 0;
  double result = 0;
  Map<String, double> rates = {};
  @override
  void initState() {
    super.initState();
    final cat = widget.args['category'] as String? ?? 'length';
    final c = categories.firstWhere((x) => x.key == cat);
    fromUnit = c.units.first.key;
    toUnit = c.units.last.key;
    _refreshRatesIfNeeded(cat);
  }
  Future<void> _refreshRatesIfNeeded(String cat) async {
    if (cat == 'currency') {
      final fiat = await _currency.fetchRates('USD');
      final symbols = ['BTC','ETH','USDT','SOL','ADA'];
      final crypto = await _crypto.fetchRatesUSD(symbols);
      rates = {...fiat, ...crypto};
      setState(() {});
    }
  }
  void _convert(String cat) {
    result = _engine.convert(cat, fromUnit, toUnit, value, liveRates: rates);
    setState(() {});
    _supabase.saveHistory({
      'category': cat,
      'from': fromUnit,
      'to': toUnit,
      'value': value,
      'result': result,
    });
  }
  @override
  Widget build(BuildContext context) {
    final cat = widget.args['category'] as String? ?? 'length';
    final c = categories.firstWhere((x) => x.key == cat);
    return Scaffold(
      appBar: AppBar(title: Text(c.label)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Row(children: [
            Expanded(child: DropdownButtonFormField<String>(value: fromUnit, items: c.units.map((u) => DropdownMenuItem(value: u.key, child: Text(u.label))).toList(), onChanged: (v) { fromUnit = v ?? fromUnit; setState(() {}); })),
            const SizedBox(width: 12),
            IconButton(onPressed: () { final t = fromUnit; fromUnit = toUnit; toUnit = t; setState(() {}); }, icon: const Icon(Icons.swap_horiz)),
            const SizedBox(width: 12),
            Expanded(child: DropdownButtonFormField<String>(value: toUnit, items: c.units.map((u) => DropdownMenuItem(value: u.key, child: Text(u.label))).toList(), onChanged: (v) { toUnit = v ?? toUnit; setState(() {}); })),
          ]),
          const SizedBox(height: 12),
          TextFormField(keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Value'), onChanged: (s) { value = double.tryParse(s) ?? 0; }),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () => _convert(cat), child: const Text('Convert')),
          const SizedBox(height: 12),
          Text(result.toStringAsFixed(6)),
          const SizedBox(height: 12),
          Row(children: [
            OutlinedButton(onPressed: () => _supabase.toggleFavorite({'category': cat, 'from': fromUnit, 'to': toUnit}), child: const Text('Favorite')),
            const SizedBox(width: 12),
            if (cat == 'currency') OutlinedButton(onPressed: () => _refreshRatesIfNeeded(cat), child: const Text('Refresh Rates')),
          ])
        ]),
      ),
    );
  }
}
