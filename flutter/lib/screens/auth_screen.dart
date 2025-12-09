import 'package:flutter/material.dart';
import '../services/supabase_service.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _svc = SupabaseService();
  final _email = TextEditingController();
  final _pass = TextEditingController();
  String msg = '';
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign In')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 12),
          TextFormField(controller: _pass, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () async { try { await _svc.signInWithEmail(_email.text, _pass.text); setState(() { msg = 'Signed in'; }); } catch (e) { setState(() { msg = 'Error'; }); } }, child: const Text('Sign In')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () async { await _svc.signOut(); setState(() { msg = 'Signed out'; }); }, child: const Text('Sign Out')),
          const SizedBox(height: 12),
          Text(msg),
        ]),
      ),
    );
  }
}
