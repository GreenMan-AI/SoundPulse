import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp, API } from '../../components/AppContext';

export default function UploadScreen() {
  const { colors, accentColor, token, tracks, setTracks, t } = useApp();

  const [title, setTitle]               = useState('');
  const [artist, setArtist]             = useState('');
  const [file, setFile]                 = useState<any>(null);
  const [uploading, setUploading]       = useState(false);
  const [status, setStatus]             = useState('');
  const [limits, setLimits]             = useState<any>(null);
  const [myTracks, setMyTracks]         = useState<any[]>([]);

  useEffect(() => {
    if (token) { loadLimits(); loadMyTracks(); }
  }, [token]);

  const loadLimits = async () => {
    try {
      const r = await fetch(`${API}/api/upload/limits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLimits(await r.json());
    } catch {}
  };

  const loadMyTracks = async () => {
    try {
      const r = await fetch(`${API}/api/tracks`);
      const d = await r.json();
      const all = Array.isArray(d) ? d : (d.tracks || []);
      // Rāda savas dziesmas
      setMyTracks(all.slice(0, 20));
    } catch {}
  };

  const pickFile = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/*'],
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
    if (!file)         { setStatus('❌ ' + (t.uploadChooseFile ?? 'Izvēlies failu!')); return; }
    if (!title.trim()) { setStatus('❌ ' + (t.uploadTitle ?? 'Ievadi nosaukumu!')); return; }
    if (limits?.remaining === 0) {
      Alert.alert('⚠️', t.uploadLimitReached ?? 'Dienas limits sasniegts!');
      return;
    }

    setUploading(true);
    setStatus('⏳ ' + (t.uploadInProgress ?? 'Augšupielādē...'));

    try {
      const form = new FormData();
      form.append('audio', {
        uri:  file.uri,
        type: file.mimeType || 'audio/mpeg',
        name: file.name || 'track.mp3',
      } as any);
      form.append('title',  title.trim());
      form.append('artist', artist.trim() || t.noArtist ?? 'Nav izpildītāja');

      const r = await fetch(`${API}/api/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });
      const d = await r.json();

      if (d.track || d._id) {
        setStatus('✅ ' + (t.uploadSuccess ?? 'Veiksmīgi augšupielādēts!'));
        setTitle(''); setArtist(''); setFile(null);
        const tr = await fetch(`${API}/api/tracks`);
        const td = await tr.json();
        setTracks(Array.isArray(td) ? td : (td.tracks || []));
        await loadLimits();
        await loadMyTracks();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`❌ ${d.error || t.uploadFailed ?? 'Kļūda'}`);
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const usedPct = limits
    ? Math.min(((limits.used || 0) / (limits.limit || 10)) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Dienas limits */}
        {limits && (
          <View style={[s.limitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.limitsTop}>
              <Text style={[s.limitsTitle, { color: colors.text }]}>
                📊 {t.uploadDailyLimit ?? 'Dienas limits'}
              </Text>
              <Text style={[s.limitsCount, { color: accentColor }]}>
                {limits.used || 0} / {limits.limit || 10}
              </Text>
            </View>
            <Text style={[s.limitsDetail, { color: colors.subText }]}>
              Max {limits.maxSizeMB ?? 25}MB  •  Max {limits.maxDurationMin ?? 6} min  •  MP3/WAV/M4A
            </Text>
            <View style={[s.limitsBar, { backgroundColor: colors.border }]}>
              <View style={[s.limitsFill, {
                width: `${usedPct}%` as any,
                backgroundColor: usedPct > 80 ? '#ef4444' : accentColor,
              }]} />
            </View>
            {limits.remaining === 0 && (
              <Text style={s.limitWarn}>
                ⚠️ {t.uploadLimitReached ?? 'Šodienas limits sasniegts. Mēģini rīt!'}
              </Text>
            )}
          </View>
        )}

        {/* Nosaukums */}
        <Text style={[s.label, { color: colors.subText }]}>
          {t.uploadTitle ?? 'Dziesmas nosaukums'} *
        </Text>
        <View style={[s.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="musical-note" size={18} color={colors.subText} />
          <TextInput
            style={[s.input, { color: colors.text }]}
            placeholder={t.uploadTitlePh ?? 'Ievadi nosaukumu...'}
            placeholderTextColor={colors.subText}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Izpildītājs */}
        <Text style={[s.label, { color: colors.subText }]}>
          {t.uploadArtist ?? 'Izpildītājs'}
        </Text>
        <View style={[s.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="mic" size={18} color={colors.subText} />
          <TextInput
            style={[s.input, { color: colors.text }]}
            placeholder={t.uploadArtistPh ?? 'Ievadi izpildītāju...'}
            placeholderTextColor={colors.subText}
            value={artist}
            onChangeText={setArtist}
          />
        </View>

        {/* Faila izvēle */}
        <TouchableOpacity
          style={[s.filePicker, {
            backgroundColor: file ? accentColor + '12' : colors.card,
            borderColor:     file ? accentColor + '55' : colors.border,
          }]}
          onPress={pickFile}
        >
          <Ionicons
            name={file ? 'musical-note' : 'cloud-upload-outline'}
            size={36}
            color={file ? accentColor : colors.subText}
          />
          <Text style={[s.filePickerTxt, { color: file ? accentColor : colors.text }]}>
            {file ? file.name : (t.uploadNote ?? 'Nospied lai izvēlētos audio failu')}
          </Text>
          <Text style={[s.fileHint, { color: colors.subText }]}>
            MP3, WAV, M4A  •  max {limits?.maxSizeMB ?? 25}MB  •  max {limits?.maxDurationMin ?? 6} min
          </Text>
        </TouchableOpacity>

        {/* Statuss */}
        {!!status && (
          <View style={[s.statusBox, {
            backgroundColor: status.startsWith('✅') ? '#00ff8812'
              : status.startsWith('⏳') ? accentColor + '12'
              : '#ef444412',
            borderColor: status.startsWith('✅') ? '#00ff8833'
              : status.startsWith('⏳') ? accentColor + '33'
              : '#ef444433',
          }]}>
            <Text style={[s.statusTxt, {
              color: status.startsWith('✅') ? '#00ff88'
                : status.startsWith('⏳') ? accentColor
                : '#ef4444',
            }]}>
              {status}
            </Text>
          </View>
        )}

        {/* Augšupielādes poga */}
        <TouchableOpacity
          style={[s.uploadBtn, {
            backgroundColor: accentColor,
            opacity: (uploading || !file || limits?.remaining === 0) ? 0.45 : 1,
            shadowColor: accentColor,
          }]}
          onPress={doUpload}
          disabled={uploading || !file || limits?.remaining === 0}
        >
          {uploading
            ? <ActivityIndicator color="#000" />
            : <Ionicons name="cloud-upload" size={20} color="#000" />
          }
          <Text style={s.uploadBtnTxt}>
            {uploading
              ? (t.uploadInProgress ?? 'Augšupielādē...')
              : (t.uploadTrack ?? 'Augšupielādēt dziesmu')
            }
          </Text>
        </TouchableOpacity>

        {/* Jaunākās dziesmas */}
        {myTracks.length > 0 && (
          <View style={s.recentSection}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>
              🎵 Pēdēji pievienotās ({myTracks.length})
            </Text>
            {myTracks.map((tr: any, i: number) => (
              <View key={tr._id} style={[s.trackRow, {
                backgroundColor: colors.card,
                borderColor: colors.border,
              }]}>
                <Text style={[s.trackNum, { color: colors.subText }]}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.trackTitle, { color: colors.text }]} numberOfLines={1}>
                    {tr.title}
                  </Text>
                  <Text style={[s.trackArtist, { color: colors.subText }]} numberOfLines={1}>
                    {tr.artist || '—'}  ·  {tr.plays || 0}▶
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { padding: 16, paddingBottom: 160 },
  limitsCard:   { borderRadius: 16, padding: 14, marginBottom: 16, gap: 6, borderWidth: 1 },
  limitsTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  limitsTitle:  { fontSize: 13, fontWeight: '700' },
  limitsCount:  { fontSize: 14, fontWeight: '900' },
  limitsDetail: { fontSize: 11 },
  limitsBar:    { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  limitsFill:   { height: 5, borderRadius: 3 },
  limitWarn:    { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  label:        { fontSize: 11, fontWeight: '800', marginBottom: 6, marginTop: 4, letterSpacing: 0.5 },
  inputWrap:    {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, marginBottom: 12, gap: 10,
  },
  input:        { flex: 1, fontSize: 15, paddingVertical: 12, fontWeight: '600' },
  filePicker:   {
    borderRadius: 16, padding: 24, alignItems: 'center',
    borderWidth: 1.5, borderStyle: 'dashed',
    gap: 8, marginBottom: 12,
  },
  filePickerTxt:{ fontSize: 13, textAlign: 'center', fontWeight: '600' },
  fileHint:     { fontSize: 11 },
  statusBox:    {
    borderRadius: 12, padding: 12, borderWidth: 1,
    marginBottom: 10, alignItems: 'center',
  },
  statusTxt:    { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  uploadBtn:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, paddingVertical: 16, gap: 8,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },
  uploadBtnTxt: { color: '#000', fontWeight: '900', fontSize: 16 },
  recentSection:{ gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  trackRow:     {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 10, gap: 10, borderWidth: 1,
  },
  trackNum:     { width: 20, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  trackTitle:   { fontSize: 13, fontWeight: '700' },
  trackArtist:  { fontSize: 11, marginTop: 2 },
});
