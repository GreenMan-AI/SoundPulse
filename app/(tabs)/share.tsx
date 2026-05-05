import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, Linking, Alert, Image, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../components/AppContext';

const APP_URL    = 'https://expo.dev/accounts/greenman/projects/SoundPulse';
const SERVER_URL = 'https://soundpulse-oe3r.onrender.com/api';

function QRImage({ value, size, color }: { value: string; size: number; color: string }) {
  const hex = color.replace('#', '');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=0a0a0f&color=${hex}&format=png&qzone=2`;
  return (
    <View style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden' }}>
      <Image source={{ uri: url }} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

export default function ShareScreen() {
  const { t, accentColor, colors } = useApp();
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const qrSize    = isTablet ? 220 : 180;

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/tracks`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.tracks || []);
        setStats({
          tracks: list.length,
          plays:  list.reduce((s: number, tr: any) => s + (tr.plays || 0), 0),
        });
      })
      .catch(() => {});
  }, []);

  const shareApp = async () => {
    try {
      await Share.share({
        message: `${t.shareSlogan ?? '🎵 SoundPulse — Mūzikas aplikācija!'}\n\n${APP_URL}`,
        title: 'SoundPulse',
      });
    } catch {}
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert(t.error, t.serverError));
  };

  const SHARE_OPTIONS = [
    {
      icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366',
      action: () => openUrl(`https://wa.me/?text=${encodeURIComponent(`${t.shareSlogan ?? 'SoundPulse'} ${APP_URL}`)}`),
    },
    {
      icon: 'paper-plane', label: 'Telegram', color: '#229ED9',
      action: () => openUrl(`https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(t.shareSlogan ?? 'SoundPulse')}`),
    },
    {
      icon: 'share-social', label: t.share ?? 'Cits', color: accentColor,
      action: shareApp,
    },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          isTablet && { maxWidth: 600, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* QR karte */}
        <View style={[s.qrCard, { backgroundColor: colors.card, borderColor: accentColor + '33' }]}>
          <Text style={[s.qrTitle, { color: accentColor }]}>
            {t.qrCode ?? '🔗 QR Kods'}
          </Text>
          <Text style={[s.qrSub, { color: colors.subText }]}>
            {t.qrScanHint ?? 'Skenē lai dalītos ar aplikāciju'}
          </Text>
          <View style={[s.qrWrap, { shadowColor: accentColor }]}>
            <QRImage value={APP_URL} size={qrSize} color={accentColor} />
          </View>
          <Text style={[s.qrUrl, { color: accentColor + '66' }]} numberOfLines={1}>
            {APP_URL}
          </Text>
          <View style={s.qrBtns}>
            <TouchableOpacity
              style={[s.qrBtn, { backgroundColor: accentColor }]}
              onPress={shareApp}
            >
              <Ionicons name="share-social" size={16} color="#000" />
              <Text style={s.qrBtnDark}>{t.share ?? 'Dalīties'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.qrBtn, {
                backgroundColor: accentColor + '18',
                borderWidth: 1, borderColor: accentColor + '44',
              }]}
              onPress={() => openUrl(APP_URL)}
            >
              <Ionicons name="open-outline" size={16} color={accentColor} />
              <Text style={[s.qrBtnLight, { color: accentColor }]}>
                {t.open ?? 'Atvērt'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistika */}
        <View style={s.statsRow}>
          {[
            { e: '🎵', v: stats?.tracks ?? 0, l: t.songs  ?? 'Dziesmas',      c: accentColor },
            { e: '🎧', v: stats?.plays  ?? 0, l: t.plays  ?? 'Atskaņojumi',   c: '#a855f7'  },
            { e: '🟢', v: '24/7',             l: 'Online',                     c: '#22c55e'  },
          ].map((st, i) => (
            <View key={i} style={[s.statBox, {
              backgroundColor: colors.card,
              borderColor: st.c + '33',
            }]}>
              <Text style={s.statE}>{st.e}</Text>
              <Text style={[s.statV, { color: st.c }]}>{st.v}</Text>
              <Text style={[s.statL, { color: colors.subText }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Dalīšanās veidi */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          {t.howToShare ?? '📤 Kā dalīties'}
        </Text>
        {SHARE_OPTIONS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.shareRow, {
              backgroundColor: colors.card,
              borderColor:     item.color + '33',
            }]}
            onPress={item.action}
          >
            <View style={[s.shareIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[s.shareLabel, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          </TouchableOpacity>
        ))}

        {/* Par app */}
        <View style={[s.aboutCard, {
          backgroundColor: colors.card,
          borderColor: accentColor + '22',
        }]}>
          <Text style={[s.aboutTitle, { color: accentColor }]}>
            {t.aboutSoundPulse ?? 'ℹ️ Par SoundPulse'}
          </Text>
          <Text style={[s.aboutTxt, { color: colors.subText }]}>
            {t.aboutText ?? 'SoundPulse ir Latvijā radīta mūzikas straumēšanas platforma.'}
          </Text>
          <View style={[s.badge, {
            backgroundColor: accentColor + '18',
            borderColor:     accentColor + '33',
          }]}>
            <Text style={[s.badgeTxt, { color: accentColor }]}>
              {t.madeInLatvia ?? '🇱🇻 Latvijā radīta · v1.1'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  scroll:      { paddingBottom: 160 },
  qrCard:      {
    margin: 14, borderRadius: 20, padding: 20,
    alignItems: 'center', borderWidth: 1, gap: 8,
  },
  qrTitle:     { fontSize: 18, fontWeight: '800' },
  qrSub:       { fontSize: 13 },
  qrWrap:      {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
    marginVertical: 8,
  },
  qrUrl:       { fontSize: 10, letterSpacing: 0.3 },
  qrBtns:      { flexDirection: 'row', gap: 10, width: '100%' },
  qrBtn:       {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: 12,
    paddingVertical: 12, gap: 6,
  },
  qrBtnDark:   { color: '#000', fontWeight: '800', fontSize: 13 },
  qrBtnLight:  { fontWeight: '700', fontSize: 13 },
  statsRow:    { flexDirection: 'row', paddingHorizontal: 14, gap: 10, marginBottom: 18 },
  statBox:     {
    flex: 1, borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4, borderWidth: 1,
  },
  statE:       { fontSize: 20 },
  statV:       { fontSize: 18, fontWeight: '900' },
  statL:       { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  sectionTitle:{ fontSize: 15, fontWeight: '800', paddingHorizontal: 14, marginBottom: 10 },
  shareRow:    {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14,
    marginHorizontal: 14, marginBottom: 8,
    borderWidth: 1, gap: 12,
  },
  shareIcon:   {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  shareLabel:  { flex: 1, fontSize: 15, fontWeight: '600' },
  aboutCard:   { margin: 14, borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  aboutTitle:  { fontSize: 15, fontWeight: '800' },
  aboutTxt:    { fontSize: 13, lineHeight: 20 },
  badge:       {
    alignSelf: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  badgeTxt:    { fontSize: 12, fontWeight: '700' },
});
