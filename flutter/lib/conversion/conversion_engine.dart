import 'dart:math';

class ConversionEngine {
  double convert(String category, String from, String to, double value, {Map<String, double> liveRates = const {}}) {
    if (category == 'currency') {
      final f = liveRates[from];
      final t = liveRates[to];
      if (f == null || t == null) throw Exception('Rate missing');
      return value / f * t;
    }
    if (category == 'length') {
      final m = _lengthToMeters(from, value);
      return _metersTo(to, m);
    }
    if (category == 'area') {
      final m2 = _areaToM2(from, value);
      return _m2To(to, m2);
    }
    if (category == 'volume') {
      final l = _volumeToLiters(from, value);
      return _litersTo(to, l);
    }
    if (category == 'weight') {
      final g = _weightToGrams(from, value);
      return _gramsTo(to, g);
    }
    if (category == 'temperature') {
      return _temperatureConvert(from, to, value);
    }
    if (category == 'time') {
      final s = _timeToSeconds(from, value);
      return _secondsTo(to, s);
    }
    if (category == 'speed') {
      final ms = _speedToMS(from, value);
      return _msToSpeed(to, ms);
    }
    if (category == 'storage') {
      return _storageConvert(from, to, value);
    }
    if (category == 'power') {
      final w = _powerToWatt(from, value);
      return _wattTo(to, w);
    }
    if (category == 'pressure') {
      final pa = _pressureToPa(from, value);
      return _paTo(to, pa);
    }
    if (category == 'energy') {
      final j = _energyToJoule(from, value);
      return _jouleTo(to, j);
    }
    if (category == 'fuel') {
      return _fuelEfficiencyConvert(from, to, value);
    }
    if (category == 'angle') {
      return _angleConvert(from, to, value);
    }
    if (category == 'cooking') {
      return _cookingConvert(from, to, value);
    }
    throw Exception('Unsupported');
  }

  double _lengthToMeters(String u, double v) {
    switch (u) {
      case 'm': return v;
      case 'km': return v * 1000;
      case 'mi': return v * 1609.344;
      case 'yd': return v * 0.9144;
      case 'ft': return v * 0.3048;
      case 'in': return v * 0.0254;
      case 'nmi': return v * 1852;
      case 'ly': return v * 9.4607e15;
      case 'pc': return v * 3.0857e16;
    }
    throw Exception('Unit');
  }
  double _metersTo(String u, double m) {
    switch (u) {
      case 'm': return m;
      case 'km': return m / 1000;
      case 'mi': return m / 1609.344;
      case 'yd': return m / 0.9144;
      case 'ft': return m / 0.3048;
      case 'in': return m / 0.0254;
      case 'nmi': return m / 1852;
      case 'ly': return m / 9.4607e15;
      case 'pc': return m / 3.0857e16;
    }
    throw Exception('Unit');
  }

  double _areaToM2(String u, double v) {
    switch (u) {
      case 'm2': return v;
      case 'ft2': return v * 0.09290304;
      case 'acre': return v * 4046.8564224;
      case 'ha': return v * 10000;
    }
    throw Exception('Unit');
  }
  double _m2To(String u, double v) {
    switch (u) {
      case 'm2': return v;
      case 'ft2': return v / 0.09290304;
      case 'acre': return v / 4046.8564224;
      case 'ha': return v / 10000;
    }
    throw Exception('Unit');
  }

  double _volumeToLiters(String u, double v) {
    switch (u) {
      case 'l': return v;
      case 'ml': return v / 1000;
      case 'gal': return v * 3.785411784;
      case 'm3': return v * 1000;
      case 'oz': return v * 0.0295735296;
      case 'pt': return v * 0.473176473;
    }
    throw Exception('Unit');
  }
  double _litersTo(String u, double v) {
    switch (u) {
      case 'l': return v;
      case 'ml': return v * 1000;
      case 'gal': return v / 3.785411784;
      case 'm3': return v / 1000;
      case 'oz': return v / 0.0295735296;
      case 'pt': return v / 0.473176473;
    }
    throw Exception('Unit');
  }

  double _weightToGrams(String u, double v) {
    switch (u) {
      case 'g': return v;
      case 'kg': return v * 1000;
      case 'lb': return v * 453.59237;
      case 'oz': return v * 28.349523125;
      case 't': return v * 1e6;
      case 'ct': return v * 0.2;
    }
    throw Exception('Unit');
  }
  double _gramsTo(String u, double v) {
    switch (u) {
      case 'g': return v;
      case 'kg': return v / 1000;
      case 'lb': return v / 453.59237;
      case 'oz': return v / 28.349523125;
      case 't': return v / 1e6;
      case 'ct': return v / 0.2;
    }
    throw Exception('Unit');
  }

  double _temperatureConvert(String f, String t, double v) {
    double c;
    if (f == 'C') c = v;
    else if (f == 'F') c = (v - 32) * 5 / 9;
    else if (f == 'K') c = v - 273.15;
    else throw Exception('Unit');
    if (t == 'C') return c;
    if (t == 'F') return c * 9 / 5 + 32;
    if (t == 'K') return c + 273.15;
    throw Exception('Unit');
  }

