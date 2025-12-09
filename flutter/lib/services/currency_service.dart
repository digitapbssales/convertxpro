import 'dart:convert';
import 'package:http/http.dart' as http;

class CurrencyService {
  DateTime? _lastCall;
  Future<Map<String, double>> fetchRates(String base, {int retries = 3}) async {
    // Simple rate-limit (5s)
    if (_lastCall != null && DateTime.now().difference(_lastCall!) < const Duration(seconds: 5)) {
      await Future.delayed(const Duration(milliseconds: 300));
    }
    _lastCall = DateTime.now();
    int attempt = 0;
    while (true) {
      try {
        final u = Uri.parse('https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID&base=$base');
        final r = await http.get(u);
        if (r.statusCode != 200) throw Exception('Failed');
        final j = json.decode(r.body) as Map<String, dynamic>;
        final rates = Map<String, double>.from(j['rates'].map((k, v) => MapEntry(k, (v as num).toDouble())));
        rates[base] = 1.0;
        return rates;
      } catch (e) {
        attempt++;
        if (attempt > retries) rethrow;
        final backoff = Duration(milliseconds: 400 * attempt);
        await Future.delayed(backoff);
      }
    }
  }
}
