import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';
import { Lang } from '../i18n';

const LANGS = [
  { code: 'lv' as Lang, flag: '🇱🇻' },
  { code: 'en' as Lang, flag: '🇬🇧' },
  { code: 'ru' as Lang, flag: '🇷🇺' },
];

export default function AuthScreen() {
  const { login, register, t, lang, setLang, setLangChosen, serverOnline } = useApp();
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const strength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  };

  const COLORS = ['#222', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
  const LABELS = ['', t.pwWeak, t.pwMedium, t.pwGood, t.pwStrong];

  const submit = async () => {
    setError('');
    if (!username.trim() || !password) { setError(t.fillAll); return; }
    if (mode === 'register' && password !== confirmPw) { setError(t.pwNoMatch); return; }
    setLoading(true);
    const err = mode === 'login'
      ? await login(username.trim(), password)
      : await register(username.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity key={l.code} style={[s.langBtn, lang === l.code && s.langActive]} onPress={() => setLang(l.code)}>
              <Text style={{ fontSize: 20 }}>{l.flag}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.langBtn} onPress={() => setLangChosen(false)}>
            <Ionicons name="globe-outline" size={20} color="#00cfff" />
          </TouchableOpacity>
        </View>
        <Text style={s.logo}>🎵 SoundPulse</Text>
        {!serverOnline && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <ActivityIndicator size="small" color="#00cfff44" />
            <Text style={{ color: '#00cfff66', fontSize: 11 }}>Serveris palaižas... (~30s)</Text>
          </View>
        )}
        <Text style={s.sub}>{mode === 'login' ? t.welcomeBack : t.createAccount}</Text>
        <View style={s.toggle}>
          <TouchableOpacity style={[s.toggleBtn, mode === 'login' && s.toggleActive]} onPress={() => { setMode('login'); setError(''); setConfirmPw(''); }}>
            <Text style={[s.toggleTxt, mode === 'login' && s.toggleTxtActive]}>{t.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, mode === 'register' && s.toggleActive]} onPress={() => { setMode('register'); setError(''); }}>
            <Text style={[s.toggleTxt, mode === 'register' && s.toggleTxtActive]}>{t.register}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.inputWrap}>
          <Ionicons name="person-outline" size={18} color="#444" style={{ marginRight: 10 }} />
          <TextInput style={s.input} placeholder={t.username} placeholderTextColor="#333" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
        </View>
        <View style={s.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color="#444" style={{ marginRight: 10 }} />
          <TextInput style={[s.input, { flex: 1 }]} placeholder={t.password} placeholderTextColor="#333" value={password} onChangeText={setPassword} secureTextEntry={!showPw} autoCapitalize="none" />
          <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ padding: 4 }}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color="#444" />
          </TouchableOpacity>
        </View>
        {mode === 'register' && password.length > 0 && (
          <View style={s.strengthRow}>
            <View style={s.strengthBars}>
              {[1,2,3,4].map(i => <View key={i} style={[s.bar, { backgroundColor: i <= strength() ? COLORS[strength()] : '#1a1a25' }]} />)}
            </View>
            <Text style={[s.strengthLbl, { color: COLORS[strength()] }]}>{LABELS[strength()]}</Text>
          </View>
        )}
        {mode === 'register' && (
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#444" style={{ marginRight: 10 }} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder={t.repPw || 'Atkārtot paroli'} placeholderTextColor="#333" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={!showPw} autoCapitalize="none" />
          </View>
        )}
        {!!error && <Text style={s.error}>{error}</Text>}
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={s.btnTxt}>{loading ? '...' : mode === 'login' ? t.login : t.register}</Text>
        </TouchableOpacity>
        {mode === 'register' && <Text style={s.hint}>{t.passMin}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 28 },
  langBtn: { padding: 7, borderRadius: 8, backgroundColor: '#111118', borderWidth: 1, borderColor: '#1e1e2a' },
  langActive: { borderColor: '#00cfff' },
  logo: { fontSize: 32, fontWeight: '900', color: '#00cfff', textAlign: 'center', marginBottom: 6 },
  sub: { color: '#444', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  toggle: { flexDirection: 'row', backgroundColor: '#111118', borderRadius: 14, marginBottom: 22, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  toggleActive: { backgroundColor: '#00cfff' },
  toggleTxt: { color: '#444', fontWeight: '700', fontSize: 14 },
  toggleTxtActive: { color: '#000' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12, borderWidth: 1, borderColor: '#1e1e2a' },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: -4 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLbl: { fontSize: 11, fontWeight: '700', width: 50 },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: '#00cfff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#000', fontSize: 16, fontWeight: '800' },
  hint: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 12 },
});
