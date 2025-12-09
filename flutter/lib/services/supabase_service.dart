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
    final uid = supabase.auth.currentUser?.id;
    if (uid == null) return;
    await supabase.from('conversion_history').insert({
      'user_id': uid,
      'category': data['category'],
      'from_unit': data['from'],
      'to_unit': data['to'],
      'value': data['value'],
      'result': data['result'],
    });
  }
  Future<List<Map<String, dynamic>>> loadHistory() async {
    final res = await supabase.from('conversion_history').select().order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }
  Future<void> toggleFavorite(Map<String, dynamic> data) async {
    final uid = supabase.auth.currentUser?.id;
    if (uid == null) return;
    await supabase.from('favorites').insert({
      'user_id': uid,
      'category': data['category'],
      'from_unit': data['from'],
      'to_unit': data['to'],
    }, onConflict: 'user_id,hash');
  }
  Future<List<Map<String, dynamic>>> loadFavorites() async {
    final res = await supabase.from('favorites').select().order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }
  Future<void> logEvent(String action, Map<String, dynamic> meta) async {
    final uid = supabase.auth.currentUser?.id;
    await supabase.from('audit_logs').insert({'user_id': uid, 'action': action, 'meta': meta});
  }
  Future<bool> isAdmin() async {
    final uid = supabase.auth.currentUser?.id;
    if (uid == null) return false;
    final res = await supabase.from('admins').select('user_id').eq('user_id', uid).limit(1);
    return (res is List && res.isNotEmpty);
  }
}
