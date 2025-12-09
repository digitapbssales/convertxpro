import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/conversion_screen.dart';
import 'screens/history_screen.dart';
import 'screens/favorites_screen.dart';
import 'screens/auth_screen.dart';

final appRouter = RouterConfig(
  routerDelegate: _delegate,
  backButtonDispatcher: RootBackButtonDispatcher(),
);

final _delegate = _AppRouterDelegate();

class _AppRouterDelegate extends RouterDelegate with ChangeNotifier, PopNavigatorRouterDelegateMixin {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  String _path = '/';
  Map<String, dynamic> _args = {};
  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: [
        const MaterialPage(child: HomeScreen()),
        if (_path == '/convert') MaterialPage(child: ConversionScreen(args: _args)),
        if (_path == '/history') const MaterialPage(child: HistoryScreen()),
        if (_path == '/favorites') const MaterialPage(child: FavoritesScreen()),
        if (_path == '/auth') const MaterialPage(child: AuthScreen()),
      ],
      onPopPage: (route, result) {
        if (!route.didPop(result)) return false;
        _path = '/';
        notifyListeners();
        return true;
      },
    );
  }
  @override
  Future<void> setNewRoutePath(configuration) async {}
  void go(String path, {Map<String, dynamic> args = const {}}) {
    _path = path;
    _args = args;
    notifyListeners();
  }
}
