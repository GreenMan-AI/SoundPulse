import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Image, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useApp, API } from '../../components/AppContext';
import { Lang } from '../../i18n';

const LANGS = [
  { code: 'lv' as Lang, flag: '🇱🇻', name: 'Latviešu' },
  { code: 'en' as Lang, flag: '🇬🇧', name: 'English' },
  { code: 'ru' as Lang, flag: '🇷🇺', name: 'Русский' },
];

const ACCENT_COLORS = [
  '#05c9f5','#2297a9','#269acf',
  '#a855f7','#8b5cf6','#6366f1',
  '#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#eab308',
  '#22c55e','#10b981','#14b8a6',
  '#ffffff','#94a3b8','#485d7b',
];

export default function ProfileScreen() {
  const {
    user, logout, t, lang, setLang,
    tracks, namedPlaylists, likes,
    profileData, saveProfile, uploadAvatar, token,
    themeMode, setThemeMode, accentColor, setAccentColor, colors,
  } = useApp();
  const router   = useRouter();
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;

  const [showLang, setShowLang]     = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [curPw, setCurPw]           = useState('');
  const [newPw, setNewPw]           = useState('');
  const [repPw, setRepPw]           = useState('');
  const [pwErr, setPwErr]           = useState('');
  const [pwOk, setPwOk]             = useState('');

  const isDark = themeMode === 'dark';
  const name   = profileData?.nick || user?.username || '?';

  const pickAvatar = async () => {
    Alert.alert(t.avatarLabel, '', [
      {
        text: '📷 ' + t.fromCamera, onPress: async () => {
          const p = await ImagePicker.requestCameraPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8 });
          if (!r.canceled) await uploadAvatar(r.assets[0].uri);
        },
      },
      {
        text: '🖼️ ' + t.fromGallery, onPress: async () => {
          const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8 });
          if (!r.canceled) await uploadAvatar(r.assets[0].uri);
        },
      },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  const changePw = async () => {
    setPwErr(''); setPwOk('');
    if (!curPw || !newPw || !repPw) { setPwErr(t.fillAll); return; }
    if (newPw !== repPw) { setPwErr(t.pwNoMatch); return; }
    if (newPw.length < 8) { setPwErr(t.passMin); return; }
    try {
      const r = await fetch(`${API}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const d = await r.json();
      if (d.ok) {
        setPwOk(t.pwChanged);
        setCurPw(''); setNewPw(''); setRepPw('');
        setTimeout(() => setShowPw(false), 1500);
      } else setPwErr(d.error || t.error);
    } catch { setPwErr(t.serverError); }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          isTablet && { maxWidth: 600, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} style={s.avatarWrap}>
            {profileData?.avatarUrl ? (
              <Image
                source={{ uri: profileData.avatarUrl }}
                style={[s.avatar, { borderColor: accentColor }]}
              />
            ) : (
              <View style={[s.avatarPlaceholder, {
                borderColor: accentColor,
                backgroundColor: accentColor + '18',
              }]}>
                <Text style={[s.avatarLetter, { color: accentColor }]}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[s.camBadge, { backgroundColor: accentColor }]}>
              <Ionicons name="camera" size={12} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={[s.name, { color: colors.text }]}>{name}</Text>
          <Text style={[s.username, { color: colors.subText }]}>@{user?.username}</Text>
          {user?.isAdmin && (
            <View style={[s.adminBadge, { backgroundColor: '#f59e0b18', borderColor: '#f59e0b44' }]}>
              <Ionicons name="shield-checkmark" size={12} color="#f59e0b" />
              <Text style={s.adminBadgeTxt}>Admin</Text>
            </View>
          )}
        </View>

        {/* Statistika */}
        <View style={s.statsRow}>
          {[
            { v: (tracks ?? []).length,         l: t.songs ?? 'Dziesmas', c: accentColor,  i: 'musical-notes' },
            { v: (likes ?? []).length,          l: t.likes ?? 'Patīk',    c: '#a31764e3',    i: 'heart' },
            { v: (namedPlaylists ?? []).length, l: t.playlists ?? 'Saraksti', c: '#ac8c24', i: 'list' },
          ].map((st, i) => (
            <View key={i} style={[s.statCard, {
              backgroundColor: colors.card,
              borderTopColor:  st.c,
              borderColor:     colors.border,
            }]}>
              <Ionicons name={st.i as any} size={18} color={st.c} />
              <Text style={[s.statVal, { color: st.c }]}>{st.v}</Text>
              <Text style={[s.statLbl, { color: colors.subText }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Navigācija */}
        <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionLbl, { color: colors.subText }]}>NAVIGĀCIJA</Text>
          <MenuItem icon="list"         color="#623b87"  label={t.playlist ?? 'Playliste'}    colors={colors} onPress={() => router.push('/playlist')} />
          <MenuItem icon="share-social" color="#10b981"  label={t.shareTitle ?? 'Dalīties'}   colors={colors} onPress={() => router.push('/share')} />
          {user?.isAdmin && (
            <MenuItem icon="shield-checkmark" color="#d29326" label={t.admin ?? 'Admin panelis'} colors={colors} onPress={() => router.push('/admin')} />
          )}
        </View>

        {/* Iestatījumi */}
        <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionLbl, { color: colors.subText }]}>IESTATĪJUMI</Text>
          <MenuItem
            icon="language" color={accentColor}
            label={t.changeLanguage ?? 'Valoda'}
            value={LANGS.find(l => l.code === lang)?.flag + ' ' + LANGS.find(l => l.code === lang)?.name}
            colors={colors} onPress={() => setShowLang(true)}
          />
          <MenuItem
            icon={isDark ? 'moon' : 'sunny'} color={accentColor}
            label={isDark ? (t.darkMode ?? 'Tumšais') : (t.lightMode ?? 'Gaišais')}
            colors={colors} onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          />
          <MenuItem
            icon="color-palette" color={accentColor}
            label={t.accentColor ?? 'Akcenta krāsa'}
            colors={colors} onPress={() => setShowColors(true)}
            rightEl={<View style={[s.colorDot, { backgroundColor: accentColor }]} />}
          />
          <MenuItem
            icon="lock-closed" color={accentColor}
            label={t.changePass ?? 'Mainīt paroli'}
            colors={colors} onPress={() => setShowPw(true)}
          />
        </View>

        {/* Privātums */}
        <View style={[s.privacyCard, { backgroundColor: '#00ff8808', borderColor: '#00ff8820' }]}>
          <View style={s.privacyRow}>
            <Ionicons name="shield-checkmark" size={16} color="#00ff88" />
            <Text style={s.privacyTitle}>{t.privacyGuaranteed ?? 'Privātums garantēts'}</Text>
          </View>
          <Text style={[s.privacyDesc, { color: colors.subText }]}>
            {t.privacyDesc ?? 'SoundPulse neievāc datus. Viss notiek jūsu ierīcē.'}
          </Text>
          <View style={s.privacyBadges}>
            {[t.noTracking ?? 'Nav izsekošanas', t.encrypted ?? 'Šifrēts'].map(b => (
              <View key={b} style={s.privacyBadge}>
                <Text style={s.privacyBadgeTxt}>✓ {b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Iziet */}
        <TouchableOpacity
          style={[s.logoutBtn, { borderColor: '#ef444433' }]}
          onPress={() => Alert.alert(
            t.logoutConfirmTitle ?? 'Iziet?',
            t.logoutConfirmMsg   ?? 'Vai tiešām vēlies aiziet?',
            [
              { text: t.stay ?? 'Palikt', style: 'cancel' },
              { text: t.logoutBtn ?? 'Iziet', style: 'destructive', onPress: logout },
            ]
          )}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={s.logoutTxt}>{t.logout ?? 'Izrakstīties'}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODĀLIE LOGI */}

      {/* Valoda */}
      <Modal visible={showLang} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setShowLang(false)} activeOpacity={1}>
          <View style={[s.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: accentColor }]}>{t.changeLanguage}</Text>
            {LANGS.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[s.langRow, { borderBottomColor: colors.border }]}
                onPress={() => { setLang(l.code); setShowLang(false); }}
              >
                <Text style={{ fontSize: 26 }}>{l.flag}</Text>
                <Text style={[s.langName, { color: lang === l.code ? accentColor : colors.text }]}>
                  {l.name}
                </Text>
                {lang === l.code && <Ionicons name="checkmark-circle" size={22} color={accentColor} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Krāsas */}
      <Modal visible={showColors} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setShowColors(false)} activeOpacity={1}>
          <View style={[s.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: accentColor }]}>{t.chooseColor ?? 'Izvēlies krāsu'}</Text>
            <View style={s.colorGrid}>
              {ACCENT_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorCircle, {
                    backgroundColor: c,
                    borderWidth: accentColor === c ? 3 : 0,
                    borderColor: colors.text,
                  }]}
                  onPress={() => { setAccentColor(c); setShowColors(false); }}
                >
                  {accentColor === c && (
                    <Ionicons name="checkmark" size={16} color={c === '#c12222' ? '#702e2e' : '#735959'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Parole */}
      <Modal visible={showPw} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: accentColor }]}>{t.changePass}</Text>
            {[
              { val: curPw, set: setCurPw, ph: t.curPass ?? 'Pašreizējā parole' },
              { val: newPw, set: setNewPw, ph: t.newPass ?? 'Jaunā parole' },
              { val: repPw, set: setRepPw, ph: t.repPass ?? 'Atkārtot' },
            ].map(({ val, set, ph }, i) => (
              <TextInput
                key={i}
                placeholder={ph}
                placeholderTextColor={colors.subText}
                secureTextEntry
                style={[s.pwInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                value={val}
                onChangeText={set}
              />
            ))}
            {!!pwErr && <Text style={s.errTxt}>{pwErr}</Text>}
            {!!pwOk  && <Text style={s.okTxt}>{pwOk}</Text>}
            <View style={s.pwBtns}>
              <TouchableOpacity
                style={[s.pwBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowPw(false)}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.pwBtn, { backgroundColor: accentColor, flex: 2 }]}
                onPress={changePw}
              >
                <Text style={{ color: '#000', fontWeight: '900' }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Menu item komponents ──
function MenuItem({ icon, color, label, value, colors, onPress, rightEl }: any) {
  return (
    <TouchableOpacity
      style={[mi.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[mi.icon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={[mi.label, { color: colors.text }]}>{label}</Text>
      {value && <Text style={[mi.value, { color: colors.subText }]}>{value}</Text>}
      {rightEl}
      <Ionicons name="chevron-forward" size={15} color={colors.subText} />
    </TouchableOpacity>
  );
}

const mi = StyleSheet.create({
  row:   {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 0.5, gap: 12,
  },
  icon:  { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1, fontSize: 14, fontWeight: '600' },
  value: { fontSize: 13 },
});

const s = StyleSheet.create({
  container:     { flex: 1 },
  scroll:        { paddingBottom: 160, paddingHorizontal: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrap:    { position: 'relative', marginBottom: 12 },
  avatar:        { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter:  { fontSize: 40, fontWeight: '900' },
  camBadge:      {
    position: 'absolute', bottom: 4, right: 4,
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#000',
  },
  name:          { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  username:      { fontSize: 14, marginBottom: 8 },
  adminBadge:    {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1,
  },
  adminBadgeTxt: { color: '#8b692c', fontSize: 11, fontWeight: '800' },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:      {
    flex: 1, borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 4,
    borderTopWidth: 3, borderWidth: 1,
  },
  statVal:       { fontSize: 20, fontWeight: '900' },
  statLbl:       { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  section:       { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden', paddingTop: 8 },
  sectionLbl:    { fontSize: 11, fontWeight: '800', paddingHorizontal: 16, paddingBottom: 8, letterSpacing: 0.5 },
  colorDot:      { width: 20, height: 20, borderRadius: 10 },
  privacyCard:   { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 8 },
  privacyRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  privacyTitle:  { color: '#00ff88', fontSize: 14, fontWeight: '700' },
  privacyDesc:   { fontSize: 13, lineHeight: 18 },
  privacyBadges: { flexDirection: 'row', gap: 8 },
  privacyBadge:  { backgroundColor: '#113b2818', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  privacyBadgeTxt:{ color: '#00ff88', fontSize: 11, fontWeight: '700' },
  logoutBtn:     {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20,
  },
  logoutTxt:     { color: '#b53a3a', fontSize: 15, fontWeight: '700' },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modal:         { borderRadius: 24, borderWidth: 1, padding: 24, margin: 16, marginBottom: 32 },
  modalTitle:    { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  langRow:       {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5, gap: 14,
  },
  langName:      { flex: 1, fontSize: 16, fontWeight: '600' },
  colorGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingVertical: 8 },
  colorCircle:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  pwInput:       { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, fontSize: 14 },
  pwBtns:        { flexDirection: 'row', gap: 10, marginTop: 8 },
  pwBtn:         { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  errTxt:        { color: '#cd1f1f', textAlign: 'center', marginBottom: 8, fontWeight: '600' },
  okTxt:         { color: '#10b981', textAlign: 'center', marginBottom: 8, fontWeight: '600' },
});
