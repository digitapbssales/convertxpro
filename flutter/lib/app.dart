import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'localization/app_localizations.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'routes.dart';

class UniversalConverterApp extends StatefulWidget {
  const UniversalConverterApp({super.key});
  @override
  State<UniversalConverterApp> createState() => _UniversalConverterAppState();
}

class _UniversalConverterAppState extends State<UniversalConverterApp> {
  @override
  void initState() {
    super.initState();
    Supabase.initialize(url: 'https://YOUR_PROJECT.supabase.co', anonKey: 'YOUR_ANON_KEY');
  }
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Universal Converter',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, brightness: Brightness.light, useMaterial3: true),
      darkTheme: ThemeData(colorSchemeSeed: Colors.indigo, brightness: Brightness.dark, useMaterial3: true),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        AppLocalizationsDelegate(),
      ],
      supportedLocales: const [Locale('en'), Locale('es'), Locale('fr'), Locale('de')],
      routerConfig: appRouter,
    );
  }
}
