import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp, API } from '../../components/AppContext';

export default function UploadScreen() {
  const { user, token, tracks, setTracks, t } = useApp();

  const [title, setTitle]               = useState('');
  const [artist, setArtist]             = useState('');
  const [file, setFile]                 = useState<any>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [limits, setLimits]             = useState<any>(null);
  const [myTracks, setMyTracks]         = useState<any[]>([]);

  // Ielādē limitus un lietotāja dziesmas
  useEffect(() => {
    if (token) {
      loadLimits();
      loadMyTracks();
    }
  }, [token]);

  const loadLimits = async () => {
    try {
      const r = await fetch(`${API}/api/upload/limits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setLimits(d);
    } catch {}
  };

  const loadMyTracks = async () => {
    try {
      const r = await fetch(`${API}/api/tracks`);
      const d = await r.json();
      const all = Array.isArray(d) ? d : (d.tracks || []);
      // Rāda tikai šī lietotāja augšupielādētās dziesmas
      setMyTracks(all.filter((tr: any) => tr.uploader === user?.username));
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
    } catch (e: any) {
      Alert.alert(t.error, e.message);
    }
  };

  const doUpload = async () => {
    if (!file)         { setUploadStatus('❌ Izvēlies failu!'); return; }
    if (!title.trim()) { setUploadStatus('❌ Ievadi nosaukumu!'); return; }
    if (limits?.remaining === 0) {
      Alert.alert('Limits!', `Dienas limits sasniegts (${limits.limit}/dienā)`);
      return;
    }

    setUploading(true);
    setUploadStatus('⏳ Augšupielādē...');

    try {
      const form = new FormData();
      form.append('audio', {
        uri:  file.uri,
        type: file.mimeType || 'audio/mpeg',
        name: file.name || 'track.mp3',
      } as any);
      form.append('title', title.trim());
      form.append('artist', artist.trim() || '');

      const r = await fetch(`${API}/api/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });
      const d = await r.json();

      if (d.track || d._id) {
        setUploadStatus(`✅ "${title}" veiksmīgi augšupielādēts!`);
        setTitle('');
        setArtist('');
        setFile(null);
        // Atjaunina dziesmu sarakstu
        const tr = await fetch(`${API}/api/tracks`);
        const td = await tr.json();
        setTracks(Array.isArray(td) ? td : (td.tracks || []));
        await loadLimits();
        await loadMyTracks();
        setTimeout(() => setUploadStatus(''), 4000);
      } else {
        setUploadStatus(`❌ ${d.error || 'Kļūda augšupielādē'}`);
      }
    } catch (e: any) {
      setUploadStatus(`❌ ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteMyTrack = async (id: string, trackTitle: string) => {
    Alert.alert('Dzēst?', `"${trackTitle}"`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API}/api/tracks/${id}`, {
              method:  'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            setTracks(tracks.filter((tr: any) => tr._id !== id));
            setMyTracks(myTracks.filter((tr: any) => tr._id !== id));
          } catch (e: any) {
            Alert.alert(t.error, e.message);
          }
        },
      },
    ]);
  };

  const usedPercent = limits
    ? Math.min(((limits.used || 0) / limits.limit) * 100, 100)
    : 0;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>☁️ {t.upload ?? 'Augšupielādēt'}</Text>
        <Text style={s.subtitle}>Pievieno savas dziesmas</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Limitu karte */}
        {limits && (
          <View style={s.limitsCard}>
            <View style={s.limitsRow}>
              <Text style={s.limitsTitle}>📊 Dienas limits</Text>
              <Text style={s.limitsCount}>
                {limits.used || 0} / {limits.limit}
              </Text>
            </View>
            <Text style={s.limitsDetail}>
              Max {limits.maxSizeMB}MB faila izmērs  •  Max {limits.maxDurationMin} min garums
            </Text>
            <View style={s.limitsBar}>
              <View style={[s.limitsFill, {
                width: `${usedPercent}%` as any,
                backgroundColor: usedPercent > 80 ? '#ef4444' : '#00cfff',
              }]} />
            </View>
            {limits.remaining === 0 && (
              <Text style={s.limitWarning}>⚠️ Šodienas limits sasniegts. Mēģini rīt!</Text>
            )}
          </View>
        )}

        {/* Nosaukums */}
        <Text style={s.label}>Dziesmas nosaukums *</Text>
        <TextInput
          style={s.input}
          placeholder="Ievadi nosaukumu..."
          placeholderTextColor="#333"
          value={title}
          onChangeText={setTitle}
        />

        {/* Izpildītājs */}
        <Text style={s.label}>Izpildītājs</Text>
        <TextInput
          style={s.input}
          placeholder="Ievadi izpildītāju..."
          placeholderTextColor="#333"
          value={artist}
          onChangeText={setArtist}
        />

        {/* Faila izvēle */}
        <TouchableOpacity
          style={[s.fileBtn, file && s.fileBtnActive]}
          onPress={pickFile}
        >
          <Ionicons
            name={file ? 'musical-note' : 'cloud-upload-outline'}
            size={32}
            color={file ? '#00cfff' : '#444'}
          />
          <Text style={[s.fileTxt, file && { color: '#00cfff' }]}>
            {file ? file.name : 'Nospied lai izvēlētos audio failu'}
          </Text>
          <Text style={s.fileHint}>
            MP3, WAV, M4A  •  max {limits?.maxSizeMB ?? 25}MB  •  max {limits?.maxDurationMin ?? 6} min
          </Text>
        </TouchableOpacity>

        {/* Statusa ziņa */}
        {!!uploadStatus && (
          <Text style={[
            s.status,
            {
              color: uploadStatus.startsWith('✅') ? '#22c55e'
                   : uploadStatus.startsWith('⏳') ? '#00cfff'
                   : '#ef4444',
            },
          ]}>
            {uploadStatus}
          </Text>
        )}

        {/* Augšupielādes poga */}
        <TouchableOpacity
          style={[s.uploadBtn, (uploading || !file || limits?.remaining === 0) && { opacity: 0.45 }]}
          onPress={doUpload}
          disabled={uploading || !file || limits?.remaining === 0}
        >
          {uploading
            ? <ActivityIndicator color="#000" />
            : <Ionicons name="cloud-upload" size={20} color="#000" />}
          <Text style={s.uploadTxt}>
            {uploading ? 'Augšupielādē...' : 'Augšupielādēt'}
          </Text>
        </TouchableOpacity>

        {/* Manas dziesmas */}
        {myTracks.length > 0 && (
          <View style={s.mySection}>
            <Text style={s.sectionTitle}>🎵 Manas dziesmas ({myTracks.length})</Text>
            {myTracks.map((tr: any, i: number) => (
              <View key={tr._id} style={s.trackRow}>
                <Text style={s.trackNum}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.trackTitle} numberOfLines={1}>{tr.title}</Text>
                  <Text style={s.trackArtist} numberOfLines={1}>
                    {tr.artist || '—'}  •  {tr.plays || 0} atskaņojumi
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteMyTrack(tr._id, tr.title)}
                  style={s.deleteBtn}
                >
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
  container:   { flex: 1, backgroundColor: '#0a0a0f' },
  header:      {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 45,
    paddingBottom: 14,
    backgroundColor: '#111118',
  },
  title:       { fontSize: 22, fontWeight: '800', color: '#00cfff' },
  subtitle:    { color: '#555', fontSize: 13, marginTop: 2 },
  scroll:      { padding: 16, paddingBottom: 140 },

  // Limiti
  limitsCard:   { backgroundColor: '#111118', borderRadius: 14, padding: 14, marginBottom: 16, gap: 6 },
  limitsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  limitsTitle:  { color: '#ccc', fontSize: 13, fontWeight: '700' },
  limitsCount:  { color: '#00cfff', fontSize: 13, fontWeight: '800' },
  limitsDetail: { color: '#555', fontSize: 11 },
  limitsBar:    { height: 5, backgroundColor: '#1a1a25', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  limitsFill:   { height: 5, borderRadius: 3 },
  limitWarning: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4 },

  // Forma
  label:  { color: '#555', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input:  {
    backgroundColor: '#111118', borderRadius: 12,
    padding: 13, color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: '#1e1e2a', marginBottom: 12,
  },

  // Faila izvēle
  fileBtn: {
    backgroundColor: '#111118', borderRadius: 14,
    padding: 24, alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#1e1e2a',
    borderStyle: 'dashed', marginBottom: 12,
  },
  fileBtnActive: { borderColor: '#00cfff55', backgroundColor: '#00cfff08' },
  fileTxt:       { color: '#444', fontSize: 13, textAlign: 'center' },
  fileHint:      { color: '#2a2a3a', fontSize: 11 },

  // Statuss
  status: { textAlign: 'center', fontWeight: '600', fontSize: 13, marginBottom: 10 },

  // Augšupielādes poga
  uploadBtn: {
    backgroundColor: '#00cfff', borderRadius: 14,
    paddingVertical: 15, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    marginBottom: 24,
  },
  uploadTxt: { color: '#000', fontWeight: '800', fontSize: 15 },

  // Manas dziesmas
  mySection:   { gap: 6 },
  sectionTitle:{ color: '#ccc', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  trackRow:    {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111118', borderRadius: 10,
    padding: 10, gap: 10,
  },
  trackNum:    { color: '#333', fontSize: 11, width: 20 },
  trackTitle:  { color: '#ccc', fontSize: 13, fontWeight: '600' },
  trackArtist: { color: '#444', fontSize: 11, marginTop: 2 },
  deleteBtn:   { padding: 6 },
});
