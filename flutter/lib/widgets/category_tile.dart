import 'package:flutter/material.dart';
import '../routes.dart';

class CategoryTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final String route;
  final Map<String, dynamic> args;
  const CategoryTile({super.key, required this.label, required this.icon, required this.route, required this.args});
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _router(context).go(route, args: args),
      child: Container(
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(.2))),
        padding: const EdgeInsets.all(16),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(icon, size: 32), const SizedBox(height: 8), Text(label)]),
      ),
    );
  }
  _AppRouterDelegate _router(BuildContext c) {
    final r = Router.of(c).routerDelegate;
    return r as _AppRouterDelegate;
  }
}
