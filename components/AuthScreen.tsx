import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

export default function AuthScreen() {
  const { login, register, t, serverOnline, accentColor, colors } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError(t.fillAll || "Lūdzu, aizpildiet visus laukus");
      return;
    }
    setLoading(true);
    const err = mode === 'login' 
      ? await login(username, password) 
      : await register(username, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView 
      style={[s.container, { backgroundColor: colors.bg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} bounces={false}>
        <View style={s.header}>
          <Text style={[s.logo, { color: accentColor }]}>🎵 SoundPulse</Text>
          <View style={s.statusRow}>
            <View style={[s.statusDot, { backgroundColor: serverOnline ? '#22c55e' : '#f59e0b' }]} />
            <Text style={[s.statusTxt, { color: colors.subText }]}>
              {serverOnline ? (t.serverReady || "Serveris gatavs") : (t.serverStarting || "Serveris mostas...")}
            </Text>
          </View>
        </View>

        <View style={[s.toggle, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={[s.toggleBtn, mode === 'login' && { backgroundColor: accentColor }]} 
            onPress={() => setMode('login')}
          >
            <Text style={[s.toggleTxt, mode === 'login' && { color: '#000' }]}>{t.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.toggleBtn, mode === 'register' && { backgroundColor: accentColor }]} 
            onPress={() => setMode('register')}
          >
            <Text style={[s.toggleTxt, mode === 'register' && { color: '#000' }]}>{t.register}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.form}>
          <View style={[s.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.subText} />
            <TextInput 
              style={[s.input, { color: colors.text }]} 
              placeholder={t.username} 
              placeholderTextColor={colors.subText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={[s.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.subText} />
            <TextInput 
              style={[s.input, { color: colors.text }]} 
              placeholder={t.password} 
              placeholderTextColor={colors.subText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={s.errorTxt}>{error}</Text> : null}

          <TouchableOpacity 
            style={[s.submitBtn, { backgroundColor: accentColor }]} 
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.submitBtnTxt}>{mode === 'login' ? t.login : t.register}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '600' },
  toggle: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  toggleTxt: { fontWeight: '800', fontSize: 14, color: '#666' },
  form: { gap: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 16, borderWidth: 1, gap: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, fontWeight: '600' },
  errorTxt: { color: '#ef4444', textAlign: 'center', fontWeight: '700', fontSize: 13 },
  submitBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, elevation: 4, shadowOpacity: 0.2, shadowRadius: 5 },
  submitBtnTxt: { color: '#000', fontWeight: '900', fontSize: 16 }
});