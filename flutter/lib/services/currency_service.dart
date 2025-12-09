import 'dart:convert';
import 'package:http/http.dart' as http;
class CurrencyService {
  Future<Map<String, double>> fetchRates(String base) async {
    final u = Uri.parse('https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID&base=$base');
    final r = await http.get(u);
    if (r.statusCode != 200) throw Exception('Failed');
    final j = json.decode(r.body) as Map<String, dynamic>;
    final rates = Map<String, double>.from(j['rates'].map((k, v) => MapEntry(k, (v as num).toDouble())));
    rates[base] = 1.0;
    return rates;
  }
}
