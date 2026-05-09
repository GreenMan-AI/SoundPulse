import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from '../../components/AppContext';

interface Check { name: string; status: 'ok' | 'error' | 'loading'; detail?: string; }

export default function DiagScreen() {
  const { token, user, tracks } = useApp();
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const results: Check[] = [];

    // 1. Server health
    try {
      const r = await fetch(`${API}/api/health`);
      const d = await r.json();
      results.push({ name: 'Serveris', status: d.ok ? 'ok' : 'error', detail: d.time });
    } catch (e: any) { results.push({ name: 'Serveris', status: 'error', detail: e.message }); }

    // 2. Tracks
    try {
      const r = await fetch(`${API}/api/tracks`);
      const d = await r.json();
      const list = Array.isArray(d) ? d : (d.tracks || []);
      results.push({ name: 'Dziesmas', status: list.length > 0 ? 'ok' : 'error', detail: `${list.length} dziesmas` });
    } catch (e: any) { results.push({ name: 'Dziesmas', status: 'error', detail: e.message }); }

    // 3. Auth
    results.push({ name: 'Auth', status: user && token ? 'ok' : 'error', detail: user ? `@${user.username} (${user.role})` : 'Nav ielogojies' });

    // 4. Upload limits
    if (token) {
      try {
        const r = await fetch(`${API}/api/upload/limits`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        results.push({ name: 'Upload limits', status: d.remaining !== undefined ? 'ok' : 'error', detail: `${d.remaining}/${d.limit} atlikušas` });
      } catch (e: any) { results.push({ name: 'Upload limits', status: 'error', detail: e.message }); }
    }

    // 5. Ticker
    try {
      const r = await fetch(`${API}/api/ticker`);
      const d = await r.json();
      results.push({ name: 'Ticker', status: 'ok', detail: d.text || '(tukšs)' });
    } catch (e: any) { results.push({ name: 'Ticker', status: 'error', detail: e.message }); }

    setChecks(results);
    setRunning(false);
  };

  useEffect(() => { run(); }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={s.header}>
        <Text style={s.title}>🔧 Diagnostika</Text>
        <TouchableOpacity style={s.runBtn} onPress={run} disabled={running}>
          <Ionicons name={running ? 'reload' : 'play'} size={16} color="#000" />
          <Text style={s.runTxt}>{running ? 'Pārbauda...' : 'Palaist'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, gap: 8 }}>
        {checks.map((c, i) => (
          <View key={i} style={[s.check, { borderLeftColor: c.status === 'ok' ? '#22c55e' : '#ef4444' }]}>
            <Ionicons
              name={c.status === 'ok' ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={c.status === 'ok' ? '#5b9b73' : '#ef4444'}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.checkName}>{c.name}</Text>
              {c.detail && <Text style={s.checkDetail}>{c.detail}</Text>}
            </View>
          </View>
        ))}

        <View style={s.info}>
          <Text style={s.infoTxt}>API: {API}</Text>
          <Text style={s.infoTxt}>Tracks loaded: {tracks.length}</Text>
          <Text style={s.infoTxt}>User: {user?.username || 'none'}</Text>
          <Text style={s.infoTxt}>Role: {user?.role || 'none'}</Text>
          <Text style={s.infoTxt}>Token: {token ? '✅ ' + token.slice(0, 8) + '...' : '❌'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#111118' },
  title: { fontSize: 22, fontWeight: '800', color: '#00cfff' },
  runBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#00cfff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  runTxt: { color: '#000', fontWeight: '700', fontSize: 13 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111118', borderRadius: 12, padding: 14, borderLeftWidth: 3 },
  checkName: { color: '#ccc', fontSize: 14, fontWeight: '600' },
  checkDetail: { color: '#555', fontSize: 12, marginTop: 2 },
  info: { backgroundColor: '#111118', borderRadius: 12, padding: 14, marginTop: 8 },
  infoTxt: { color: '#555', fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
});
