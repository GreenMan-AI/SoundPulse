import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Image, Alert,Platform,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, API } from '../../components/AppContext';
import { Lang } from '../../i18n';

const LANGS = [
  { code: 'lv' as Lang, flag: '🇱🇻', name: 'Latviešu' },
  { code: 'en' as Lang, flag: '🇬🇧', name: 'English' },
  { code: 'ru' as Lang, flag: '🇷🇺', name: 'Русский' },
];

export default function ProfileScreen() {
  const { user, logout, t, lang, setLang, tracks, playlist, namedPlaylists, likes,
          profileData, saveProfile, uploadAvatar, token, banner, setBanner } = useApp();

  const [showLang, setShowLang] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [nickEdit, setNickEdit] = useState('');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [repPw, setRepPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState('');
  const [pwVisible, setPwVisible] = useState(false);

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

  const changePw = async () => {
    setPwErr(''); setPwOk('');
    if (!curPw || !newPw || !repPw) { setPwErr(t.fillAll); return; }
    if (newPw !== repPw) { setPwErr(t.pwNoMatch); return; }
    if (newPw.length < 8 || !/[A-Z]/.test(newPw) || !/[0-9]/.test(newPw)) { setPwErr(t.passMin); return; }
    try {
      const r = await fetch(`${API}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const d = await r.json();
      if (d.ok) { setPwOk(t.pwChanged); setCurPw(''); setNewPw(''); setRepPw(''); setTimeout(() => setShowPw(false), 1500); }
      else setPwErr(d.error || t.error);
    } catch { setPwErr(t.serverError); }
  };

  const name = profileData.nick || user?.username || '?';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={s.header}>
        <Text style={s.title}>👤 {t.profile}</Text>
      </View>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <TouchableOpacity onPress={pickAvatar} style={s.avatarWrap}>
          {profileData.avatarUrl
            ? <Image source={{ uri: profileData.avatarUrl }} style={s.avatar} />
            : <View style={s.avatarPlaceholder}><Text style={s.avatarLetter}>{name.charAt(0).toUpperCase()}</Text></View>}
          <View style={s.camBadge}><Ionicons name="camera" size={12} color="#000" /></View>
        </TouchableOpacity>
        <Text style={s.name}>{name}</Text>
        <Text style={s.username}>@{user?.username}</Text>
        <View style={[s.badge, user?.isAdmin && { backgroundColor: '#f59e0b22', borderColor: '#f59e0b44' }]}>
          <Text style={[s.badgeTxt, user?.isAdmin && { color: '#f59e0b' }]}>
            {user?.isAdmin ? t.admin : `👤 ${t.user}`}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.stats}>
        {[
          { v: tracks.length, l: t.songs, c: '#00cfff' },
          { v: namedPlaylists.length, l: t.playlists, c: '#a855f7' },
          { v: (likes||[]).length, l: t.likes, c: '#ef4444' },
          { v: playlist.length, l: t.quickPl || 'Ātrā pl.', c: '#10b981' },
        ].map((st, i) => (
          <View key={i} style={[s.stat, { borderTopColor: st.c }]}>
            <Text style={[s.statV, { color: st.c }]}>{st.v}</Text>
            <Text style={s.statL}>{st.l}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={s.sectionLabel}>{t.settings?.toUpperCase() || 'IESTATĪJUMI'}</Text>

        <TouchableOpacity style={s.menuItem} onPress={() => { setNickEdit(profileData.nick || ''); setShowEditProfile(true); }}>
          <Ionicons name="person-outline" size={19} color="#00cfff" />
          <Text style={s.menuTxt}>{t.editProfile}</Text>
          <Ionicons name="chevron-forward" size={15} color="#333" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => setShowLang(true)}>
          <Ionicons name="globe-outline" size={19} color="#00cfff" />
          <Text style={s.menuTxt}>{t.changeLanguage}</Text>
          <Text style={{ color: '#00cfff', fontSize: 12, marginLeft: 'auto' }}>
            {LANGS.find(l => l.code === lang)?.flag} {LANGS.find(l => l.code === lang)?.name}
          </Text>
          <Ionicons name="chevron-forward" size={15} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => { setPwErr(''); setPwOk(''); setShowPw(true); }}>
          <Ionicons name="lock-closed-outline" size={19} color="#00cfff" />
          <Text style={s.menuTxt}>{t.changePw}</Text>
          <Ionicons name="chevron-forward" size={15} color="#333" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.menuItem, { borderColor: '#ff446633', borderWidth: 1 }]}
          onPress={() => Alert.alert(t.logoutConfirmTitle, t.logoutConfirmMsg, [
            { text: t.stay, style: 'cancel' },
            { text: t.logoutBtn, style: 'destructive', onPress: logout },
          ])}
        >
          <Ionicons name="log-out-outline" size={19} color="#ef4444" />
          <Text style={[s.menuTxt, { color: '#ef4444' }]}>{t.logout}</Text>
          <Ionicons name="chevron-forward" size={15} color="#333" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setShowEditProfile(false)} activeOpacity={1}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{t.editProfile}</Text>
            <Text style={s.modalLabel}>{t.nickLabel}</Text>
            <TextInput style={s.modalInput} placeholder={user?.username} placeholderTextColor="#333" value={nickEdit} onChangeText={setNickEdit} autoCapitalize="none" autoFocus />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEditProfile(false)}>
                <Text style={{ color: '#555', fontWeight: '700' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.okBtn} onPress={async () => { await saveProfile({ nick: nickEdit.trim() }); setShowEditProfile(false); }}>
                <Text style={{ color: '#000', fontWeight: '800' }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLang} transparent animationType="fade">
        <TouchableOpacity style={s.overlay} onPress={() => setShowLang(false)} activeOpacity={1}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{t.changeLanguage}</Text>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} style={[s.langOpt, lang === l.code && s.langOptActive]} onPress={() => { setLang(l.code); setShowLang(false); }}>
                <Text style={{ fontSize: 24 }}>{l.flag}</Text>
                <Text style={[s.langName, lang === l.code && { color: '#00cfff' }]}>{l.name}</Text>
                {lang === l.code && <Ionicons name="checkmark" size={16} color="#00cfff" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPw} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setShowPw(false)} activeOpacity={1}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>🔒 {t.changePw}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput style={[s.modalInput, { flex: 1, marginBottom: 0 }]} placeholder={t.curPw} placeholderTextColor="#333" value={curPw} onChangeText={setCurPw} secureTextEntry={!pwVisible} />
              <TouchableOpacity onPress={() => setPwVisible(v => !v)} style={{ padding: 8 }}>
                <Ionicons name={pwVisible ? 'eye-off' : 'eye'} size={18} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput style={s.modalInput} placeholder={t.newPw} placeholderTextColor="#333" value={newPw} onChangeText={setNewPw} secureTextEntry={!pwVisible} />
            <TextInput style={s.modalInput} placeholder={t.repPw} placeholderTextColor="#333" value={repPw} onChangeText={setRepPw} secureTextEntry={!pwVisible} />
            {!!pwErr && <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{pwErr}</Text>}
            {!!pwOk && <Text style={{ color: '#22c55e', fontSize: 12, marginBottom: 8 }}>{pwOk}</Text>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowPw(false)}>
                <Text style={{ color: '#555', fontWeight: '700' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.okBtn} onPress={changePw}>
                <Text style={{ color: '#000', fontWeight: '800' }}>{t.changePwBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#111118' },
  title: { fontSize: 22, fontWeight: '800', color: '#00cfff' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#00cfff' },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111118', borderWidth: 2, borderColor: '#00cfff', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: '#00cfff' },
  camBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#00cfff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0a0a0f' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  username: { color: '#444', fontSize: 12, marginBottom: 8 },
  badge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: '#00cfff22', borderWidth: 1, borderColor: '#00cfff44' },
  badgeTxt: { fontSize: 12, fontWeight: '600', color: '#00cfff' },
  stats: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: '#111118', borderRadius: 12, padding: 10, alignItems: 'center', borderTopWidth: 2, gap: 3 },
  statV: { fontSize: 18, fontWeight: '900' },
  statL: { color: '#444', fontSize: 9, fontWeight: '600' },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#333', letterSpacing: 1.5, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111118', borderRadius: 14, padding: 15, marginBottom: 10 },
  menuTxt: { flex: 1, color: '#ccc', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#111118', borderRadius: 20, padding: 20, width: '88%', gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#00cfff' },
  modalLabel: { color: '#555', fontSize: 12, fontWeight: '600', marginBottom: -6 },
  modalInput: { backgroundColor: '#0a0a0f', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1e1e2a' },
  cancelBtn: { flex: 1, backgroundColor: '#1a1a25', borderRadius: 12, padding: 12, alignItems: 'center' },
  okBtn: { flex: 1, backgroundColor: '#00cfff', borderRadius: 12, padding: 12, alignItems: 'center' },
  langOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10 },
  langOptActive: { backgroundColor: '#00cfff11' },
  langName: { flex: 1, color: '#888', fontSize: 15 },
});
