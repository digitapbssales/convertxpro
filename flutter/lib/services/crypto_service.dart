import 'dart:convert';
import 'package:http/http.dart' as http;

class CryptoService {
  DateTime? _lastCall;
  Map<String, String> _symbolToId = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'SOL': 'solana',
    'ADA': 'cardano',
  };

  Future<Map<String, double>> fetchRatesUSD(List<String> symbols, {int retries = 3}) async {
    if (_lastCall != null && DateTime.now().difference(_lastCall!) < const Duration(seconds: 3)) {
      await Future.delayed(const Duration(milliseconds: 200));
    }
    _lastCall = DateTime.now();
    final ids = symbols.where((s) => _symbolToId.containsKey(s)).map((s) => _symbolToId[s]!).toList();
    if (ids.isEmpty) return {'USD': 1.0};
    int attempt = 0;
    while (true) {
      try {
        final u = Uri.parse('https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd');
        final r = await http.get(u);
        if (r.statusCode != 200) throw Exception('Failed');
        final j = json.decode(r.body) as Map<String, dynamic>;
        final rates = <String, double>{};
        for (final entry in _symbolToId.entries) {
          if (!symbols.contains(entry.key)) continue;
          final obj = j[entry.value] as Map<String, dynamic>?;
          final priceUsd = (obj?['usd'] as num?)?.toDouble();
          if (priceUsd != null && priceUsd > 0) {
            rates[entry.key] = 1.0 / priceUsd; // coins per USD
          }
        }
        rates['USD'] = 1.0;
        return rates;
      } catch (e) {
        attempt++;
        if (attempt > retries) rethrow;
        await Future.delayed(Duration(milliseconds: 300 * attempt));
      }
    }
  }

  Future<Map<String, double>> fetchTopRatesUSD({int perPage = 50}) async {
    // Fetch top market cap coins and compute coins per USD
    final u = Uri.parse('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=$perPage&page=1&sparkline=false');
    final r = await http.get(u);
    if (r.statusCode != 200) throw Exception('Failed');
    final list = json.decode(r.body) as List<dynamic>;
    final rates = <String, double>{'USD': 1.0};
    for (final item in list) {
      final m = item as Map<String, dynamic>;
      final id = (m['id'] as String?) ?? '';
      final sym = ((m['symbol'] as String?) ?? '').toUpperCase();
      final price = (m['current_price'] as num?)?.toDouble();
      if (sym.isEmpty || price == null || price <= 0) continue;
      _symbolToId[sym] = id;
      rates[sym] = 1.0 / price;
    }
    return rates;
  }
}