  double _timeToSeconds(String u, double v) {
    switch (u) {
      case 's': return v;
      case 'min': return v * 60;
      case 'h': return v * 3600;
      case 'day': return v * 86400;
      case 'mon': return v * 2592000;
      case 'yr': return v * 31536000;
    }
    throw Exception('Unit');
  }
  double _secondsTo(String u, double v) {
    switch (u) {
      case 's': return v;
      case 'min': return v / 60;
      case 'h': return v / 3600;
      case 'day': return v / 86400;
      case 'mon': return v / 2592000;
      case 'yr': return v / 31536000;
    }
    throw Exception('Unit');
  }

  double _speedToMS(String u, double v) {
    switch (u) {
      case 'kmh': return v / 3.6;
      case 'mph': return v * 0.44704;
      case 'ms': return v;
      case 'kn': return v * 0.514444;
    }
    throw Exception('Unit');
  }
  double _msToSpeed(String u, double v) {
    switch (u) {
      case 'kmh': return v * 3.6;
      case 'mph': return v / 0.44704;
      case 'ms': return v;
      case 'kn': return v / 0.514444;
    }
    throw Exception('Unit');
  }

  double _storageConvert(String f, String t, double v) {
    double bits;
    if (f == 'bit') bits = v;
    else if (f == 'byte') bits = v * 8;
    else if (f == 'KB') bits = v * 8 * 1024;
    else if (f == 'MB') bits = v * 8 * pow(1024, 2);
    else if (f == 'GB') bits = v * 8 * pow(1024, 3);
    else if (f == 'TB') bits = v * 8 * pow(1024, 4);
    else if (f == 'PB') bits = v * 8 * pow(1024, 5);
    else if (f == 'Mbps') bits = v * 1e6;
    else if (f == 'MBps') bits = v * 8e6;
    else throw Exception('Unit');
    if (t == 'bit') return bits;
    if (t == 'byte') return bits / 8;
    if (t == 'KB') return bits / (8 * 1024);
    if (t == 'MB') return bits / (8 * pow(1024, 2));
    if (t == 'GB') return bits / (8 * pow(1024, 3));
    if (t == 'TB') return bits / (8 * pow(1024, 4));
    if (t == 'PB') return bits / (8 * pow(1024, 5));
    if (t == 'Mbps') return bits / 1e6;
    if (t == 'MBps') return bits / 8e6;
    throw Exception('Unit');
  }

  double _powerToWatt(String u, double v) {
    switch (u) {
      case 'W': return v;
      case 'kW': return v * 1000;
      case 'hp': return v * 745.699872;
    }
    throw Exception('Unit');
  }
  double _wattTo(String u, double v) {
    switch (u) {
      case 'W': return v;
      case 'kW': return v / 1000;
      case 'hp': return v / 745.699872;
    }
    throw Exception('Unit');
  }

  double _pressureToPa(String u, double v) {
    switch (u) {
      case 'Pa': return v;
      case 'bar': return v * 1e5;
      case 'PSI': return v * 6894.757293168;
      case 'mmHg': return v * 133.322387415;
    }
    throw Exception('Unit');
  }
  double _paTo(String u, double v) {
    switch (u) {
      case 'Pa': return v;
      case 'bar': return v / 1e5;
      case 'PSI': return v / 6894.757293168;
      case 'mmHg': return v / 133.322387415;
    }
    throw Exception('Unit');
  }

  double _energyToJoule(String u, double v) {
    switch (u) {
      case 'J': return v;
      case 'cal': return v * 4.184;
      case 'kWh': return v * 3.6e6;
      case 'BTU': return v * 1055.05585262;
    }
    throw Exception('Unit');
  }
  double _jouleTo(String u, double v) {
    switch (u) {
      case 'J': return v;
      case 'cal': return v / 4.184;
      case 'kWh': return v / 3.6e6;
      case 'BTU': return v / 1055.05585262;
    }
    throw Exception('Unit');
  }

  double _fuelEfficiencyConvert(String f, String t, double v) {
    double kmPerL;
    if (f == 'kmL') kmPerL = v;
    else if (f == 'mpg') kmPerL = v * 0.425143707;
    else if (f == 'L100') kmPerL = 100 / v;
    else throw Exception('Unit');
    if (t == 'kmL') return kmPerL;
    if (t == 'mpg') return kmPerL / 0.425143707;
    if (t == 'L100') return 100 / kmPerL;
    throw Exception('Unit');
  }

  double _angleConvert(String f, String t, double v) {
    double rad;
    if (f == 'deg') rad = v * pi / 180;
    else if (f == 'grad') rad = v * pi / 200;
    else if (f == 'rad') rad = v;
    else throw Exception('Unit');
    if (t == 'deg') return rad * 180 / pi;
    if (t == 'grad') return rad * 200 / pi;
    if (t == 'rad') return rad;
    throw Exception('Unit');
  }

  double _cookingConvert(String f, String t, double v) {
    Map<String, double> toMl = {
      'tsp': 4.92892,
      'tbsp': 14.7868,
      'ml': 1,
      'cup': 236.588,
      'g': 1,
    };
    if (!toMl.containsKey(f) || !toMl.containsKey(t)) throw Exception('Unit');
    double base;
    if (f == 'g') base = v;
    else base = v * toMl[f]!;
    if (t == 'g') return base;
    return base / toMl[t]!;
  }
}
