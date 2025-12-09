import 'package:supabase_flutter/supabase_flutter.dart';

class BannerService {
  final supabase = Supabase.instance.client;
  Future<List<Map<String, dynamic>>> loadActive() async {
    final res = await supabase.from('banners').select().eq('active', true).order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }
}
