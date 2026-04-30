import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Image, Alert, Platform, Dimensions
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, API } from '../../components/AppContext';
import { Lang } from '../../i18n';

const { width } = Dimensions.get('window');

const LANGS = [
  { code: 'lv' as Lang, flag: '🇱🇻', name: 'Latviešu' },
  { code: 'en' as Lang, flag: '🇬🇧', name: 'English' },
  { code: 'ru' as Lang, flag: '🇷🇺', name: 'Русский' },
];

export default function ProfileScreen() {
  const { 
    user, logout, t, lang, setLang, tracks, playlist, namedPlaylists, likes,
    profileData, saveProfile, uploadAvatar, token,
    themeMode, setThemeMode, accentColor, setAccentColor, colors 
  } = useApp();
  
  const isDark = themeMode === 'dark';

  // State logiem
  const [showLang, setShowLang] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Paroles maiņas state
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [repPw, setRepPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState('');

  const name = profileData.nick || user?.username || '?';

  // Avatara izvēle
  const pickAvatar = async () => {
    Alert.alert(t.avatarLabel, '', [
      { text: '📷 ' + t.fromCamera, onPress: async () => {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return;
        const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) await uploadAvatar(r.assets[0].uri);
      }},
      { text: '🖼️ ' + t.fromGallery, onPress: async () => {
        const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!p.granted) return;
        const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) await uploadAvatar(r.assets[0].uri);
      }},
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  // Paroles maiņas loģika
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      
      {/* 1. AUGŠĒJĀ NAVIGĀCIJAS JOSLA - Droša pret iziešanu no aplikācijas */}
      <View style={[s.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[s.topTitle, { color: accentColor }]}>SoundPulse</Text>
        
        <View style={s.topActions}>
          <TouchableOpacity 
            style={[s.topIconBtn, { backgroundColor: colors.bg }]} 
            onPress={() => setShowLang(true)}
          >
            <Text style={{ fontSize: 16 }}>{LANGS.find(l => l.code === lang)?.flag}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.topIconBtn, { backgroundColor: colors.bg }]} 
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={accentColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.topIconBtn, { backgroundColor: colors.bg }]} 
            onPress={() => setShowPw(true)}
          >
            <Ionicons name="lock-closed-outline" size={20} color={accentColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 150 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* 2. PROFILA BILDES DAĻA */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} style={s.avatarWrap}>
            {profileData.avatarUrl
              ? <Image source={{ uri: profileData.avatarUrl }} style={[s.avatar, { borderColor: accentColor }]} />
              : <View style={[s.avatarPlaceholder, { borderColor: accentColor, backgroundColor: colors.card }]}>
                  <Text style={[s.avatarLetter, { color: accentColor }]}>{name.charAt(0).toUpperCase()}</Text>
                </View>}
            <View style={[s.camBadge, { backgroundColor: accentColor }]}><Ionicons name="camera" size={14} color="#000" /></View>
          </TouchableOpacity>
          <Text style={[s.name, { color: colors.text }]}>{name}</Text>
          <Text style={[s.username, { color: colors.subText }]}>@{user?.username}</Text>
        </View>

        {/* 3. STATISTIKA */}
        <View style={s.stats}>
          {[
            { v: tracks.length, l: t.songs, c: accentColor },
            { v: (likes||[]).length, l: t.likes, c: '#ef4444' },
            { v: namedPlaylists.length, l: t.playlists, c: '#a855f7' },
          ].map((st, i) => (
            <View key={i} style={[s.stat, { backgroundColor: colors.card, borderTopColor: st.c }]}>
              <Text style={[s.statV, { color: st.c }]}>{st.v}</Text>
              <Text style={[s.statL, { color: colors.subText }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* 4. KRĀSU IZVĒLE */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[s.sectionLabel, { color: colors.subText }]}>{t.accentColor?.toUpperCase() || 'AKCENTA KRĀSA'}</Text>
          <View style={[s.colorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.colorRow}>
              {['#00cfff', '#a855f7', '#ef4444', '#10b981', '#f59e0b'].map((color) => (
                <TouchableOpacity 
                  key={color} 
                  onPress={() => setAccentColor(color)} 
                  style={[s.colorCircle, { backgroundColor: color, borderColor: accentColor === color ? colors.text : 'transparent' }]}
                >
                  {accentColor === color && <Ionicons name="checkmark" size={20} color="#000" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 5. IZLOGOTIES */}
          <TouchableOpacity 
            style={[s.logoutBtn, { borderColor: '#ef444455' }]} 
            onPress={() => Alert.alert(t.logoutConfirmTitle, t.logoutConfirmMsg, [
              { text: t.stay, style: 'cancel' },
              { text: t.logoutBtn, style: 'destructive', onPress: logout },
            ])}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={s.logoutTxt}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODĀLAIS LOGS VALODAI */}
      <Modal visible={showLang} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setShowLang(false)} activeOpacity={1}>
          <View style={[s.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: accentColor }]}>{t.changeLanguage}</Text>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} style={s.langOpt} onPress={() => { setLang(l.code); setShowLang(false); }}>
                <Text style={{ fontSize: 24 }}>{l.flag}</Text>
                <Text style={{ color: lang === l.code ? accentColor : colors.text, fontSize: 18, flex: 1, marginLeft: 15 }}>{l.name}</Text>
                {lang === l.code && <Ionicons name="checkmark-circle" size={24} color={accentColor} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODĀLAIS LOGS PAROLEI */}
      <Modal visible={showPw} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modal, { backgroundColor: colors.card, borderColor: colors.border, width: '90%' }]}>
            <Text style={[s.modalTitle, { color: accentColor }]}>{t.changePass}</Text>
            
            <TextInput 
              placeholder={t.curPass} placeholderTextColor={colors.subText}
              secureTextEntry style={[s.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={curPw} onChangeText={setCurPw}
            />
            <TextInput 
              placeholder={t.newPass} placeholderTextColor={colors.subText}
              secureTextEntry style={[s.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={newPw} onChangeText={setNewPw}
            />
            <TextInput 
              placeholder={t.repPass} placeholderTextColor={colors.subText}
              secureTextEntry style={[s.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={repPw} onChangeText={setRepPw}
            />

            {pwErr ? <Text style={s.errTxt}>{pwErr}</Text> : null}
            {pwOk ? <Text style={s.okTxt}>{pwOk}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: colors.border }]} onPress={() => setShowPw(false)}>
                <Text style={{ color: colors.text }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 2, backgroundColor: accentColor }]} onPress={changePw}>
                <Text style={{ color: '#000', fontWeight: '800' }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  // Augšējā josla
  topNav: {
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  topTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  topActions: { flexDirection: 'row', gap: 10 },
  topIconBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Profils
  avatarSection: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 45, fontWeight: '900' },
  camBadge: { position: 'absolute', bottom: 5, right: 5, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  name: { fontSize: 24, fontWeight: '800', marginTop: 15 },
  username: { fontSize: 15, opacity: 0.6, marginTop: 2 },

  stats: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginVertical: 25 },
  stat: { flex: 1, borderRadius: 20, padding: 15, alignItems: 'center', borderTopWidth: 4, elevation: 3, shadowOpacity: 0.1 },
  statV: { fontSize: 20, fontWeight: '900' },
  statL: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },

  sectionLabel: { fontSize: 12, fontWeight: '800', marginBottom: 10, marginLeft: 5 },
  colorCard: { padding: 20, borderRadius: 25, borderWidth: 1 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  colorCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginTop: 40, 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  logoutTxt: { color: '#ef4444', fontSize: 16, fontWeight: '700' },

  // Modālie logi & Ievade
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', padding: 25, borderRadius: 30, borderWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  langOpt: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  input: { padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 10 },
  btn: { padding: 15, borderRadius: 15, alignItems: 'center' },
  errTxt: { color: '#ef4444', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  okTxt: { color: '#10b981', textAlign: 'center', marginBottom: 10, fontWeight: '600' }
});