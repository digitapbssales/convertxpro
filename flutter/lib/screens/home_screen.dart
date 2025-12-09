import 'package:flutter/material.dart';
import '../routes.dart';
import '../widgets/category_tile.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final tiles = [
      CategoryTile(label: 'Currency', icon: Icons.payments, route: '/convert', args: {'category': 'currency'}),
      CategoryTile(label: 'Length', icon: Icons.straighten, route: '/convert', args: {'category': 'length'}),
      CategoryTile(label: 'Area', icon: Icons.crop_square, route: '/convert', args: {'category': 'area'}),
      CategoryTile(label: 'Volume', icon: Icons.water_drop, route: '/convert', args: {'category': 'volume'}),
      CategoryTile(label: 'Weight', icon: Icons.balance, route: '/convert', args: {'category': 'weight'}),
      CategoryTile(label: 'Temperature', icon: Icons.thermostat, route: '/convert', args: {'category': 'temperature'}),
      CategoryTile(label: 'Time', icon: Icons.access_time, route: '/convert', args: {'category': 'time'}),
      CategoryTile(label: 'Speed', icon: Icons.speed, route: '/convert', args: {'category': 'speed'}),
      CategoryTile(label: 'Storage', icon: Icons.sd_storage, route: '/convert', args: {'category': 'storage'}),
      CategoryTile(label: 'Power', icon: Icons.electric_bolt, route: '/convert', args: {'category': 'power'}),
      CategoryTile(label: 'Pressure', icon: Icons.compress, route: '/convert', args: {'category': 'pressure'}),
      CategoryTile(label: 'Energy', icon: Icons.bolt, route: '/convert', args: {'category': 'energy'}),
      CategoryTile(label: 'Fuel Efficiency', icon: Icons.local_gas_station, route: '/convert', args: {'category': 'fuel'}),
      CategoryTile(label: 'Angle', icon: Icons.rotate_right, route: '/convert', args: {'category': 'angle'}),
      CategoryTile(label: 'Cooking', icon: Icons.kitchen, route: '/convert', args: {'category': 'cooking'}),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Universal Converter'), actions: [
        IconButton(onPressed: () => _router(context).go('/favorites'), icon: const Icon(Icons.star)),
        IconButton(onPressed: () => _router(context).go('/history'), icon: const Icon(Icons.history)),
        IconButton(onPressed: () => _router(context).go('/auth'), icon: const Icon(Icons.person)),
      ]),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        children: tiles,
      ),
    );
  }
  _AppRouterDelegate _router(BuildContext c) {
    final r = Router.of(c).routerDelegate;
    return r as _AppRouterDelegate;
  }
}
