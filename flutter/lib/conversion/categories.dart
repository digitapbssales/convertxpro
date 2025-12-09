class Unit {
  final String key;
  final String label;
  const Unit(this.key, this.label);
}

class Category {
  final String key;
  final String label;
  final List<Unit> units;
  const Category(this.key, this.label, this.units);
}

final categories = <Category>[
  Category('currency', 'Currency', [
    Unit('USD', 'US Dollar'),
    Unit('EUR', 'Euro'),
    Unit('GBP', 'British Pound'),
    Unit('JPY', 'Japanese Yen'),
    Unit('INR', 'Indian Rupee'),
    Unit('BTC', 'Bitcoin'),
    Unit('ETH', 'Ethereum'),
    Unit('USDT', 'Tether'),
    Unit('SOL', 'Solana'),
    Unit('ADA', 'Cardano')
  ]),
  Category('length', 'Length', [
    Unit('m', 'Meter'), Unit('km', 'Kilometer'), Unit('mi', 'Mile'), Unit('yd', 'Yard'), Unit('ft', 'Foot'), Unit('in', 'Inch'), Unit('nmi', 'Nautical Mile'), Unit('ly', 'Light Year'), Unit('pc', 'Parsec')
  ]),
  Category('area', 'Area', [
    Unit('m2', 'Square Meter'), Unit('ft2', 'Square Foot'), Unit('acre', 'Acre'), Unit('ha', 'Hectare')
  ]),
  Category('volume', 'Volume', [
    Unit('l', 'Liter'), Unit('ml', 'Milliliter'), Unit('gal', 'Gallon'), Unit('m3', 'Cubic Meter'), Unit('oz', 'Ounce'), Unit('pt', 'Pint')
  ]),
  Category('weight', 'Weight', [
    Unit('g', 'Gram'), Unit('kg', 'Kilogram'), Unit('lb', 'Pound'), Unit('oz', 'Ounce'), Unit('t', 'Tonne'), Unit('ct', 'Carat')
  ]),
  Category('temperature', 'Temperature', [Unit('C', 'Celsius'), Unit('F', 'Fahrenheit'), Unit('K', 'Kelvin')]),
  Category('time', 'Time', [Unit('s', 'Second'), Unit('min', 'Minute'), Unit('h', 'Hour'), Unit('day', 'Day'), Unit('mon', 'Month'), Unit('yr', 'Year')]),
  Category('speed', 'Speed', [Unit('kmh', 'km/h'), Unit('mph', 'mph'), Unit('ms', 'm/s'), Unit('kn', 'Knots')]),
  Category('storage', 'Storage', [Unit('bit', 'Bit'), Unit('byte', 'Byte'), Unit('KB', 'Kilobyte'), Unit('MB', 'Megabyte'), Unit('GB', 'Gigabyte'), Unit('TB', 'Terabyte'), Unit('PB', 'Petabyte'), Unit('Mbps', 'Mbps'), Unit('MBps', 'MB/s')]),
  Category('power', 'Power', [Unit('W', 'Watt'), Unit('kW', 'Kilowatt'), Unit('hp', 'Horsepower')]),
  Category('pressure', 'Pressure', [Unit('Pa', 'Pascal'), Unit('bar', 'Bar'), Unit('PSI', 'PSI'), Unit('mmHg', 'mmHg')]),
  Category('energy', 'Energy', [Unit('J', 'Joule'), Unit('cal', 'Calorie'), Unit('kWh', 'kWh'), Unit('BTU', 'BTU')]),
  Category('fuel', 'Fuel Efficiency', [Unit('L100', 'L/100km'), Unit('kmL', 'km/l'), Unit('mpg', 'mpg')]),
  Category('angle', 'Angle', [Unit('deg', 'Degree'), Unit('rad', 'Radian'), Unit('grad', 'Gradian')]),
  Category('cooking', 'Cooking', [Unit('tsp', 'Teaspoon'), Unit('tbsp', 'Tablespoon'), Unit('ml', 'Milliliter'), Unit('cup', 'Cup'), Unit('g', 'Gram')]),
];
