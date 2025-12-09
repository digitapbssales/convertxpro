import 'package:hive_flutter/hive_flutter.dart';

class CacheService {
  static const ratesBox = 'rates';
  static const historyBox = 'history';
  static const favoritesBox = 'favorites';

  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(ratesBox);
    await Hive.openBox(historyBox);
    await Hive.openBox(favoritesBox);
  }

  Map<String, double>? getRates(String key, {Duration ttl = const Duration(minutes: 15)}) {
    final box = Hive.box(ratesBox);
    final m = box.get(key) as Map?;
    final t = box.get('$key:ts') as int?;
    if (m == null || t == null) return null;
    final fresh = DateTime.now().millisecondsSinceEpoch - t < ttl.inMilliseconds;
    if (!fresh) return null;
    return Map<String, double>.from(m.map((k, v) => MapEntry(k as String, (v as num).toDouble())));
  }

  Future<void> setRates(String key, Map<String, double> rates) async {
    final box = Hive.box(ratesBox);
    await box.put(key, rates);
    await box.put('$key:ts', DateTime.now().millisecondsSinceEpoch);
  }

  Future<void> addHistory(Map<String, dynamic> item) async {
    final box = Hive.box(historyBox);
    await box.add(item);
  }

  List<Map<String, dynamic>> loadHistory() {
    final box = Hive.box(historyBox);
    return List<Map<String, dynamic>>.from(box.values);
  }

  Future<void> addFavorite(Map<String, dynamic> item) async {
    final box = Hive.box(favoritesBox);
    await box.add(item);
  }

  List<Map<String, dynamic>> loadFavorites() {
    final box = Hive.box(favoritesBox);
    return List<Map<String, dynamic>>.from(box.values);
  }
}
