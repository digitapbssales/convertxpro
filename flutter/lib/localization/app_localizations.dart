import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;
  late Map<String, String> _map;
  AppLocalizations(this.locale);
  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }
  Future<bool> load() async {
    final data = await rootBundle.loadString('assets/i18n/${locale.languageCode}.json');
    final m = json.decode(data) as Map<String, dynamic>;
    _map = m.map((k, v) => MapEntry(k, (v as String))); 
    return true;
  }
  String t(String key) => _map[key] ?? key;
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();
  @override
  bool isSupported(Locale locale) => ['en','es','fr','de'].contains(locale.languageCode);
  @override
  Future<AppLocalizations> load(Locale locale) async {
    final l = AppLocalizations(locale);
    await l.load();
    return l;
  }
  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) => false;
}
