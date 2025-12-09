import 'package:supabase_flutter/supabase_flutter.dart';
class SupabaseService {
  final supabase = Supabase.instance.client;
  Future<void> signInWithEmail(String email, String password) async {
    await supabase.auth.signInWithPassword(email: email, password: password);
  }
  Future<void> signOut() async {
    await supabase.auth.signOut();
  }
  Future<void> saveHistory(Map<String, dynamic> data) async {
    await supabase.from('conversion_history').insert(data);
  }
  Future<List<Map<String, dynamic>>> loadHistory() async {
    final res = await supabase.from('conversion_history').select().order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }
  Future<void> toggleFavorite(Map<String, dynamic> data) async {
    await supabase.from('favorites').insert(data, onConflict: 'user_id,hash');
  }
  Future<List<Map<String, dynamic>>> loadFavorites() async {
    final res = await supabase.from('favorites').select().order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }
}
