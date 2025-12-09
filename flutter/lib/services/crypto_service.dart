import 'dart:convert';
import 'package:http/http.dart' as http;

class CryptoService {
  static const Map<String, String> _ids = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'SOL': 'solana',
    'ADA': 'cardano',
  };

  Future<Map<String, double>> fetchRatesUSD(List<String> symbols) async {
    final ids = symbols.where((s) => _ids.containsKey(s)).map((s) => _ids[s]!).toList();
    if (ids.isEmpty) return {'USD': 1.0};
    final u = Uri.parse('https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd');
    final r = await http.get(u);
    if (r.statusCode != 200) throw Exception('Failed');
    final j = json.decode(r.body) as Map<String, dynamic>;
    final rates = <String, double>{};
    for (final entry in _ids.entries) {
      if (!symbols.contains(entry.key)) continue;
      final obj = j[entry.value] as Map<String, dynamic>?;
      final priceUsd = (obj?['usd'] as num?)?.toDouble();
      if (priceUsd != null && priceUsd > 0) {
        rates[entry.key] = 1.0 / priceUsd; // coins per USD
      }
    }
    rates['USD'] = 1.0;
    return rates;
  }
}
