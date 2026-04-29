import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, Linking, Alert, Dimensions, Image,Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../components/AppContext';

const { width: SW } = Dimensions.get('window');
const APP_URL = 'https://expo.dev/accounts/greenman/projects/SoundPulse';
const DOWNLOAD_URL = 'https://github.com/GreenMan-AI/greenman-ai/releases/latest/download/SoundPulse.apk';
const SERVER_URL = 'https://soundpulse-oe3r.onrender.com/api';

// QR kods — izmanto qrserver.com API lai ģenerētu īstu QR
function RealQR({ value, size = 200, color = '00cfff' }: { value: string; size?: number; color?: string }) {
  const colorHex = color.replace('#', '');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=0a0a0f&color=${colorHex}&format=png&qzone=2`;
  return (
    <View style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0a0a0f' }}>
      <Image source={{ uri: qrUrl }} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

const COLORS = ['#00cfff', '#a855f7', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function ShareScreen() {
  const { tracks, user } = useApp();
  const [colorIdx, setColorIdx] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const color = COLORS[colorIdx];

  useEffect(() => {
    const t = setInterval(() => setColorIdx(i => (i + 1) % COLORS.length), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Ielādē servera statistiku
    fetch(`${SERVER_URL}/api/tracks`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.tracks || []);
        setStats({
          tracks: list.length,
          plays: list.reduce((s: number, t: any) => s + (t.plays || 0), 0),
        });
      })
      .catch(() => {});
  }, []);

  const shareApp = async () => {
    try {
      await Share.share({
        message: `🎵 SoundPulse — Mūzikas aplikācija!\n\nKlausies mūziku, veido playlistes un dalies ar tām!\n\nLejupielādē šeit: ${APP_URL}`,
        title: 'SoundPulse',
      });
    } catch {}
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Kļūda', 'Nevar atvērt saiti'));
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: color + '33' }]}>
        <Text style={[s.logo, { color }]}>📲 Dalīties</Text>
      </View>

      {/* QR kods */}
      <View style={[s.qrCard, { borderColor: color + '44' }]}>
        <Text style={[s.qrTitle, { color }]}>🔗 QR kods</Text>
        <Text style={s.qrSub}>Skenē lai daltos ar aplikāciju</Text>

        <View style={s.qrWrap}>
          <RealQR value={APP_URL} size={200} color={color} />
        </View>

        <Text style={[s.qrUrl, { color: color + '99' }]} numberOfLines={1}>{APP_URL}</Text>

        <View style={s.qrBtns}>
          <TouchableOpacity style={[s.qrBtn, { backgroundColor: color }]} onPress={shareApp}>
            <Ionicons name="share-social" size={18} color="#000" />
            <Text style={s.qrBtnTxt}>Dalīties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.qrBtn, { backgroundColor: color + '22', borderWidth: 1, borderColor: color + '55' }]} onPress={() => openUrl(APP_URL)}>
            <Ionicons name="open-outline" size={18} color={color} />
            <Text style={[s.qrBtnTxt, { color }]}>Atvērt</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistika */}
      {stats && (
        <View style={s.statsRow}>
          {[
            { v: stats.tracks, l: 'Dziesmas', e: '🎵', c: COLORS[0] },
            { v: stats.plays, l: 'Atskaņojumi', e: '▶️', c: COLORS[1] },
            { v: '24/7', l: 'Online', e: '🟢', c: COLORS[2] },
          ].map((st, i) => (
            <View key={i} style={[s.statBox, { borderColor: st.c + '44' }]}>
              <Text style={s.statE}>{st.e}</Text>
              <Text style={[s.statV, { color: st.c }]}>{st.v}</Text>
              <Text style={s.statL}>{st.l}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Dalīšanās veidi */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[s.secTitle, { color }]}>📤 Kā dalīties</Text>

     {[
          {
            icon: 'logo-whatsapp',
            label: 'WhatsApp',
            color: '#25D366',
            action: () => {
              const currentUrl = typeof APP_URL !== 'undefined' ? APP_URL : 'https://soundforge.app';
              openUrl(`https://wa.me/?text=${encodeURIComponent(`🎵 SoundPulse — Mūzikas aplikācija! ${currentUrl}`)}`);
            },
          },
          {
            icon: 'paper-plane',
            label: 'Telegram',
            color: '#229ED9',
            action: () => {
              const currentUrl = typeof APP_URL !== 'undefined' ? APP_URL : 'https://soundforge.app';
              const message = '🎵 SoundPulse — Mūzikas aplikācija!';
              const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(message)}`;
              openUrl(telegramUrl);
            },
          },
          {
            icon: 'share-social',
            label: 'Cits',
            color: color, // Pārliecinies, ka 'color' mainīgais ir definēts augstāk
            action: shareApp,
          },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={[s.shareRow, { borderColor: item.color + '33' }]} onPress={item.action}>
            <View style={[s.shareIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name="paper-plane" size={24} color="#0088cc" />
            </View>
            <Text style={s.shareLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Par aplikāciju */}
      <View style={[s.aboutCard, { borderColor: color + '33' }]}>
        <Text style={[s.aboutTitle, { color }]}>ℹ️ Par SoundPulse</Text>
        <Text style={s.aboutTxt}>
          SoundPulse ir Latvijā radīta mūzikas straumēšanas platforma.
          Klausies mūziku, veido playlistes, dalies ar idejām un atrod
          jaunas dziesmas. Pieejama Android ierīcēs.
        </Text>
        <View style={[s.versionBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
          <Text style={[s.versionTxt, { color }]}>v1.0 • Made in Latvia 🇱🇻</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 14, backgroundColor: '#111118', borderBottomWidth: 1 },
  logo: { fontSize: 20, fontWeight: '800' },
  qrCard: { margin: 16, backgroundColor: '#111118', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1 },
  qrTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  qrSub: { color: '#555', fontSize: 13, marginBottom: 20 },
  qrWrap: { marginBottom: 16, shadowColor: '#00cfff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  qrUrl: { fontSize: 10, marginBottom: 16, letterSpacing: 0.5 },
  qrBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  qrBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 12, gap: 8 },
  qrBtnTxt: { color: '#000', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#111118', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  statE: { fontSize: 22 },
  statV: { fontSize: 18, fontWeight: '900' },
  statL: { color: '#555', fontSize: 9, fontWeight: '600' },
  secTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  shareRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, gap: 14 },
  shareIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shareLabel: { flex: 1, color: '#ccc', fontSize: 15, fontWeight: '600' },
  aboutCard: { margin: 16, backgroundColor: '#111118', borderRadius: 16, padding: 18, borderWidth: 1 },
  aboutTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  aboutTxt: { color: '#666', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  versionBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  versionTxt: { fontSize: 12, fontWeight: '700' },
});
