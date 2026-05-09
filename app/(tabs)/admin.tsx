import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp, API } from '../../components/AppContext';

export default function AdminScreen() {
  const { user, token, tracks, setTracks, t, banner, setBanner } = useApp();
  const [tab, setTab] = useState('upload');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [limits, setLimits] = useState<any>(null);
  const [tickerText, setTickerText] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    loadLimits();
    loadStats();
    if (tab === 'users') loadUsers();
    if (tab === 'comments') loadComments();
  }, [tab]);

  const loadComments = async () => {
    try {
      const r = await fetch(`${API}/api/comments/all`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setComments(Array.isArray(d) ? d : []);
    } catch {}
  };

  const deleteComment = async (id: string) => {
    Alert.alert('Dzēst komentāru?', '', [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API}/api/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          setComments(prev => prev.filter((c: any) => c._id !== id));
        } catch {}
      }},
    ]);
  };

  const loadLimits = async () => {
    try {
      const r = await fetch(`${API}/api/upload/limits`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setLimits(d);
    } catch {}
  };

  const loadStats = async () => {
    try {
      const r = await fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setStats(d);
    } catch {}
  };

  const loadUsers = async () => {
    try {
      const r = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setUsers(d.users || []);
    } catch {}
  };

  const pickFile = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/*'],
        copyToCacheDirectory: true,
      });
      if (!r.canceled && r.assets?.[0]) {
        setFile(r.assets[0]);
        if (!title) setTitle(r.assets[0].name?.replace(/\.[^/.]+$/, '') || '');
      }
    } catch (e: any) { Alert.alert(t.error, e.message); }
  };

  const doUpload = async () => {
    if (!file) { setUploadStatus('❌ Izvēlies failu!'); return; }
    if (!title.trim()) { setUploadStatus('❌ Ievadi nosaukumu!'); return; }
    if (limits?.remaining === 0) { Alert.alert('Limits!', `Dienas limits sasniegts (${limits.limit}/dienā)`); return; }

    setUploading(true);
    setUploadStatus('⏳ Augšupielādē...');
    try {
      const form = new FormData();
      form.append('audio', { uri: file.uri, type: file.mimeType || 'audio/mpeg', name: file.name || 'track.mp3' } as any);
      form.append('title', title.trim());
      form.append('artist', artist.trim() || 'Nezināms');

      const r = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const d = await r.json();

      if (d.track || d._id) {
        setUploadStatus(`✅ "${title}" augšupielādēts!`);
        setTitle(''); setArtist(''); setFile(null);
        // Reload tracks
        const tr = await fetch(`${API}/api/tracks`);
        const td = await tr.json();
        setTracks(Array.isArray(td) ? td : (td.tracks || []));
        await loadLimits();
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setUploadStatus(`❌ ${d.error || 'Kļūda'}`);
      }
    } catch (e: any) {
      setUploadStatus(`❌ ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteTrack = async (id: string, trackTitle: string) => {
    Alert.alert(t.delete + '?', trackTitle, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API}/api/tracks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          setTracks(tracks.filter((tr: any) => tr._id !== id));
        } catch (e: any) { Alert.alert(t.error, e.message); }
      }},
    ]);
  };

  const saveTicker = async () => {
    try {
      if (tickerText.trim()) {
        await fetch(`${API}/api/admin/ticker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: tickerText.trim() }),
        });
        setBanner(tickerText.trim());
        Alert.alert('✅', t.bannerActivated);
      } else {
        await fetch(`${API}/api/admin/ticker`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setBanner('');
        Alert.alert('✅', t.bannerDeactivated);
      }
    } catch (e: any) { Alert.alert(t.error, e.message); }
  };

  if (!user?.isAdmin) return (
    <View style={s.center}>
      <Ionicons name="lock-closed" size={48} color="#333" />
      <Text style={s.noAccess}>Tikai adminiem</Text>
    </View>
  );

  const TABS = [
    { id: 'upload',   label: '☁️ Upload' },
    { id: 'tracks',   label: '🎵 Dziesmas' },
    { id: 'ticker',   label: '📢 Banner' },
    { id: 'users',    label: '👥 Lietotāji' },
    { id: 'comments', label: '💬 Komentāri' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>⭐ Admin</Text>
        {stats && <Text style={s.stat}>{stats.tracks} dziesmas • {stats.users} lietotāji</Text>}
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={{ gap: 8, padding: 10 }}>
        {TABS.map(tb => (
          <TouchableOpacity key={tb.id} style={[s.tabBtn, tab === tb.id && s.tabBtnActive]} onPress={() => setTab(tb.id)}>
            <Text style={[s.tabTxt, tab === tb.id && s.tabTxtActive]}>{tb.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* === UPLOAD === */}
        {tab === 'upload' && (
          <View style={{ gap: 12 }}>
            {limits && (
              <View style={s.limitsCard}>
                <Text style={s.limitsTitle}>📊 Augšupielāžu limits</Text>
                <Text style={s.limitsDetail}>
                  {limits.used || 0}/{limits.limit} šodien • Max {limits.maxSizeMB}MB • Max {limits.maxDurationMin} min
                </Text>
                <View style={s.limitsBar}>
                  <View style={[s.limitsFill, { width: `${((limits.used||0)/limits.limit)*100}%` as any }]} />
                </View>
              </View>
            )}

            <Text style={s.label}>{t.uploadTitle} *</Text>
            <TextInput style={s.input} placeholder={t.uploadTitlePh} placeholderTextColor="#333" value={title} onChangeText={setTitle} />

            <Text style={s.label}>{t.uploadArtist}</Text>
            <TextInput style={s.input} placeholder={t.uploadArtistPh} placeholderTextColor="#333" value={artist} onChangeText={setArtist} />

            <TouchableOpacity style={[s.fileBtn, file && s.fileBtnActive]} onPress={pickFile}>
              <Ionicons name={file ? 'musical-note' : 'cloud-upload-outline'} size={28} color={file ? '#5caec0' : '#444'} />
              <Text style={[s.fileTxt, file && { color: '#00cfff' }]}>
                {file ? file.name : t.uploadNote}
              </Text>
              <Text style={s.fileHint}>MP3, WAV, M4A • max {limits?.maxSizeMB || 25}MB • max {limits?.maxDurationMin || 6} min</Text>
            </TouchableOpacity>

            {!!uploadStatus && (
              <Text style={[s.status, { color: uploadStatus.startsWith('✅') ? '#46ad6c' : uploadStatus.startsWith('⏳') ? '#00cfff' : '#ef4444' }]}>
                {uploadStatus}
              </Text>
            )}

            <TouchableOpacity
              style={[s.uploadBtn, (uploading || !file) && { opacity: 0.5 }]}
              onPress={doUpload}
              disabled={uploading || !file}
            >
              {uploading ? <ActivityIndicator color="#000" /> : <Ionicons name="cloud-upload" size={20} color="#000" />}
              <Text style={s.uploadTxt}>{uploading ? t.loading : t.upload}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === TRACKS === */}
        {tab === 'tracks' && (
          <View style={{ gap: 6 }}>
            <Text style={s.sectionTitle}>🎵 {tracks.length} dziesmas</Text>
            {tracks.map((tr: any, i: number) => (
              <View key={tr._id} style={s.trackRow}>
                <Text style={s.trackNum}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.trackTitle} numberOfLines={1}>{tr.title}</Text>
                  <Text style={s.trackArtist} numberOfLines={1}>{tr.artist || '—'}</Text>
                </View>
                <Text style={s.trackPlays}>{tr.plays || 0}▶</Text>
                <TouchableOpacity onPress={() => deleteTrack(tr._id, tr.title)} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#b9314a88" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* === TICKER/BANNER === */}
        {tab === 'ticker' && (
          <View style={{ gap: 12 }}>
            <Text style={s.sectionTitle}>📢 {t.bannerTitle}</Text>
            <Text style={s.hint}>{t.bannerHint}</Text>
            <Text style={s.label}>Pašreizējais banner:</Text>
            <Text style={[s.currentBanner, !banner && { color: '#333' }]}>{banner || t.bannerInactive}</Text>
            <TextInput
              style={[s.input, { minHeight: 80 }]}
              placeholder={t.bannerPlaceholder}
              placeholderTextColor="#333"
              value={tickerText}
              onChangeText={setTickerText}
              multiline
            />
            <TouchableOpacity style={s.uploadBtn} onPress={saveTicker}>
              <Ionicons name={tickerText.trim() ? 'megaphone' : 'close-circle'} size={18} color="#000" />
              <Text style={s.uploadTxt}>{tickerText.trim() ? '▶ Ieslēgt' : '✕ Izslēgt'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === USERS === */}
        {tab === 'users' && (
          <View style={{ gap: 6 }}>
            <Text style={s.sectionTitle}>👥 {users.length} lietotāji</Text>
            {users.map((u: any) => (
              <View key={u._id || u.username} style={s.userRow}>
                <View style={[s.userDot, { backgroundColor: u.role === 'admin' ? '#297e9d' : '#161717' }]} />
                <Text style={s.userName}>{u.username}</Text>
                <Text style={[s.userRole, { color: u.role === 'admin' ? '#952c85' : '#555' }]}>{u.role}</Text>
              </View>
            ))}
          </View>
        )}

        {/* === KOMENTĀRI === */}
        {tab === 'comments' && (
          <View style={{ gap: 6 }}>
            <Text style={s.sectionTitle}>💬 {comments.length} komentāri</Text>
            {comments.length === 0 && (
              <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                Nav komentāru
              </Text>
            )}
            {comments.map((c: any) => (
              <View key={c._id} style={s.trackRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.trackTitle} numberOfLines={1}>
                    <Text style={{ color: '#00cfff' }}>{c.username}</Text>
                    {' → '}{c.trackId?.title || 'dziesma'}
                  </Text>
                  <Text style={s.trackArtist} numberOfLines={2}>{c.text}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteComment(c._id)} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#ff446688" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f', gap: 12 },
  noAccess: { color: '#333', fontSize: 16 },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#111118', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 22, fontWeight: '800', color: '#498e43' },
  stat: { color: '#555', fontSize: 12 },
  tabBar: { backgroundColor: '#111118', borderBottomWidth: 1, borderBottomColor: '#1a1a25' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a25' },
  tabBtnActive: { backgroundColor: '#00cfff' },
  tabTxt: { color: '#555', fontWeight: '700', fontSize: 13 },
  tabTxtActive: { color: '#000' },
  limitsCard: { backgroundColor: '#111118', borderRadius: 14, padding: 14, gap: 6 },
  limitsTitle: { color: '#ccc', fontSize: 13, fontWeight: '700' },
  limitsDetail: { color: '#555', fontSize: 12 },
  limitsBar: { height: 4, backgroundColor: '#1a1a25', borderRadius: 2, overflow: 'hidden' },
  limitsFill: { height: 4, backgroundColor: '#00cfff', borderRadius: 2 },
  label: { color: '#555', fontSize: 12, fontWeight: '600', marginBottom: -6 },
  input: { backgroundColor: '#111118', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1e1e2a' },
  fileBtn: { backgroundColor: '#111118', borderRadius: 14, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#1e1e2a', borderStyle: 'dashed' },
  fileBtnActive: { borderColor: '#00cfff44', backgroundColor: '#00cfff08' },
  fileTxt: { color: '#444', fontSize: 13, textAlign: 'center' },
  fileHint: { color: '#333', fontSize: 11 },
  status: { textAlign: 'center', fontWeight: '600', fontSize: 13 },
  uploadBtn: { backgroundColor: '#00cfff', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  uploadTxt: { color: '#000', fontWeight: '800', fontSize: 15 },
  sectionTitle: { color: '#ccc', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 10, padding: 10, gap: 10 },
  trackNum: { color: '#333', fontSize: 11, width: 20 },
  trackTitle: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  trackArtist: { color: '#444', fontSize: 11, marginTop: 1 },
  trackPlays: { color: '#333', fontSize: 11 },
  hint: { color: '#444', fontSize: 12 },
  currentBanner: { color: '#00cfff', fontSize: 13, fontWeight: '600', fontStyle: 'italic' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 10, padding: 12, gap: 10 },
  userDot: { width: 8, height: 8, borderRadius: 4 },
  userName: { flex: 1, color: '#ccc', fontSize: 13, fontWeight: '600' },
  userRole: { fontSize: 11, fontWeight: '700' },
});
