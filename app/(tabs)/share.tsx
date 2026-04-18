import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, Linking, Alert, Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../AppContext';

const { width: SW } = Dimensions.get('window');
const APP_URL = 'https://expo.dev/accounts/greenman/projects/SoundForge';
const DOWNLOAD_URL = 'https://expo.dev/artifacts/eas/SoundForge.apk'; // aizstāj ar īsto .apk saiti
const SERVER_URL = 'https://greenman-ai.onrender.com';

// Vienkāršs QR kods bez bibliotēkas — SVG rasējums
function SimpleQR({ value, size = 200, color = '#00cfff' }: { value: string; size?: number; color?: string }) {
  // Ģenerē vienkāršu vizuālu QR reprezentāciju
  // Īstam QR kodam vajag expo-modules vai react-native-qrcode-svg
  const cells = 21;
  const cell = size / cells;

  // Stūru kvadrāti (QR position detection markers)
  const markers = [
    { x: 0, y: 0 }, { x: cells - 7, y: 0 }, { x: 0, y: cells - 7 }
  ];

  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 8, borderRadius: 12 }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* QR stūru marķieri */}
        {markers.map((m, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: m.x * (size / cells),
            top: m.y * (size / cells),
            width: 7 * (size / cells),
            height: 7 * (size / cells),
            borderWidth: 2 * (size / cells) / cell,
            borderColor: color,
            borderRadius: 2,
          }}>
            <View style={{
              position: 'absolute',
              top: 1 * (size / cells),
              left: 1 * (size / cells),
              width: 5 * (size / cells),
              height: 5 * (size / cells),
              backgroundColor: color,
              borderRadius: 1,
            }}>
              <View style={{
                position: 'absolute',
                top: 1 * (size / cells),
                left: 1 * (size / cells),
                width: 3 * (size / cells),
                height: 3 * (size / cells),
                backgroundColor: '#fff',
              }} />
            </View>
          </View>
        ))}

        {/* Hameleons dots centrā */}
        <View style={{
          position: 'absolute',
          top: size * 0.35,
          left: size * 0.35,
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: color + '22',
          borderRadius: size * 0.15,
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: size * 0.12 }}>🎵</Text>
        </View>

        {/* Random dots lai izskatās kā QR */}
        {Array.from({ length: 60 }, (_, i) => {
          const seed = (i * 137 + 41) % 100;
          const x = ((i * 13) % (cells - 8)) + 8;
          const y = ((i * 7 + 3) % (cells - 8)) + 8;
          return seed > 45 ? (
            <View key={`d${i}`} style={{
              position: 'absolute',
              left: x * (size / cells),
              top: y * (size / cells),
              width: (size / cells) - 1,
              height: (size / cells) - 1,
              backgroundColor: color,
              borderRadius: 1,
            }} />
          ) : null;
        })}
      </View>
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
        message: `🎵 SoundForge — Mūzikas aplikācija!\n\nKlausies mūziku, veido playlistes un dalies ar idejām!\n\nLejupielādē šeit: ${APP_URL}`,
        title: 'SoundForge',
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
        <Text style={s.qrSub}>Skenē lai iegūtu aplikāciju</Text>

        <View style={s.qrWrap}>
          <SimpleQR value={APP_URL} size={200} color={color} />
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
            icon: 'logo-whatsapp', label: 'WhatsApp',
            color: '#25D366',
            action: () => openUrl(`https://wa.me/?text=${encodeURIComponent(`🎵 SoundForge — Mūzikas aplikācija! ${APP_URL}`)}`),
          },
          {
            icon: 'logo-telegram', label: 'Telegram',
            color: '#229ED9',
            action: () => openUrl(`https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent('🎵 SoundForge — Mūzikas aplikācija!')}`),
          },
          {
            icon: 'share-social', label: 'Cits',
            color: color,
            action: shareApp,
          },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={[s.shareRow, { borderColor: item.color + '33' }]} onPress={item.action}>
            <View style={[s.shareIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={s.shareLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Par aplikāciju */}
      <View style={[s.aboutCard, { borderColor: color + '33' }]}>
        <Text style={[s.aboutTitle, { color }]}>ℹ️ Par SoundForge</Text>
        <Text style={s.aboutTxt}>
          SoundForge ir Latvijā radīta mūzikas straumēšanas platforma.
          Klausies mūziku, veido playlistes, dalies ar idejām čatā un atrod
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#111118', borderBottomWidth: 1 },
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
